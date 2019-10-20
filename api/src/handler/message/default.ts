import "source-map-support/register";
import { apiGatewayManagementApi as apiGateway } from "../../aws";
import { Subscription } from "../../db/subscription";
import { createWebsocketHandler, PayloadValidator } from "../createWebsocketHandler";

interface Payload {
  data: any;
}

const validator: PayloadValidator = (payload) => ({
  error: typeof payload.data === "string" ? undefined : "data must be a string",
});

export const handler = createWebsocketHandler<Payload>(async ({ payload }) => {
  const subscriptions = await Subscription.getSubscriptionsForRoom("room");

  const promises = subscriptions.map(async (subscription) => {
    const { connectionId } = subscription;
    try {
      console.debug(`Echoing to connection ${connectionId}`);
      await apiGateway
        .postToConnection({
          ConnectionId: connectionId,
          Data: payload.data,
        })
        .promise();
    } catch (err) {
      if (err.statusCode === 410) {
        // Connection no longer exists
        console.warn(`Deleting stale connection ${connectionId}`);
        console.error("Not implemented");
      } else {
        console.error(
          `Failed to post to connection ${connectionId}. Error: ${JSON.stringify(err)}`,
        );
        throw err;
      }
    }
  });
  await Promise.all(promises);
}, validator);
