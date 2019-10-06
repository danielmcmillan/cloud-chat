import * as R from "ramda";

export type EntityConfig<A> = Record<KeyAttribute, AttributeConfig<A>>;

type LiteralKeyPartDefinition = { literal: string };
type AttributeKeyPartDefinition<A> = { attribute: A };
type KeyPartDefinition<A> = LiteralKeyPartDefinition | AttributeKeyPartDefinition<A>;
type AttributeConfig<A> = Array<KeyPartDefinition<A>>;
type KeyAttribute = "pk" | "sk" | "data";
const keyAttributes: KeyAttribute[] = ["pk", "sk", "data"];
const keyPartSeparator = "|";

const isAttributeKeyPartDefinition = <A>(
  partDefinition: KeyPartDefinition<A>,
): partDefinition is AttributeKeyPartDefinition<A> => "attribute" in partDefinition;

// Get attributes that are included as part of keys for an entity
const getAttributesInKeys = <A>(config: EntityConfig<A>): string[] =>
  R.chain(
    (keyAttribute: KeyAttribute) =>
      config[keyAttribute].filter(isAttributeKeyPartDefinition).map((def) => String(def.attribute)),
    keyAttributes,
  );

export class KeyConverter<T extends Record<string, any>, A extends keyof T = keyof T> {
  private attributesInKeys: readonly string[];

  constructor(private readonly config: EntityConfig<A>) {
    this.attributesInKeys = getAttributesInKeys(config);
  }

  /**
   * Build a key attribute from an item base on config.
   * @param {KeyAttribute} keyAttribute The database record key attribute to build.
   * @param {Partial<T>} item Object with atleast the properties of T required to build the key.
   * @returns {string} the value for the key.
   */
  public makeKey = (keyAttribute: KeyAttribute, item: Partial<T>): string =>
    this.config[keyAttribute]
      .map((keyPartDefinition) => {
        if (isAttributeKeyPartDefinition(keyPartDefinition)) {
          return item[keyPartDefinition.attribute];
        } else {
          return keyPartDefinition.literal;
        }
      })
      .join(keyPartSeparator);

  /**
   * Extract attribute values from a key.
   * @param {KeyAttribute} keyAttribute The database record key attribute to extract from.
   * @param {string} keyValue The value of the key attribute.
   * @returns {Partial<T>} Object with the properties of T included in the key.
   */
  public parseKey = (keyAttribute: KeyAttribute, keyValue: string): Partial<T> => {
    const item: Partial<T> = {};
    const keyPartDefinitions = this.config[keyAttribute];
    const keyPartValues = keyValue.split(keyPartSeparator);
    R.zip(keyPartDefinitions, keyPartValues).forEach(([def, val]) => {
      if (isAttributeKeyPartDefinition(def)) {
        item[def.attribute] = val as any;
      }
    });

    return item;
  };

  /**
   * Converts an item into a database record with key attributes calculated based on config.
   * @param {T} item The item to marshall.
   * @returns {Record} A record for storage in the database.
   */
  public marshallItem = (item: T): Record<string, any> => {
    // Start with the item with any attribute that appears in a key omitted
    const record = R.omit(this.attributesInKeys, item);

    // Build the value for each key based on the configuration and set on record
    keyAttributes.forEach((keyAttribute) => {
      record[keyAttribute] = this.makeKey(keyAttribute, item);
    });

    return record;
  };

  /**
   * Converts a database record into an item with attributes extracted from keys based on config.
   * @param <Record> record the database record to unmarshall.
   * @returns {T} The resulting item.
   */
  public unmarshallItem = (record: Record<string, any>): T => {
    // Start with the record with key attributes omitted
    const item = R.omit(keyAttributes, record);

    // Extract the value for attributes from keys and set on record
    keyAttributes.forEach((keyAttribute) => {
      Object.assign(item, this.parseKey(keyAttribute, record[keyAttribute]));
    });

    return item as any;
  };
}
