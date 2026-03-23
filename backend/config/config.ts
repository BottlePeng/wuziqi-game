export const netConfig = {
    // 当前环境
    NODE_DEV: `development`,

    // 服务器端口
    PORT: 3000,

    // 如果数据库在同一个服务器, 使用localhost; 如果数据库在其他服务器, 使用数据库服务器IP
    DB_HOST: `localhost`,

    // 宝塔中创建的数据库用户 / 密码 / 数据库名
    DB_USERNAME: `gobang`,
    DB_PASSWORD: `gobang`,
    DB_DATABASE: `gobang_db`,

    // 心跳
    HEART_BEAT_INTERVAL: 3000, // 单位: 毫秒
}