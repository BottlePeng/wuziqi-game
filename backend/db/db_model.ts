import { IGoBangGameInfo, IResponseConfig } from "../config/interfaceConfig";
import { DB } from "./db";

export class DBModel {
    // 重置棋盘数据表
    static async reset() {
        const sql = `CALL sp_reset_game()`;
        const result = await DB.query(sql, []) as any;

        let res: IResponseConfig = {
            success: false,
        };

        if (result && result.length > 0) {
            res.success = true;
            res.message = '重置棋盘成功';
        } else {
            res.message = '重置棋盘失败,请联系管理员';
        }

        return res;
    }


    // 查询当前对局信息
    static async getGameInfo() {
        const sql = `SELECT * FROM current_game WHERE id = 1`;
        const result = await DB.query(sql, []) as any;

        let res: IResponseConfig = {
            success: false,
        };

        if (result && result.length > 0) {
            const gameInfo = result[0] as IGoBangGameInfo;
            // 解析棋盘数据
            let board_state: number[][] = [];
            try {
                if (gameInfo.board_state) {
                    board_state = JSON.parse(gameInfo.board_state);
                } else {
                    this.reset();
                    console.error('查询棋盘数据失败,重置棋盘数据');
                    board_state = Array(15).fill(0).map(() => Array(15).fill(0));
                }
            } catch (e) {
                console.error('解析棋盘数据失败:', e);
                // 如果解析失败，返回空棋盘
                board_state = Array(15).fill(0).map(() => Array(15).fill(0));
            }

            // 构建成功返回数据
            res = {
                success: true,
                data: {
                    black_player_name: gameInfo.black_player_name,
                    white_player_name: gameInfo.white_player_name,
                    current_turn: gameInfo.current_turn,
                    board_state: board_state,
                }
            };
        } else {
            res.message = '未找到游戏信息';
        }

        return res;
    };

    static async isHasPlayer(playerName: string) {
        const sql = `SELECT * FROM players WHERE name = ?`;
        const result = await DB.query(sql, [playerName]) as any;

        let res: IResponseConfig = {
            success: false,
        };

        if (result && result.length > 0) {
            res.success = true;
            res.data = true;
            console.log(`${playerName}请求登录,已有该玩家信息`);
        } else {
            res.success = true;
            res.data = false;
            console.log(`${playerName}请求登录,无该玩家信息`);
        }

        return res;
    }
}
