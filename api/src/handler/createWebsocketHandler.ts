import { APIGatewayProxyHandler } from "aws-lambda";

export interface WebsocketHandlerParams<P> {
  connectionId: string;
  payload: P;
}

export const createWebsocketHandler = <P extends {} | null = null>(
  handle: (params: WebsocketHandlerParams<P>) => Promise<void>,
): APIGatewayProxyHandler => async (event) => {
  const { connectionId } = event.requestContext;
  if (!connectionId) {
    throw new Error("No WebSocket connection id");
  }

  try {
    const payload = event.body === null ? null : JSON.parse(event.body);
    await handle({ connectionId, payload });
  } catch (err) {
    // TODO - map some custom error types to error responses
    // for unknown error type, use ErrorCode.SERVER_ERROR
  }

  return {
    statusCode: 200,
    body: "",
  };
};
