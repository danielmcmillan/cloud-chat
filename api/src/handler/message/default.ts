import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import { apiGatewayManagementApi as apiGateway } from "../../aws";
import * as Subscription from "../../model/subscription";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
  const subscriptions = await Subscription.getSubscriptionsForRoom("room");
  const data = JSON.parse(event.body).data;

  const promises = subscriptions.map(async (subscription) => {
    const { connectionId } = subscription;
    try {
      console.debug(`Echoing to connection ${connectionId}`);
      await apiGateway
        .postToConnection({
          ConnectionId: connectionId,
          Data: data,
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

  return {
    statusCode: 200,
    body: "",
  };
};
