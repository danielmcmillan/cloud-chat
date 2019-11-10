export interface IAction {
  action: string;
}

export interface ISubscribeAction extends IAction {
  action: "subscribe";
  roomName: string;
  userName: string;
}

export interface ISendMessageAction {
  action: "sendMessage";
  roomName: string;
  message: string;
}
