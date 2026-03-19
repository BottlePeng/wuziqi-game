const db = require('./db');

// 查询数据库是否有注册用户
exports.isRegister = () => {
    const sql = `SELECT COUNT(*) AS count FROM users;`;
    return db.queryPool(sql, []);
};

// 管理员注册
exports.insertUser = async (data) => {
    let _sql = `INSERT INTO users SET ?;`;
    await db.queryPool(_sql, [data]);
};

// 登录/查找用户
exports.signin = async (data) => {
    const { name, password } = data;

    // 使用参数化查询，防止 SQL 注入
    let _sql = `SELECT * FROM users WHERE name = ? AND password = ?`;
    
    // 注意：正常情况下，这里应该传加密后的密码，而不是明文
    return db.query(_sql, [name, password]);
};