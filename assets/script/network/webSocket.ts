import { _decorator, Component, director } from "cc";
import { MessageType } from "../config/infoConfig";
import { networkConfig } from "../config/networkConfig";
import { GameDirector } from "../globel/gameDirector";
const { ccclass, property } = _decorator;

const wx = window['wx']

@ccclass('GameWebSocket')
export class GameWebSocket extends Component {
    // 静态实例引用
    private static _instance: GameWebSocket = null;
    // 公开的静态方法获取实例
    public static get instance(): GameWebSocket {
        return GameWebSocket._instance;
    }


    private ws: WebSocket | null = null;
    private reconnectTimer: any = null;

    private reconnectAttempts: number = 0;           // 当前重连次数
    private maxReconnectAttempts: number = 5;        // 最大重连次数
    private reconnectDelay: number = 3000;           // 重连延迟（毫秒）
    private isManualDisconnect: boolean = false;     // 是否主动断开

    //=======================================生命周期=========================================

    onLoad() {
        // 单例检查
        if (GameWebSocket._instance !== null && GameWebSocket._instance !== this) {
            // 如果已经存在实例，销毁当前节点
            this.node.destroy();
            return;
        }

        // 设置为实例
        GameWebSocket._instance = this;

        // 设置为常驻节点
        director.addPersistRootNode(this.node);

        // 监听游戏关闭事件
        this.registerAppEvents();
    }

    onDestroy() {
        // 清理实例引用
        if (GameWebSocket._instance === this) {
            GameWebSocket._instance = null;
        }

        // 清理定时器
        this.clearReconnectTimer();

        // 关闭连接
        this.close();
    }

    /**
     * 注册应用事件,微信专用
     */
    private registerAppEvents() {
        // 监听游戏隐藏（小游戏切到后台）
        if (typeof wx !== 'undefined') {
            wx.onHide(() => {
                console.log('游戏切换到后台');
                // 可选：断开连接以节省资源
                // this.pauseHeartbeat();
            });

            wx.onShow(() => {
                console.log('游戏切换到前台');
                // 可选：重新连接
                if (!this.isConnected() && !this.isManualDisconnect) {
                    this.reconnect();
                }
            });
        }
    }

    //====================================方法============================================

