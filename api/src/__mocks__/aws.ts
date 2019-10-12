export const apiGatewayManagementApi = {};

export const dynamodbDocumentClient = {
  put: jest.fn().mockReturnValue({
    promise: jest.fn().mockResolvedValue(undefined),
  }),
  get: jest.fn().mockReturnValue({
    promise: jest.fn().mockResolvedValue({ Item: {} }),
  }),
  delete: jest.fn().mockReturnValue({
    promise: jest.fn().mockResolvedValue({ Attributes: {} }),
  }),
  query: jest.fn().mockReturnValue({
    promise: jest.fn().mockResolvedValue({ Items: [] }),
  }),
};
