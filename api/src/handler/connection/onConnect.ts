import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import * as Subscription from "../../model/subscription";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
  const { connectionId } = event.requestContext;
  if (connectionId) {
    console.debug(`Connection id: ${connectionId}`);
  } else {
    console.debug("No connection id");
  }

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

  return {
    statusCode: 200,
    body: "",
  };
};
