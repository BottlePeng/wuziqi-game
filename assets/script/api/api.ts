// api.ts
import { IHttpMessage, IMessage, MessageType } from "../config/infoConfig";
import { GameDirector } from "../globel/gameDirector";
import { request } from "../network/httpUtil";
import { GameWebSocket } from "../network/webSocket";

export class Api {
    /**
     * 加入游戏
     * @param playerName 玩家用户名
     * @returns {Promise<void>}
     */
    static async joinGame(playerName: string): Promise<void> {
        try {
            const response: IHttpMessage = await request('POST', '/api/joinGame', { playerName: playerName});

            if (response) {
                if (response.success) {
                    console.log(`${playerName}加入游戏成功`);
                    GameDirector.instance.playerName = playerName;
                    GameDirector.instance.playerId = response.data.id;
                    GameDirector.instance.playerColor = response.data.color;
                    GameDirector.instance.token = response.data.token;
                } else {
                    throw new Error(response.message);
                }
            } else {
                throw new Error('请求服务器失败');
            }
        } catch (err) {
            throw err;
        }
    }

    /**
     * 下子
     * @param position 位置
     * @param color 颜色
     * @returns {Promise<void>}
     */
    static async makeStep(position: { row: number, col: number }, color: 0 | 1): Promise<void> {
        try {
            let message: IMessage = {
                type: MessageType.STEP,
                data: {
                    position: position,
                    color: color
                }
            }
            GameWebSocket.instance.sendMessage(message);
        } catch (err) {
            throw err;
        }
    }

    /**
     * 重置棋盘
     */
    static resetBoard(): void {
        try {
            let message: IMessage = {
                type: MessageType.RESET,
            }
            GameWebSocket.instance.sendMessage(message);
        } catch (err) {
            throw err;
        }
    }
}