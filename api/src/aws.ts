import * as AWS from "aws-sdk";
import { config } from "./config";

AWS.config.apiVersions = {
  apigatewaymanagementapi: "2018-11-29",
  dynamodb: "2012-08-10",
};

AWS.config.apigatewaymanagementapi = config.isOffline
  ? {
      region: "localhost",
      endpoint: "http://localhost:3001",
    }
  : {
      endpoint: `${config.apiId}.execute-api.${config.region}.amazonaws.com/${config.stage}`,
    };
export const apiGatewayManagementApi = new AWS.ApiGatewayManagementApi();

AWS.config.dynamodb = config.isOffline
  ? {
      region: "localhost",
      endpoint: "http://localhost:8000",
    }
  : undefined;
export const dynamodbDocumentClient = new AWS.DynamoDB.DocumentClient();
