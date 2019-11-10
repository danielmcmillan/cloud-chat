/**
 * Module containing functions for sending messages to WebSocket connections.
 */
import { apiGatewayManagementApi as apiGateway } from "../aws";
import { Subscription } from "../db/subscription";

export const sendMessage = async (connectionId: string, message: object): Promise<void> => {
  await apiGateway
    .postToConnection({
      ConnectionId: connectionId,
      Data: JSON.stringify(message),
    })
    .promise();
};

export const broadcastMessage = async (roomName: string, message: object): Promise<void> => {
  const subscriptions = await Subscription.getSubscriptionsForRoom(roomName);
  await Promise.all(subscriptions.map(({ connectionId }) => sendMessage(connectionId, message)));
};
