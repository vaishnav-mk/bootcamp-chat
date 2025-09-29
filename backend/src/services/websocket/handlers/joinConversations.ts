import { verifyUserInConversation } from "@/services/messageService";
import { AuthenticatedSocket, WebSocketHandler } from "../types";

const joinConversationsHandler: WebSocketHandler = {
  name: "join_conversations",
  handler: async ({ socket, data }: {
    socket: AuthenticatedSocket;
    data: string[];
  }) => {
    if (!socket.userId) return;

    for (const conversationId of data) {
      const isMember = await verifyUserInConversation(socket.userId, conversationId);
      if (isMember) {
        socket.join(`conversation:${conversationId}`);
      }
    }
  }
};

export default joinConversationsHandler;