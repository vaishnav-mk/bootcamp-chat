import { WebSocketService } from "@/services/websocketService";

let wsServiceInstance: WebSocketService | null = null;

export const setWebSocketService = (service: WebSocketService) => {
  wsServiceInstance = service;
};

export const getWebSocketService = (): WebSocketService | null => {
  return wsServiceInstance;
};