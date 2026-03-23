// src/index.ts
import express from 'express';
import setupRoutes from '../routes/route.js';
import http from 'http';
import { Serve } from '../controller/serve.js';
import { netConfig } from '../config/config.js';
const app = express();

// 设置跨域 - 使用中间件方式
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Credentials', "true");
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
  res.header('X-Powered-By', '3.2.1');
  res.header('Content-Type', 'application/json;charset=utf-8');
  if (req.method == 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// 解析前端的数据
app.use(express.json()); // 解析 request.body
app.use(express.urlencoded({ extended: true }));

// 引入路由
try {
  setupRoutes(app);
  console.log('✅ 路由加载成功');
} catch (err) {
  console.error('❌ 路由加载失败:', err);
}

// 获取端口
const PORT = netConfig.PORT;

// 将 Express 应用传递给 http.createServer,并创建WS服务器
const server = http.createServer(app);
const wsServer = new Serve(server);
wsServer.start();


app.listen(PORT, () => {
  console.log(`[${new Date().toLocaleTimeString()}]`);
  console.log(`🚀 服务器启动成功！`);
  console.log(`📡 服务器端口${PORT}已开启`);
  console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
});

const gracefulShutdown = async () => {
  console.log('\n========================================');
  console.log(`[${new Date().toLocaleTimeString()}]`);
  console.log('🛑 正在关闭服务器...');
  console.log('========================================');

  console.log(1);
  

  // 设置超时强制退出
  const timeout = setTimeout(() => {
    console.error('⚠️ 关闭超时，强制退出');
    process.exit(1);
  }, 10000);

  console.log(2);

  try {
    // 停止 WebSocket 服务器
    await wsServer.stop();

    // 关闭 HTTP 服务器
    server.close(() => {
      console.log('✅ 所有服务器已关闭');
      clearTimeout(timeout);
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ 关闭失败:', error);
    clearTimeout(timeout);
    process.exit(1);
  }
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);