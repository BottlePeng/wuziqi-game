import { DB } from "./db";

export class DBModel {
    // 查询数据库是否有注册用户
    static async isRegister() {
        const sql = `SELECT COUNT(*) AS count FROM users;`;
        return DB.query(sql, []);
    };
}
