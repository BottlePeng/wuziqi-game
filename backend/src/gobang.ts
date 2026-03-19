import express, { Request, Response } from 'express'
const app = express()

const config = require('./config/default')
const db = require('./model/db')

// 加入静态文件
app.use(express.static(__dirname + '/data'))

// 设置跨域 - 使用中间件方式
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Credentials', "true");
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
  res.header('X-Powered-By', '3.2.1');
  res.header('Content-Type', 'application/json;charset=utf-8');
  if (req.method == 'OPTIONS') {
    // 让options请求快速返回
    res.sendStatus(200);
  } else {
    next();
  }
})


// 解析前端的数据
app.use(express.json()) // 解析位 request.body

// 引入路由
require('./routes')(app) 

// 启动
app.listen(config.port, () => {
  console.log(`已启动端口 ${config.port}`)
})