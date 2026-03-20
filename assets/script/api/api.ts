// api.ts
import { IResponseConfig } from "../config/networkConfig";
import { request } from "../network/httpUtil";

export class Api {
    // 获取对局信息
    static async getGameInfo() {
        try {
            const response = await request('GET', '/api/getGameInfo', null);

            let res:IResponseConfig = {
                success: false,
            }

            if (response) {
                res.success = response.success;
                res.message = response.message;
                res.data = response.data;
            } else {
                throw new Error('未请求到任何对局信息,请联系管理员');
            }

            if (res.success) {
                return res.data;
            } else {
                throw new Error(res.message);
            }
        } catch (err) {
            return err;
        }
    }

    // 查询是否注册
    static async isHasPlayer(playerName: string): Promise<boolean> {
        try {
            const response = await request('POST', '/api/isHasPlayer', { playerName });

            let res:IResponseConfig = {
                success: false,
            }

            if (response) {
                res.success = response.success;
                res.message = response.message;
                res.data = response.data;
            } else {
                throw new Error('未请求到任何注册信息,请联系管理员');
            }

            if (res.success) {
                return res.data;
            } else {
                throw new Error(res.message);
            }

        } catch (err) {
            return err;
        }

    }
}