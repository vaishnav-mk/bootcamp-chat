import { ErrorMessage } from "@/constants/errors";
import { 
  editMessage,
  EditMessageData 
} from "@/services/messageService";
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
      io.to(`conversation:${message.conversationId}`).emit('message_edited', message);
      
      if (callback) {
        callback({ success: true, message });
      }
    } catch (error: any) {
      if (callback) {
        callback({ success: false, error: error.message });
      }
    }
  }
};

export default messageEditHandler;