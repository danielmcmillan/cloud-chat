import { APIGatewayProxyHandler } from "aws-lambda";
import * as AWS from "aws-sdk";
import "source-map-support/register";

export const handler: APIGatewayProxyHandler = async (event, _context) => {
  const dbOptions = process.env.IS_OFFLINE
    ? {
        region: "localhost",
        endpoint: "http://localhost:8000",
      }
    : undefined;
  const dc = new AWS.DynamoDB.DocumentClient(dbOptions);
  const table = await dc
    .scan({
      TableName: process.env.TABLE_NAME,
    })
    .promise();
  const gwOptions = process.env.IS_OFFLINE
    ? {
        region: "localhost",
        endpoint: "http://localhost:3001",
      }
    : {
        endpoint: `${event.requestContext.domainName}/${event.requestContext.stage}`,
      };
  const apigw = new AWS.ApiGatewayManagementApi(gwOptions);
  const data = JSON.parse(event.body).data;

  const promises = table.Items.map(async (item) => {
    const connectionId = item.pk;
    try {
      console.debug(`Echoing to connection ${connectionId}`);
      await apigw
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
