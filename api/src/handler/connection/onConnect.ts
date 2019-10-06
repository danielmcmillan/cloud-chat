import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import { dynamodbDocumentClient as dynamodb } from "../../aws";
import { config } from "../../config";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
  const { connectionId } = event.requestContext;
  if (connectionId) {
    console.debug(`Connection id: ${connectionId}`);
  } else {
    console.debug("No connection id");
  }

  // Test put in Dynamodb
  try {
    await dynamodb
      .put({
        TableName: config.tableName,
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
    body: "",
  };
};
