import { ErrorMessage } from "@/constants/errors";
import { WebSocketEvent } from "@/constants/enums";
import { deleteMessage } from "@/services/messageService";
import { AuthenticatedSocket, WebSocketHandler } from "@/types";

const messageDeleteHandler: WebSocketHandler = {
  name: WebSocketEvent.MESSAGE_DELETE,
  handler: async ({ socket, data, callback }) => {
    try {
      if (!socket.userId) {
        throw new Error(ErrorMessage.UNAUTHORIZED);
      }

      const result = await deleteMessage(socket.userId, data.message_id);
      socket.broadcast.emit(WebSocketEvent.MESSAGE_DELETED, result);
      
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