import { APIGatewayProxyHandler } from "aws-lambda";

/**
 * The parameters that are provided to a handler function.
 */
export interface WebsocketHandlerParams<P> {
  connectionId: string;
  payload: P;
}

/**
 * A handler function.
 * @param params A WebsocketHandlerParams object.
 */
export type HandlerFunction<P> = (params: WebsocketHandlerParams<P>) => Promise<void>;

/**
 * A function that validates the shape of a message body.
 * @param payload The payload object to validate. Will always be a non-null object.
 * @returns An object with error being undefined on success, a string message on failure.
 */
export type PayloadValidator = (payload: any) => { error?: string };

// Parse message body JSON if it exists, throw an error if it is invalid
const parseBody = (body: string | null | undefined): unknown => {
  try {
    return body == null ? undefined : JSON.parse(body);
  } catch (err) {
    throw new Error("Invalid parameter: error parsing JSON");
  }
};

// Validate parsed body and return it, throw an error if it is invalid
const validatePayload = <P>(payload: unknown, validator: PayloadValidator): P => {
  if (typeof payload !== "object" || payload == null) {
    throw new Error("Invalid parameter: body must be an object");
  }
  const { error } = validator(payload);
  if (error === undefined) {
    return (payload as unknown) as P;
  } else {
    throw new Error(`Invalid parameter: ${error}`);
  }
};

/**
 * Create a handler for a WebSocket event using the given function.
 * @param handler Function to handle parsed request parameters.
 *  If an error is thrown, it will be reported back to the triggering connection.
 * @returns An APIGatewayProxyHandler
 */
export function createWebsocketHandler(handler: HandlerFunction<undefined>): APIGatewayProxyHandler;
export function createWebsocketHandler<P extends object>(
  handler: HandlerFunction<P>,
  validator: PayloadValidator,
): APIGatewayProxyHandler;
export function createWebsocketHandler<P>(
  handler: HandlerFunction<P | undefined>,
  validator?: PayloadValidator,
): APIGatewayProxyHandler {
  return async (event) => {
    const { connectionId } = event.requestContext;
    if (!connectionId) {
      throw new Error("No WebSocket connection id");
    }

    try {
      // Parse and validate the payload in the body
      const payload = validator ? validatePayload<P>(parseBody(event.body), validator) : undefined;
      await handler({ connectionId, payload });
      return {
        statusCode: 200,
        body: "",
      };
    } catch (err) {
      // TODO - map some custom error types to error responses and send back to connectionId
      // for unknown error type, use ErrorCode.SERVER_ERROR
      console.error("unknown error", err);
      return {
        statusCode: 500,
        body: "",
      };
    }
  };
}
