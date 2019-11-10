import "source-map-support/register";
import { Subscription } from "../../db/subscription";
import { createWebsocketHandler } from "../createWebsocketHandler";
import { ISendMessageAction } from "../../ws/actions";
import { broadcastMessage } from "../../ws/send";
import { makeMessageReceivedMessage } from "../../ws/responses";

export const handler = createWebsocketHandler<ISendMessageAction>(
  async ({ connectionId, payload }) => {
    const subscription = await Subscription.getSubscription(payload.roomName, connectionId);
    if (!subscription) {
      throw new Error("Must be subscribed to a room to send messages to it");
    }
    // TODO create message record
    await broadcastMessage(
      subscription.roomName,
      makeMessageReceivedMessage(subscription.roomName, {
        message: payload.message,
        userName: subscription.userName,
        time: Date.now(),
      }),
    );
  },
  () => ({}), // always validate successfully
);
