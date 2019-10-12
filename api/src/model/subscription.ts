import { dynamodbDocumentClient as dynamodb } from "../aws";
import { config } from "../config";
import { KeyConverter } from "../db/KeyConverter";

export interface ISubscription {
  roomName: string;
  connectionId: string;
  userName: string;
}

const dataSkIndex = "DataSkIndex";
const converter = new KeyConverter<ISubscription>({
  pk: [{ literal: "Subscription" }, { attribute: "roomName" }],
  sk: [{ attribute: "roomName" }, { attribute: "connectionId" }],
  data: [{ attribute: "connectionId" }],
});

export class Subscription {
  public static async createSubscription(params: ISubscription): Promise<ISubscription> {
    await dynamodb
      .put({
        TableName: config.tableName,
        Item: converter.marshallItem(params),
      })
      .promise();

    return params;
  }

  public static async getSubscription(
    roomName: string,
    connectionId: string,
  ): Promise<ISubscription> {
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
  }

  public static async deleteSubscription(roomName: string, connectionId: string): Promise<void> {
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
  }

  public static async getSubscriptionsForRoom(roomName: string): Promise<ISubscription[]> {
    const result = await dynamodb
      .query({
        TableName: config.tableName,
        KeyConditionExpression: "pk = :pk",
        ExpressionAttributeValues: { ":pk": converter.makeKey("pk", { roomName }) },
      })
      .promise();

    return result.Items.map(converter.unmarshallItem);
  }

  public static async getSubscriptionsForConnection(
    connectionId: string,
  ): Promise<ISubscription[]> {
    const result = await dynamodb
      .query({
        TableName: config.tableName,
        IndexName: dataSkIndex,
        ExpressionAttributeNames: {
          "#data": "data",
        },
        ExpressionAttributeValues: { ":data": converter.makeKey("data", { connectionId }) },
        KeyConditionExpression: "#data = :data",
      })
      .promise();

    return result.Items.map(converter.unmarshallItem);
  }

  public static async deleteSubscriptionsForConnection(
    connectionId: string,
  ): Promise<ISubscription[]> {
    const subscriptions = await Subscription.getSubscriptionsForConnection(connectionId);
    await Promise.all(
      subscriptions.map((subscription) => {
        return Subscription.deleteSubscription(subscription.roomName, subscription.connectionId);
      }),
    );

    return subscriptions;
  }
}
