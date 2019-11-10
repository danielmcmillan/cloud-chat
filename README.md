## WebSocket protocol

All messages are in JSON format.

Outgoing messages specify an "action" attribute indicating the action to perform.

Incoming messages specify a "type" attribute indicating the message type.

### Interfaces

```typescript
interface IAction {
  action: string;
}

interface IMessage {
  action: string;
}

interface IChatMessage {
  userName: string;
  message: string;
  time: number;
}
```

### Actions

#### Subscribe

Subscribe to a room.

```typescript
interface ISubscribeAction {
  action: "subscribe";
  roomName: string;
  userName: string;
}
```

If no room with the given name exists, a new room will be created.

The server will send a "room_state" response after subscription is successful.

#### Unsubscribe

Unsubscribe from a room.

```typescript
interface ISubscribeAction {
  action: "unsubscribe";
  roomName: "<room_name>";
}
```

#### Send message

Send a message to a room.

The room must have already been subscribed to.

```typescript
interface ISendMessageAction {
  action: "sendMessage";
  roomName: "<room_name>";
  message: "<message_text>";
}
```

The message will be sent to all subscribers including the sender.

#### List rooms

Request the list of active rooms.

```typescript
interface ISendMessageAction {
  action: "listRooms";
}
```

The server will respond with a message of type "roomsList".

### Responses

#### Error

When an action failed, the server will respond with a message of type "error".

```typescript
interface IErrorMessage {
  type: "error";
  action?: IAction;
  statusCode: ErrorCode;
  error: "<error_text>";
  message: "<error_message>";
}

enum ErrorCode {
  BAD_REQUEST = 400, // message format was incorrect or action invalid
  SERVER_ERROR = 500,
}
```

#### Room state

Includes the current state of a room.

```typescript
interface IRoomStateMessage {
  type: "subscribed";
  roomName: "<room_name>";
  users: string[]; // list of user names
  messages: IMessage[]; // list of recent messages
}
```

#### Message received

Sent when there is a new message in any subscribed room.

```typescript
interface IMessageReceivedMessage {
  type: "newMessage";
  roomName: "<room_name>";
  message: IMessage;
}
```

#### User subscribed

Sent when a new user subscribes to any subscribed room.

```typescript
interface IUserSubscribedMessage {
  type: "userSubscribed";
  roomName: "<room_name>";
  userName: "<user_name>";
}
```

#### User unsubscribed

Sent when a user unsubscribes from any subscribed room.

```typescript
interface IUserSubscribedMessage {
  type: "userUnsubscribed";
  roomName: "<room_name>";
  userName: "<user_name>";
}
```

#### Room list

Provides details about current active rooms.

```typescript
interface IUserSubscribedMessage {
  type: "roomList";
  roomName: "<room_name>";
  userName: "<user_name>";
}
```

## Data storage

### Queries

- Broadcast to a room: get all connections by room name

  - `{pk: "Subscription|<room_name>"}`

- Get name for incoming message: lookup user name by room name and connection id

  - `{pk: "Subscription|<room_name>", sk: "<room_name>|<connection_id>"}`

- Get user names by room name

  - `{pk: "Subscription|<room_name>"}`

- Delete subscriptions for a given connection_id

  - GSI: `{data: "<connection_id>"}` to get rooms
  - for each room name `{pk: "Subscription|<room_name>", sk: "<room_name>|<connection_id>"}`

- Get messages for a room ordered by time

  - `{pk: "Message|<room_name>"}`, limit to _x_

- Get messages for a user grouped by room and ordered by time

  - GSI: `{data: "<user_name>"}`

- Get list of active room names
  - `{pk: "Room", sk: "true|"}`

### DynamoDB Table

Partition key: "pk"

Sort key: "sk"

#### Rooms

```json
{
  "pk": "Room",
  "sk": "<active>|<created_time>",
  "data": "<room_name>"
}
```

#### Subscriptions

```json
{
  "pk": "Subscription|<room_name>",
  "sk": "<room_name>|<connection_id>",
  "data": "<connection_id>",
  "userName": "<user_name>"
}
```

#### Messages

```json
{
  "pk": "Message|<room_name>",
  "sk": "<room_name>|<timestamp>|<unique_id>",
  "data": "<connection_id>",
  "userName": "<user_name>"
}
```

### GSI

Partition key: "data"

Sort key: "sk"
