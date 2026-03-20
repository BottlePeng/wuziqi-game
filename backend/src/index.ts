// src/index.ts
import express from 'express';
import setupRoutes from '../routes/route';

const app = express();

// 设置跨域 - 使用中间件方式
app.use(function (req, res, next) {
  // 设置响应头以允许跨域请求
  res.header('Access-Control-Allow-Origin', '*');
  // 设置允许的请求头
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  // 允许发送凭据
  res.header('Access-Control-Allow-Credentials', "true");
  // 设置允许的请求方法
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
  // 设置 X-Powered-By 响应头
  res.header('X-Powered-By', '3.2.1');
  // 设置内容类型为 JSON 并指定字符编码为 utf-8
  res.header('Content-Type', 'application/json;charset=utf-8');
  // 检查请求方法是否为 OPTIONS
  if (req.method == 'OPTIONS') {
    // 让options请求快速返回
    res.sendStatus(200);
  } else {
    next();
  }
});

// 解析前端的数据
app.use(express.json()); // 解析 request.body

// 引入路由
try {
  setupRoutes(app);
  console.log('✅ 路由加载成功');
} catch (err) {
  console.error('❌ 路由加载失败:', err);
}

// 获取端口
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// 启动
app.listen(PORT, () => {
  console.log(`🚀 服务器启动成功！`);
  console.log(`📡 端口: ${PORT}`);
  console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
});