export interface IHttpMessage {
    success: boolean,
    message?: string,
    data?: any,
}

export interface IMessage {
    type: MessageType;
    data?: any;
}

export enum MessageType {
    SHOTDOWN = `shutdown`,
    ERROR = `error`,
    UPDATE = `update`,
}