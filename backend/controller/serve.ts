import { DBModel } from "../db/db_model.js";
import { Request, Response } from "express";
import WebSocket from 'ws';
import { WebSocketServer } from "ws";
import http from 'http';
import { URL } from "url";
import { IHttpMessage, IMessage as IWsMessage, MessageType } from "../config/Interface.js";
import { netConfig } from "../config/config.js";

interface IClientInfo {
    playerId: number        // 玩家id, -1-游客, *-玩家id
    token: string           // 玩家token
    isAlive: boolean        // 是否链接正常
    lastPongTime: number;   // 上次收到 Pong 消息时间
    pingSent: boolean;      // 是否已发送 Ping 消息
}


export class Serve {
    // ===============================通用================================
    static async getGameInfo() {
        return await DBModel.getGameInfo();
    }

    // ===============================HTTP================================
    // 加入游戏
    static async joinGame(req: Request, res: Response) {
        let gameInfo = await Serve.getGameInfo();

        const playerName:string = req.body.playerName;

        let result: IHttpMessage = {
            success: false,
        }

        if (playerName === 'Tourist') {
            // 游客加入游戏
            result = {
                success: true,
                message: `游客加入观战`,
                data: {
                    id: -1,
                    token: `-1-0-${Date.now()}`,
                }
            }
        } else {
            // 查询玩家id,-1为没有找到
            let id: number = await DBModel.isHasPlayer(playerName);

            if (id === -1) {
                result = {
                    success: false,
                    message: `玩家${playerName}不存在,请联系管理员`,
                }
            }

            if (gameInfo.blackPlayerId === -1 && gameInfo.whitePlayerId !== id) {
                result = await DBModel.joinGame(id, 0);
            } else if (gameInfo.whitePlayerId === -1 && gameInfo.whitePlayerId !== id) {
                result = await DBModel.joinGame(id, 1);
            } else {
                result = {
                    success: false,
                    message: `用户已在线或者玩家已满`,
                }
            }
        }

        res.send(result);
    }
    
    // ============================WebSocket================================
    private server: http.Server;
    private wss: WebSocketServer;
    private clients: Map<WebSocket, IClientInfo> = new Map();   // 客户端池

    constructor(server: http.Server) {
        // 创建 WebSocket 服务器，绑定到现有的 HTTP 服务器
        this.wss = new WebSocketServer({server, path: '/ws'});

        this.server = server;


        // 设置 WebSocket 事件处理
        this.setupWebSocketEvents();
        
        // 启动心跳检测
        this.startHeartbeat();
    }

    /**
     * 设置 WebSocket 事件处理
     */
    private setupWebSocketEvents(): void {
        this.wss.on('connection', this.handleConnection.bind(this));
        this.wss.on('error', this.handleServerError.bind(this));
        this.wss.on('close', this.handleServerClose.bind(this));
    }

    /**
     * 处理新的 WebSocket 连接
     */
    private handleConnection(ws: WebSocket, req: http.IncomingMessage): void {
        // 检查连接数限制
        if (this.clients.size >= parseInt(process.env.MAX_CONNECTIONS || '12')) {
            console.log(`[${new Date().toLocaleTimeString()}] 连接数已达上限，拒绝新连接`);
            ws.close(1008, '服务器连接数已达上限');
            return;
        }

        // 解析 URL 获取参数
        const url = new URL(req.url!, `http://${req.headers.host}`);
        // 获取查询参数
        const playerId = url.searchParams.get('playerId');
        const token = url.searchParams.get('token');

        // 存储客户端信息
        const clientInfo: IClientInfo = {
            playerId: parseInt(playerId!),
            token: token!,
            isAlive: true,
            lastPongTime: Date.now(),
            pingSent: false,
        };

        this.clients.set(ws, clientInfo);
        console.log(`[${new Date().toLocaleTimeString()}] ID${clientInfo.playerId}客户端连接`);
        console.log(`当前连接数: ${this.clients.size}`);

        // 设置消息处理
        ws.on('message', (data: WebSocket.Data) => {
            this.handleMessage(ws, data);
        });

        ws.on('close', (code: number, reason: Buffer) => {
            this.handleClose(ws, code, reason);
        });

        ws.on('error', (error: Error) => {
            this.handleError(ws, error);
        });

        ws.on('pong', () => {
            this.handlePong(ws);
        });

        // 发送对局信息
        this.sendToClient(ws, Serve.getGameInfo());
    }

