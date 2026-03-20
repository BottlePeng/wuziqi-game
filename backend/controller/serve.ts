import { DBModel } from "../db/db_model";
import { Request, Response } from "express";

export class Serve {
    // 是否注册
    static async isRegister(req: Request, res: Response) {
        // 查询数据库是否有注册用户
        await DBModel.isRegister().then((result) => {
            let _isRegister = result[0].count > 0;
            res.send({
                code: _isRegister ? 200 : 400,
                data: {
                    isRegister: _isRegister
                },
            })
        });
    }
}