import { IHttpMessage } from "../config/infoConfig";
import { DB } from "./db";

export class DBModel {
    // 重启服务器(仅服务端使用)
    static async restart() {
        const sql = `CALL sp_restart_server()`;
        await DB.query(sql, []) as any;
    }

    /**
     * 查询是否存在用户
     * @param playerName 用户名
     * @returns response
     */
    static async isHasPlayer(playerName: string): Promise<IHttpMessage> {
        const sql = `SELECT id FROM players WHERE name = ?`;
        const result = await DB.query(sql, [playerName]) as any;

        let res: IHttpMessage = {
            success: false,
        };

        if (result && result.length > 0) {
            res.success = true;
            res.data = result[0].id;
            console.log(`${playerName}请求登录,已有该玩家信息:ID${res.data}`);
        } else {
            res.success = true;
            res.data = -1;
            console.log(`${playerName}请求登录,无该玩家信息:ID${res.data}`);
        }

        return res;
    }

    // 加入游戏
    static async joinGame(playerId: number, playerColor: number): Promise<IHttpMessage> {
        let sql:string = '';
        let res: IHttpMessage = {
            success: false,
        };

        switch (playerColor) {
            case 0:
                sql = `UPDATE current_game SET black_player_id = ? WHERE id = 1`
                break;
            case 1:
                sql = `UPDATE current_game SET white_player_id = ? WHERE id = 1`
                break;
            default:
                res.message = 'playerColor错误,请联系管理员';
                break;
        }

        const result = await DB.query(sql, [playerId]) as any;
        if (result.changedRows > 0) {
            res.success = true;

            let token = `${playerId}-${playerColor}-${Date.now()}`
            res.data = token;
            console.log(`ID为${playerId}的玩家已成为${playerColor === 0 ? '黑方' : '白方'}`);
        } else {
            res.success = false;
            console.log(`ID为${playerId}的玩家加入游戏失败`);
        }
        return res;
    }
}
