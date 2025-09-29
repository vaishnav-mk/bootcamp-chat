import { ErrorMessage } from "@/constants/errors";
import { WebSocketEvent } from "@/constants/enums";
import { editMessage } from "@/services/messageService";
import { serializeMessage } from "@/utils/serialization";
import { AuthenticatedSocket, WebSocketHandler, EditMessageData } from "@/types";

const messageEditHandler: WebSocketHandler = {
  name: WebSocketEvent.MESSAGE_EDIT,
  handler: async ({ socket, data, callback, io }) => {
    try {
      if (!socket.userId) {
        throw new Error(ErrorMessage.UNAUTHORIZED);
      }

      const message = await editMessage(socket.userId, data);
      const serializedMessage = serializeMessage(message);
      io.to(`conversation:${serializedMessage.conversationId}`).emit(WebSocketEvent.MESSAGE_EDITED, serializedMessage);
      
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