export interface IHttpMessage {
    success: boolean;
    message?: string;
    data?: any;
}


export interface IWSMessage {
    type: MessageType;
    data?: any;
}

export enum MessageType {
    // 连接成功
    CONNECT = 'connect',

    // 心跳
    HEARTBEAT = 'heartbeat',      // 心跳

    // 错误处理
    ERROR = 'error',
}