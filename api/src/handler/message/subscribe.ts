import "source-map-support/register";
import { Subscription } from "../../db/subscription";
import { createWebsocketHandler } from "../createWebsocketHandler";
import { ISubscribeAction } from "../../ws/actions";
import { sendMessage } from "../../ws/send";
import { makeRoomStateMessage } from "../../ws/responses";

export const handler = createWebsocketHandler<ISubscribeAction>(
  async ({ connectionId, payload }) => {
    const subscription = await Subscription.createSubscription({
      connectionId,
      roomName: payload.roomName,
      userName: payload.userName,
    });
    await sendMessage(connectionId, makeRoomStateMessage(subscription.roomName));
  },
  () => ({}), // always validate successfully
);
