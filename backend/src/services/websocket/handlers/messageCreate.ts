import { ErrorMessage } from "@/constants/errors";
import { 
  createMessage, 
  verifyUserInConversation,
  CreateMessageData 
} from "@/services/messageService";
import { serializeMessage } from "@/utils/serialization";
import { AuthenticatedSocket, WebSocketHandler } from "../types";

const messageCreateHandler: WebSocketHandler = {
  name: "message_create",
  handler: async ({ socket, data, callback, io }: {
    socket: AuthenticatedSocket;
    data: CreateMessageData;
    callback?: any;
    io: any;
  }) => {
    console.log("message_create event received with data:", data);
    try {
      if (!socket.userId) {
        throw new Error(ErrorMessage.UNAUTHORIZED);
      }

      const isMember = await verifyUserInConversation(socket.userId, data.conversation_id);
      if (!isMember) {
        throw new Error(ErrorMessage.NOT_IN_CONVERSATION);
      }

      const message = await createMessage(socket.userId, data);
      const serializedMessage = serializeMessage(message);
      io.to(`conversation:${data.conversation_id}`).emit('message_created', serializedMessage);
      
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