import { dynamodbDocumentClient as dynamodb } from "../aws";
import {
  createSubscription,
  ISubscription,
  getSubscription,
  deleteSubscription,
  getSubscriptionsForRoom,
} from "./subscription";

jest.mock("../config");
jest.mock("../aws");
jest.mock("../db/KeyConverter");

const mockSubscription: ISubscription = {
  connectionId: "abc",
  roomName: "room",
  userName: "user",
};

describe("subscription model", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createSubscription", () => {
    it("should put in table", async () => {
      const result = await createSubscription(mockSubscription);

      expect(dynamodb.put).toHaveBeenCalledWith({
        TableName: "test-table-name",
        Item: {
          mockMarshalled: mockSubscription,
        },
      });
      expect(result).toEqual(mockSubscription);
    });
  });

  describe("getSubscription", () => {
    it("should get from table", async () => {
      (dynamodb.get as jest.Mock).mockReturnValue({
        promise: () =>
          Promise.resolve({
            Item: mockSubscription,
          }),
      });
      const result = await getSubscription(
        mockSubscription.roomName,
        mockSubscription.connectionId,
      );

      expect(dynamodb.get).toHaveBeenCalledWith({
        TableName: "test-table-name",
        Key: {
          pk: { mock_pk: { roomName: mockSubscription.roomName } },
          sk: { mock_sk: { connectionId: mockSubscription.connectionId } },
        },
      });
      expect(result).toEqual({ mockUnmarshalled: mockSubscription });
    });
  });

  describe("deleteSubscription", () => {
    it("should delete from table", async () => {
      (dynamodb.delete as jest.Mock).mockReturnValue({
        promise: () =>
          Promise.resolve({
            Attributes: mockSubscription,
          }),
      });
      const result = await deleteSubscription(
        mockSubscription.roomName,
        mockSubscription.connectionId,
      );

      expect(dynamodb.delete).toHaveBeenCalledWith({
        TableName: "test-table-name",
        Key: {
          pk: { mock_pk: { roomName: mockSubscription.roomName } },
          sk: { mock_sk: { connectionId: mockSubscription.connectionId } },
        },
        ReturnValues: "NONE",
      });
      expect(result).toBeUndefined();
    });
  });

  describe("getSubscriptionsForRoom", () => {
    it("should query from table", async () => {
      (dynamodb.query as jest.Mock).mockReturnValue({
        promise: () =>
          Promise.resolve({
            Items: [mockSubscription],
          }),
      });
      const result = await getSubscriptionsForRoom(mockSubscription.roomName);

      expect(dynamodb.query).toHaveBeenCalledWith({
        TableName: "test-table-name",
        KeyConditionExpression: "pk = :pk",
        ExpressionAttributeValues: { ":pk": { mock_pk: { roomName: mockSubscription.roomName } } },
      });
      expect(result).toEqual([{ mockUnmarshalled: mockSubscription }]);
    });
  });
});
