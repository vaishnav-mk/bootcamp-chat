import { geminiService } from "@/services/geminiService";
import { createMessage, getConversationMessages } from "@/services/messageService";
import { ConversationType } from "@/constants/enums";
import { getWebSocketService } from "@/services/wsServiceInstance";
import { WebSocketEvent } from "@/constants/enums";
import { getLLMAssistantId } from "@/services/llmAssistantUser";
import { serializeBigInt } from "@/utils/serialization";

interface ConversationDetails {
  id: string;
  type: string;
}

export async function handleLLMResponse(
  conversationId: string, 
  conversationDetails: ConversationDetails,
  userMessage: string
): Promise<void> {
  if (conversationDetails.type !== ConversationType.LLM) {
    return;
  }

  if (!geminiService.isAvailable()) {
    return;
  }

  try {
    const recentMessages = await getConversationMessages(conversationId, 10, 0);
    const assistantId = await getLLMAssistantId();

    const conversationHistory = recentMessages
      .slice(-9)
      .map(msg => {
        const isAssistant = msg.senderId === assistantId;
        return {
          role: isAssistant ? 'assistant' : 'user',
          content: msg.content
        };
      });

    let fullResponse = '';
    const wsService = getWebSocketService();

    for await (const chunk of geminiService.generateStreamingResponse(userMessage, conversationHistory)) {
      fullResponse += chunk;
      
      if (wsService) {
        wsService.sendToConversation(conversationId, WebSocketEvent.MESSAGE_STREAM_CHUNK, {
          chunk,
          senderId: assistantId,
          conversationId
        });
      }
    }

    const responseMessage = await createMessage(assistantId, {
      conversation_id: conversationId,
      content: fullResponse,
      message_type: 'text',
      metadata: {
        isLLMResponse: true,
        timestamp: new Date().toISOString()
      }
    });

    if (wsService && responseMessage) {
      wsService.sendToConversation(conversationId, WebSocketEvent.MESSAGE_STREAM_END, {
        message: serializeBigInt(responseMessage)
      });
    }

  } catch (error) {
    console.error("Error generating LLM response:", error);
    
    try {
      const assistantId = await getLLMAssistantId();
      const errorMessage = await createMessage(assistantId, {
        conversation_id: conversationId,
        content: "I'm sorry, I encountered an error while processing your message. Please try again.",
        message_type: 'text',
        metadata: {
          isLLMResponse: true,
          isError: true,
          timestamp: new Date().toISOString()
        }
      });

      const wsService = getWebSocketService();
      if (wsService && errorMessage) {
        wsService.sendToConversation(conversationId, WebSocketEvent.MESSAGE_CREATED, {
          message: serializeBigInt(errorMessage)
        });
      }
    } catch (errorMsgError) {
      console.error("Failed to send error message:", errorMsgError);
    }
  }
}