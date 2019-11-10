export interface IMessage {
  type: string;
}

export interface IRoomStateMessage {
  type: "subscribed";
  roomName: string;
  // users: string[];
  // messages: IChatMessage[];
}

export interface IMessageReceivedMessage {
  type: "newMessage";
  roomName: string;
  message: IChatMessage;
}

export interface IChatMessage {
  userName: string;
  message: string;
  time: number;
}

export const makeRoomStateMessage = (roomName: string): IRoomStateMessage => {
  return {
    type: "subscribed",
    roomName,
  };
};

export const makeMessageReceivedMessage = (
  roomName: string,
  message: IChatMessage,
): IMessageReceivedMessage => {
  return {
    type: "newMessage",
    message,
    roomName,
  };
};
