import mysql from 'mysql2';
import { env } from 'process';

export class DB {
    // 只使用连接池
    static pool = mysql.createPool({
        connectionLimit: 10,
        host: env.HOST,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE
    });

    // 封装查询方法 - 使用连接池
    static query(sql: string, values: any) {
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                } else {
                    connection.query(sql, values, (err, results) => {
                        connection.release(); // 释放连接回连接池
                        if (err) {
                            reject(err);
                        } else {
                            resolve(results);
                        }
                    });
                }
            });
        });
    }
}