export const apiGatewayManagementApi = {};
export const dynamodbDocumentClient = {
  put: jest.fn().mockReturnValue({
    promise: jest.fn().mockResolvedValue(undefined),
  }),
};
