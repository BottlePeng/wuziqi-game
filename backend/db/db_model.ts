import { IHttpMessage } from "../config/Interface.js";
import { DB } from "./db.js";

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
    static async isHasPlayer(playerName: string): Promise<number> {
        const sql = `SELECT id FROM players WHERE name = ?`;
        const result = await DB.query(sql, [playerName]) as any;

        let id = -1;

        if (result && result.length > 0) {
            id = result[0].id;
            console.log(`${playerName}请求登录,已有该玩家信息:ID${id}`);
        } else {
            console.log(`${playerName}请求登录,无该玩家信息`);
        }

        return id;
    }

    /**
     * 加入游戏
     * @param playerId 玩家ID
     * @param playerColor 玩家颜色 0-黑 1-白
     * @returns
     */
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
        }

        const result = await DB.query(sql, [playerId]) as any;
        if (result.changedRows > 0) {
            res.success = true;

            let _token = `${playerId}-${playerColor}-${Date.now()}`
            res.data = {
                id: playerId,
                token: _token,
            };
            console.log(`ID为${playerId}的玩家已成为${playerColor === 0 ? '黑方' : '白方'}`);
        } else {
            res.success = false;
            console.log(`ID为${playerId}的玩家加入游戏失败`);
        }
        return res;
    }

    static async getGameInfo() {
        const sql = `SELECT * FROM current_game WHERE id = 1`;
        const result = await DB.query(sql, []) as any;
        
        let gameInfo = {
            blackPlayerId: -1,
            blackPlayerName: '',
            whitePlayerId: -1,
            whitePlayerName: '',
            currentTurn: 0,
            boardState: []
        }

        gameInfo.blackPlayerId = result[0].black_player_id? result.black_player_id : -1;
        gameInfo.whitePlayerId = result[0].white_player_id? result.white_player_id : -1;
        gameInfo.currentTurn = result[0].current_turn ? result.current_turn : 0;
        gameInfo.boardState = result[0].board_state;
        
        let sql2 = `SELECT name FROM players WHERE id = ?`;
        let result2 = await DB.query(sql2, [gameInfo.blackPlayerId]) as any;
        gameInfo.blackPlayerName = result2.length > 0 ? result2[0].name : '';
        result2 = await DB.query(sql2, [gameInfo.whitePlayerId]) as any;
        gameInfo.whitePlayerName = result2.length > 0 ? result2[0].name : '';

        return gameInfo;
    }
}
