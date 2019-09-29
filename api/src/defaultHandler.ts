import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
  console.log("default message handler event", event);
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        input: event
      },
      null,
      2
    )
  };
};