    /**
     * 连接 WebSocket
     */
    connectWebSocket(playerId: number, token: string) {
        const wsUrl = `${networkConfig.wsUrl}/ws?playerId=${playerId}&token=${token}`;

        try {
            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = () => {
                this.handleOpen();
            };

            this.ws.onmessage = (event) => {
                this.handleMessage(event);
            };

            this.ws.onclose = (event) => {
                this.handleClose(event);
            };

            this.ws.onerror = (error) => {
                this.handleError(error);
            };
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * 处理连接成功
     */
    private handleOpen() {
        console.log('[WebSocket] 连接成功');
        // 重置重连计数
        this.resetReconnectAttempts();

        // 重置重连计数
        this.resetReconnectAttempts();

        // 清除重连定时器
        this.clearReconnectTimer();
    }

    /**
     * 处理接收消息
     */
    private handleMessage(event: MessageEvent) {
        try {
            const data = JSON.parse(event.data);
            console.log('[WebSocket] 收到消息:', data.type);

            switch (data.type) {
                case MessageType.UPDATE:
                    // 更新游戏状态
                    GameDirector.instance.blackPlayerId = data.blackPlayerId;
                    GameDirector.instance.blackPlayerName = data.blackPlayerName;
                    GameDirector.instance.whitePlayerId = data.whitePlayerId;
                    GameDirector.instance.whitePlayerName = data.whitePlayerName;
                    GameDirector.instance.currentTurn = data.currentTurn;
                    GameDirector.instance.boardState = data.boardState;
                    break;

                case MessageType.ERROR:
                    console.error('[WebSocket] 服务器错误:', data.data?.message);
                    break;

                case MessageType.SHOTDOWN:
                    console.log('[WebSocket] 收到服务器关闭通知');
                    this.handleServerShutdown();
                    break;
                    
                default:
                    console.log('[WebSocket] 未知消息类型:', data.type);
            }
        } catch (error) {
            console.error('[WebSocket] 消息解析失败:', error);
        }
    }

    /**
     * 处理服务器关闭通知
     */
    private handleServerShutdown() {
        const message = '服务器正在维护，请稍后重试';

        // 微信小游戏环境
        if (typeof wx !== 'undefined') {
            wx.showModal({
                title: '提示',
                content: message,
                showCancel: false,
                success: (res) => {
                    if (res.confirm) {
                        // 用户点击确定后立即跳转
                        director.loadScene(`Login`);
                    }
                }
            });
        } else {
            // 浏览器环境
            alert(message);
        }

        console.log('[WebSocket] 服务器关闭:', message);

        // 主动关闭 WebSocket 连接
        this.isManualDisconnect = true;
        this.close();

        // 延迟后跳转到登录场景
        this.scheduleOnce(() => {
            director.loadScene(`Login`);
        }, 2);
    }

    /**
     * 处理连接关闭
     */
    private handleClose(event: CloseEvent) {
        console.log(`[WebSocket] 连接关闭, code: ${event.code}, reason: ${event.reason}`);

        // 清理 WebSocket 对象
        this.ws = null;

        // 如果不是主动断开，尝试重连
        if (!this.isManualDisconnect) {
            this.scheduleReconnect();
        } else {
            console.log('[WebSocket] 主动断开，不进行重连');
        }
    }

    /**
     * 处理错误
     */
    private handleError(error: any) {
        console.error('[WebSocket] 连接错误:', error);

        // 错误发生后，WebSocket 会自动关闭，触发 onclose
        // 所以这里不需要额外处理，等待 onclose 触发重连
    }

    /**
     * 安排重连
     */
    private scheduleReconnect() {
        // 检查是否超过最大重连次数
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log(`[WebSocket] 已达到最大重连次数 (${this.maxReconnectAttempts})，停止重连`);
            this.onReconnectFailed();
            return;
        }

        // 计算重连延迟
        const delay = this.reconnectDelay;
        console.log(`[WebSocket] 第 ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts} 次重连，延迟: ${delay}ms`);

        // 清除之前的定时器
        this.clearReconnectTimer();

        // 设置重连定时器
        this.reconnectTimer = setTimeout(() => {
            this.doReconnect();
        }, delay);
    }

    /**
     * 执行重连
     */
    private doReconnect() {
        this.reconnectAttempts++;
        console.log(`[WebSocket] 正在执行第 ${this.reconnectAttempts} 次重连...`);

        // 重新连接
        let playerId = GameDirector.instance.playerId;
        let token = GameDirector.instance.token;
        if (playerId !== -1 && token) {
            this.connectWebSocket(playerId, token);
        } else {
            console.log('[WebSocket] 缺少连接信息，无法重连');
            this.onReconnectFailed();
        }
    }

    /**
     * 重连失败回调
     */
    private onReconnectFailed() {
        console.log('[WebSocket] 重连尝试失败');

        // 显示提示框给用户
        this.showReconnectFailedTip();
    }

    /**
     * 显示重连失败提示
     */
    private showReconnectFailedTip() {
        // 微信小游戏环境
        if (typeof wx !== 'undefined') {
            wx.showModal({
                title: '连接失败',
                content: '网络连接失败，请检查网络后重新进入游戏',
                showCancel: false,
                success: (res) => {
                    if (res.confirm) {
                        // 用户确认后，可以返回登录页或重启游戏
                        director.loadScene('Login');
                    }
                }
            });
        } else {
            // 浏览器环境
            alert('网络连接失败，请刷新页面重试');
            director.loadScene('Login');
        }
    }

    /**
     * 重置重连计数
     */
    private resetReconnectAttempts() {
        this.reconnectAttempts = 0;
    }

    /**
     * 清除重连定时器
     */
    private clearReconnectTimer() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }

    /**
     * 检查是否已连接
     */
    public isConnected(): boolean {
        return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
    }

    /**
     * 发送消息
     */
    public sendMessage(message: any): boolean {
        if (this.isConnected()) {
            try {
                this.ws.send(JSON.stringify(message));
                return true;
            } catch (error) {
                console.error('[WebSocket] 发送消息失败:', error);
                return false;
            }
        } else {
            console.warn('[WebSocket] 未连接，无法发送消息');
            return false;
        }
    }

    /**
     * 主动关闭连接
     */
    public close() {
        this.isManualDisconnect = true;
        this.clearReconnectTimer();

        if (this.ws) {
            if (this.ws.readyState === WebSocket.OPEN) {
                this.ws.close();
            }
            this.ws = null;
        }

        console.log('[WebSocket] 连接已关闭');
    }

    /**
     * 重新连接
     */
    public reconnect() {
        console.log('[WebSocket] 手动触发重连');
        this.isManualDisconnect = false;
        this.resetReconnectAttempts();
        this.scheduleReconnect();
    }
}