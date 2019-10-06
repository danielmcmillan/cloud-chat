import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import {
  apiGatewayManagementApi as apiGateway,
  dynamodbDocumentClient as dynamodb,
} from "../../aws";
import { config } from "../../config";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
  const table = await dynamodb
    .scan({
      TableName: config.tableName,
    })
    .promise();

  const data = JSON.parse(event.body).data;

  const promises = table.Items.map(async (item) => {
    const connectionId = item.pk;
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
