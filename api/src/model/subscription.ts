import { dynamodbDocumentClient as dynamodb } from "../aws";
import { config } from "../config";
import { KeyConverter } from "../db/KeyConverter";

export interface ISubscription {
  roomName: string;
  connectionId: string;
  userName: string;
}

const converter = new KeyConverter<ISubscription>({
  pk: [{ literal: "Subscription" }, { attribute: "roomName" }],
  sk: [{ attribute: "connectionId" }],
  data: [{ attribute: "connectionId" }],
});

export const createSubscription = async (params: ISubscription): Promise<ISubscription> => {
  await dynamodb
    .put({
      TableName: config.tableName,
      Item: converter.marshallItem(params),
    })
    .promise();

  return params;
};

export const getSubscription = async (
  roomName: string,
  connectionId: string,
): Promise<ISubscription> => {
  const result = await dynamodb
    .get({
      TableName: config.tableName,
      Key: {
        pk: converter.makeKey("pk", { roomName }),
        sk: converter.makeKey("sk", { connectionId }),
      },
    })
    .promise();

  return converter.unmarshallItem(result.Item);
};

export const deleteSubscription = async (roomName: string, connectionId: string): Promise<void> => {
  await dynamodb
    .delete({
      TableName: config.tableName,
      Key: {
        pk: converter.makeKey("pk", { roomName }),
        sk: converter.makeKey("sk", { connectionId }),
      },
      ReturnValues: "NONE",
    })
    .promise();
};

export const getSubscriptionsForRoom = async (roomName: string): Promise<ISubscription[]> => {
  const result = await dynamodb
    .query({
      TableName: config.tableName,
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: { ":pk": converter.makeKey("pk", { roomName }) },
    })
    .promise();

  return result.Items.map(converter.unmarshallItem);
};

export const getSubscriptionsForConnection = async (
  connectionId: string,
): Promise<ISubscription[]> => {
  // const result = await dynamodb
  //   .query({
  //     TableName: config.tableName,
  //     IndexName: "index",
  //     KeyConditionExpression: "sk = :sk",
  //     ExpressionAttributeValues: { ":sk": converter.makeKey("sk", { connectionId }) },
  //   })
  //   .promise();

  // return result.Items.map(converter.unmarshallItem);
  return [];
};

export const deleteSubscriptionsForConnection = async (
  connectionId: string,
): Promise<ISubscription[]> => {
  return [];
};
