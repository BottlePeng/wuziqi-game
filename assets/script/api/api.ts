// api.ts
import { IHttpMessage } from "../config/infoConfig";
import { GameDirector } from "../globel/gameDirector";
import { request } from "../network/httpUtil";

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
}