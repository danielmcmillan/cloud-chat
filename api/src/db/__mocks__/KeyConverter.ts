export class KeyConverter {
  public static mockMakeKey = jest
    .fn()
    .mockImplementation((keyAttribute: any, item: any) => ({ [`mock_${keyAttribute}`]: item }));
  public makeKey = KeyConverter.mockMakeKey;

  public static mockParseKey = jest
    .fn()
    .mockImplementation((keyAttribute: any, keyValue: any) => ({
      [`mock_${keyAttribute}`]: keyValue,
    }));
  public parseKey = KeyConverter.mockParseKey;

  public static mockMarshallItem = jest.fn().mockImplementation((item: any) => ({
    mockMarshalled: item,
  }));
  public marshallItem = KeyConverter.mockMarshallItem;

  public static mockUnmarshallItem = jest
    .fn()
    .mockImplementation((item: any) => ({ mockUnmarshalled: item }));
  public unmarshallItem = KeyConverter.mockUnmarshallItem;
}
