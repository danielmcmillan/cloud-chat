import { dynamodbDocumentClient as dynamodb } from "../aws";
import { createSubscription, ISubscription } from "./subscription";

jest.mock("../config");
jest.mock("../aws");

const mockSubscription: ISubscription = {
  connectionId: "abc",
  roomName: "room",
  userName: "user",
};

describe("subscription model", () => {
  describe("createSubscription", () => {
    it("should put in table", async () => {
      const result = await createSubscription(mockSubscription);

      expect(dynamodb.put).toHaveBeenCalledWith({
        TableName: "test-table-name",
        Item: {
          pk: "Subscription|room",
          sk: "abc",
          data: "abc",
          userName: "user",
        },
      });
      expect(result).toEqual(mockSubscription);
    });
  });
});