    /**
     * 处理接收到的消息
     */
    private handleMessage(ws: WebSocket, data: WebSocket.Data): void {
        const client = this.clients.get(ws);
        if (!client) return;

        try {
            const message = JSON.parse(data.toString());
            console.log(`[${new Date().toLocaleTimeString()}] 收到消息 [${client.playerId}]:`, message.type);

            switch (message.type) {
                // todo 处理消息类型

                default:
                    this.sendError(ws, '未知消息类型');
                    console.log(`未知消息类型: ${message.type}`);
            }
        } catch (error) {
            console.error('解析消息失败:', error);
            this.sendError(ws, '消息格式错误');
        }
    }

    /**
     * 处理连接关闭
     */
    private handleClose(ws: WebSocket, code: number, reason: Buffer): void {
        const client = this.clients.get(ws);
        const reasonStr = reason.toString();

        console.log(`[${new Date().toLocaleTimeString()}] 客户端断开: ${client?.playerId || 'unknown'}`);
        console.log(`断开代码: ${code}, 原因: ${reasonStr || '无'}`);

        this.clients.delete(ws);
        console.log(`当前连接数: ${this.clients.size}`);
    }

    /**
     * 处理错误
     */
    private handleError(ws: WebSocket, error: Error): void {
        const client = this.clients.get(ws);
        console.error(`[${new Date().toLocaleTimeString()}] 客户端错误 [${client?.playerId}]:`, error.message);
    }

    /**
     * 处理 Pong 响应
     */
    private handlePong(ws: WebSocket): void {
        const client = this.clients.get(ws);
        if (client) {
            client.lastPongTime = Date.now();
            client.pingSent = false;
        }
    }

    /**
     * 处理服务器错误
     */
    private handleServerError(error: Error): void {
        console.error('服务器错误:', error);
    }

    /**
     * 处理服务器关闭
     */
    private handleServerClose(): void {
        console.log('WebSocket 服务器关闭');
    }

    /**
     * 发送消息给客户端
     */
    private sendToClient(ws: WebSocket, message: any): void {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    }

    /**
     * 发送错误消息
     */
    private sendError(ws: WebSocket, errorMessage: string): void {
        const errorResponse: IWsMessage = {
            type: MessageType.ERROR,
            data: {
                message: errorMessage,
                timestamp: Date.now()
            }
        };

        this.sendToClient(ws, errorResponse);
    }

    /**
     * 启动心跳检测
     */
    private startHeartbeat(): void {
        setInterval(() => {
            const now = Date.now();
            const heartbeatTimeout = netConfig.HEART_BEAT_INTERVAL * 2;

            this.wss.clients.forEach((ws) => {
                const client = this.clients.get(ws);
                if (!client) return;

                // 检查心跳超时
                if ((now - client.lastPongTime) > heartbeatTimeout) {
                    console.log(`[${new Date().toLocaleTimeString()}] 客户端心跳超时，断开连接: ${client.playerId}`);
                    ws.terminate();
                    this.clients.delete(ws);
                    return;
                }

                // 如果已经发送了 ping 但还未收到 pong，不重复发送
                if (client.pingSent) {
                    return;
                }

                // 发送心跳 ping
                if (ws.readyState === WebSocket.OPEN) {
                    client.pingSent = true;
                    ws.ping();
                }
            });
        }, netConfig.HEART_BEAT_INTERVAL);
    }

    /**
     * 启动服务器
     */
    public start(): void {
        this.server.listen(netConfig.PORT, () => {
            console.log('========================================');
            console.log(`[${new Date().toLocaleTimeString()}]`);
            console.log('WebSocket 服务器已启动');
            console.log('等待客户端连接...');
            console.log('========================================');
        });
    }

    /**
 * 停止服务器
 */
    public async stop(): Promise<void> {
        // 1. 通知所有客户端
        const closeMessage = JSON.stringify({
            type: 'shutdown',
            message: '服务器关闭',
            timestamp: Date.now()
        });

        this.wss.clients.forEach((ws) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(closeMessage);
                ws.close();
            }
        });

        // 2. 等待 WebSocket 连接关闭
        await new Promise(resolve => setTimeout(resolve, 500));

        // 3. 关闭 WebSocket 服务器
        await new Promise<void>((resolve) => {
            this.wss.close(() => resolve());
        });

        // 4. 关闭 HTTP 服务器
        return new Promise((resolve) => {
            // 强制关闭所有连接（Node.js 20+）
            if (this.server.closeAllConnections) {
                this.server.closeAllConnections();
            }

            this.server.close(() => {
                resolve();
            });

            // 超时处理
            setTimeout(() => {
                resolve();
            }, 3000);
        });
    }
}
