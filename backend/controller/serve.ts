import { DBModel } from "../db/db_model";
import { Request, Response } from "express";

export class Serve {
    // 是否注册
    static async getGameInfo(req: Request, res: Response) {
        // 查询当前对局信息
        await DBModel.getGameInfo().then((result) => {
            res.send(result);
        });
    }

    static async isHasPlayer(req: Request, res: Response) {
        // 查询是否有玩家
        await DBModel.isHasPlayer(req.body.playerName).then((result) => {
            res.send(result);
        });
    }
}