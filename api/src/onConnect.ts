import * as AWS from "aws-sdk";
import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
  const { connectionId } = event.requestContext;
  if (connectionId) {
    console.debug(`Connection id: ${connectionId}`);
  } else {
    console.debug("No connection id");
  }

  // Test put in Dynamodb
  const options = process.env.IS_OFFLINE
    ? {
        region: "localhost",
        endpoint: "http://localhost:8000",
      }
    : undefined;
  const dc = new AWS.DynamoDB.DocumentClient(options);
  try {
    await dc
      .put({
        TableName: process.env.TABLE_NAME,
        Item: {
          pk: connectionId,
        },
      })
      .promise();
    console.info(`Successfully put in db`);
  } catch (err) {
    console.error(`Failed to put in db: ${err.message}`);
  }

  return {
    statusCode: 200,
    body: ''
  };
};
