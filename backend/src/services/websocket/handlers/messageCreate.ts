import { ErrorMessage } from "@/constants/errors";
import { WebSocketEvent } from "@/constants/enums";
import { 
  createMessage, 
  verifyUserInConversation
} from "@/services/messageService";
import { serializeMessage } from "@/utils/serialization";
import { AuthenticatedSocket, WebSocketHandler, CreateMessageData } from "@/types";
import { handleLLMResponse } from "@/services/llmHandler";
import * as conversationService from "@/services/conversationService";

const messageCreateHandler: WebSocketHandler = {
  name: WebSocketEvent.MESSAGE_CREATE,
  handler: async ({ socket, data, callback, io }) => {
    try {
      // Validate required fields
      if (!data.sender_id || !data.conversation_id || !data.content) {
        throw new Error("Missing required fields: sender_id, conversation_id, or content");
      }

      const isUserInConversation = await verifyUserInConversation(data.sender_id, data.conversation_id);
      if (!isUserInConversation) {
        throw new Error(ErrorMessage.UNAUTHORIZED);
      }

      const message = await createMessage(
        data.sender_id,
        {
          conversation_id: data.conversation_id,
          content: data.content,
          message_type: data.message_type || 'text'
        }
      );

      const serializedMessage = serializeMessage(message);
      
      io.to(`conversation:${data.conversation_id}`).emit(WebSocketEvent.MESSAGE_CREATED, serializedMessage);
      
      try {
        const conversation = await conversationService.fetchConversationById(data.conversation_id);
        if (conversation) {
          handleLLMResponse(data.conversation_id, {
            id: conversation.id.toString(),
            type: conversation.type
          }, data.content).catch(error => {
            console.error("LLM response handling failed:", error);
          });
        }
      } catch (error) {
        console.error("Error checking conversation type for LLM response:", error);
      }
      
      if (callback) {
        callback({ success: true, message: serializedMessage });
      }
    } catch (error: any) {
      if (callback) {
        callback({ success: false, error: error.message });
      }
    }
  }
};

export default messageCreateHandler;