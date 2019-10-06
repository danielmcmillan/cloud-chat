import { KeyConverter } from "./KeyConverter";

describe("KeyConverter", () => {
  const mockItem = {
    id: "abc",
    name: "A",
  };

  const getConverter = (config?) =>
    new KeyConverter({
      pk: [],
      sk: [],
      data: [],
      ...config,
    });

  describe("makeKey", () => {
    it("should support single literal part", () => {
      const converter = getConverter({
        pk: [{ literal: "Partition" }],
      });
      expect(converter.makeKey("pk", mockItem)).toBe("Partition");
    });

    it("should support single attribute part", () => {
      const converter = getConverter({
        sk: [{ attribute: "id" }],
      });
      expect(converter.makeKey("sk", mockItem)).toBe(mockItem.id);
    });

    it("should support unused attribute", () => {
      const converter = getConverter({
        sk: [],
      });
      expect(converter.makeKey("sk", mockItem)).toBe("");
    });

    it("should support multiple parts", () => {
      const converter = getConverter({
        pk: [
          { literal: "Partition" },
          { attribute: "id" },
          { literal: "x" },
          { attribute: "name" },
        ],
      });
      expect(converter.makeKey("pk", mockItem)).toBe(`Partition|${mockItem.id}|x|${mockItem.name}`);
    });
  });

  describe("parseKey", () => {
    it("should parse key with no attribute", () => {
      const converter = getConverter({
        pk: [{ literal: "Partition" }],
        sk: [],
      });
      expect(converter.parseKey("pk", "Partition")).toEqual({});
      expect(converter.parseKey("sk", "Partition")).toEqual({});
    });

    it("should parse key with attributes", () => {
      const converter = getConverter({
        pk: [
          { literal: "Partition" },
          { attribute: "id" },
          { literal: "x" },
          { attribute: "name" },
        ],
      });
      expect(converter.parseKey("pk", "Partition|xyz|x|X")).toEqual({
        id: "xyz",
        name: "X",
      });
    });

    it("should skip missing key parts", () => {
      const converter = getConverter({
        pk: [{ attribute: "id" }, { attribute: "name" }],
      });
      expect(converter.parseKey("pk", "xyz")).toEqual({
        id: "xyz",
      });
    });
  });

  describe("marshallItem", () => {
    it("should make all keys and keep only needed attributes", () => {
      const converter = getConverter({
        pk: [{ literal: "Partition" }, { attribute: "name" }],
        sk: [{ literal: "sk" }],
        data: [{ literal: "data" }],
      });
      expect(converter.marshallItem(mockItem)).toEqual({
        pk: `Partition|${mockItem.name}`,
        sk: "sk",
        data: "data",
        id: mockItem.id,
      });
    });

    it("should support attributes references multiple times", () => {
      const converter = getConverter({
        pk: [{ attribute: "name" }],
        sk: [{ attribute: "name" }, { attribute: "id" }],
        data: [{ attribute: "name" }],
      });
      expect(converter.marshallItem(mockItem)).toEqual({
        pk: mockItem.name,
        sk: `${mockItem.name}|${mockItem.id}`,
        data: mockItem.name,
      });
    });

    it("should support item attribute with same name as key attribute", () => {
      const converter = getConverter({
        data: [{ literal: "Partition" }, { attribute: "data" }],
      });
      expect(converter.marshallItem({ data: "123" })).toEqual({
        sk: "",
        pk: "",
        data: `Partition|123`,
      });
    });
  });

  describe("unmarshallItem", () => {
    it("should remove keys and extract attributes from them", () => {
      const converter = getConverter({
        pk: [{ attribute: "id" }],
        sk: [{ attribute: "name" }],
        data: [{ literal: "data" }],
      });
      expect(
        converter.unmarshallItem({
          pk: mockItem.id,
          sk: mockItem.name,
          data: "data",
        }),
      ).toEqual(mockItem);
    });

    it("should support attributes references multiple times", () => {
      const converter = getConverter({
        pk: [{ attribute: "name" }],
        sk: [{ attribute: "name" }, { attribute: "id" }],
        data: [{ attribute: "name" }],
      });
      expect(
        converter.unmarshallItem({
          pk: mockItem.name,
          sk: `${mockItem.name}|${mockItem.id}`,
          data: mockItem.name,
        }),
      ).toEqual(mockItem);
    });

    it("should support item attribute with same name as key attribute", () => {
      const converter = getConverter({
        data: [{ literal: "Partition" }, { attribute: "data" }],
      });
      expect(
        converter.unmarshallItem({
          sk: "",
          pk: "",
          data: `Partition|123`,
        }),
      ).toEqual({
        data: "123",
      });
    });
  });
});
