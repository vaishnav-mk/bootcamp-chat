import { ErrorMessage } from "@/constants/errors";
import { 
  editMessage,
  EditMessageData 
} from "@/services/messageService";
import { serializeMessage } from "@/utils/serialization";
import { AuthenticatedSocket, WebSocketHandler } from "../types";

const messageEditHandler: WebSocketHandler = {
  name: "message_edit",
  handler: async ({ socket, data, callback, io }: {
    socket: AuthenticatedSocket;
    data: EditMessageData;
    callback?: any;
    io: any;
  }) => {
    try {
      if (!socket.userId) {
        throw new Error(ErrorMessage.UNAUTHORIZED);
      }

      const message = await editMessage(socket.userId, data);
      const serializedMessage = serializeMessage(message);
      io.to(`conversation:${serializedMessage.conversationId}`).emit('message_edited', serializedMessage);
      
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

export default messageEditHandler;