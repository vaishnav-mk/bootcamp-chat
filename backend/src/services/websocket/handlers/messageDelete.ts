import { ErrorMessage } from "@/constants/errors";
import { deleteMessage } from "@/services/messageService";
import { AuthenticatedSocket, WebSocketHandler } from "@/types";

const messageDeleteHandler: WebSocketHandler = {
  name: "message_delete",
  handler: async ({ socket, data, callback }) => {
    try {
      if (!socket.userId) {
        throw new Error(ErrorMessage.UNAUTHORIZED);
      }

      const result = await deleteMessage(socket.userId, data.message_id);
      socket.broadcast.emit('message_deleted', result);
      
      if (callback) {
        callback({ success: true, result });
      }
    } catch (error: any) {
      if (callback) {
        callback({ success: false, error: error.message });
      }
    }
  }
};

export default messageDeleteHandler;