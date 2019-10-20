import "source-map-support/register";
import { Subscription } from "../../db/subscription";
import { createWebsocketHandler } from "../createWebsocketHandler";

export const handler = createWebsocketHandler(async ({ connectionId }) => {
  try {
    await Subscription.createSubscription({
      connectionId,
      roomName: "room",
      userName: "user",
    });
    console.info(`Successfully put in db`);
  } catch (err) {
    console.error(`Failed to put in db: ${err.message}`);
  }
});
