const mysql = require('mysql2');
const config = require('../config/default');

// 只使用连接池
const pool = mysql.createPool({
    connectionLimit: 10,
    host: config.database.HOST,
    user: config.database.USER,
    password: config.database.PASSWORD,
    database: config.database.DB
});

// 封装查询方法 - 使用连接池
let query = (sql, values) => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
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
};

// 通过 pool.getConnection 获取连接
let queryPool = (sql, values) => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                reject(err);
            } else {
                connection.query(sql, values, (err, result) => {
                    connection.release(); // 释放连接
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                })
            }
        });
    });
};

// 数据库创建语句（不指定数据库，因为数据库可能还不存在）
let createDB = `CREATE DATABASE IF NOT EXISTS ${config.database.DB} DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci;`;

// 创建数据库 - 使用一个临时连接，不指定数据库
let createDatabase = () => {
    return new Promise((resolve, reject) => {
        const tempConnection = mysql.createConnection({
            host: config.database.HOST,
            user: config.database.USER,
            password: config.database.PASSWORD,
        });
        
        tempConnection.query(createDB, (err, result) => {
            tempConnection.end(); // 立即关闭临时连接
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

// 数据表
// 用户
let users = `
    CREATE TABLE IF NOT EXISTS users (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码',
    filesNum INT NOT NULL DEFAULT 0 COMMENT '文件数',
    articlesNum INT NOT NULL DEFAULT 0 COMMENT '文章数',
    PRIMARY KEY (id)
    ) COMMENT='用户';
`

// 创建数据表
let createTable = () => {
    return query(users, []);
}

// 创建数据库和数据表
async function create() {
    try {
        await createDatabase();
        await createTable();
    } catch (err) {
        console.error('创建失败:', err);
        throw err;
    }
}

// 导出所有需要的方法
module.exports = {
    query,
    queryPool,
    createDatabase,
    createTable,
    create,
    pool
};