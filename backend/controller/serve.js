const db_model = require('../model/db_model');
const jwt = require('../lib/jwt');
const { ref } = require('node:process');

let _token = ref('');

// 是否注册
exports.isRegister = async (req, res) => {
    // 查询数据库是否有注册用户
    await db_model.isRegister().then((result) => {
        let _isRegister = result[0].count > 0;
        res.send({
            code: _isRegister ? 200 : 400,
            data: {
                isRegister: _isRegister
            },
        })
    });
}

// 注册
exports.insertUser = async (req, res) => {
    const data = req.body;
    // 插入用户数据
    await db_model.insertUser(data).then(() => {
        res.send({
            code: 200,
            data: {
                isSuccess: true,
            },
        })
    }).catch((err) => {
        res.send({
            code: 400,
            data: {
                isSuccess: false,
            },
        })
    });
}

// 登录
exports.signin = async (req, res) => {
    const data = req.body;
    await db_model.signin(data).then((result) => {
        if (result.length > 0) {
            // 生成token
            _token = jwt.generateToken(data.name);// 这里的data.name是用户名s,可以随意传入
            res.send({
                code: 200,
                data: {
                    id: result[0].id,
                    token: _token,
                },
            })
        } else {
            res.send({
                code: 400,
            })
        }
    })
}

// 总览
exports.overview = async (req, res) => {
    let data = req.body;
    if (data.token === _token) {
        res.send({
            code: 200,
            data: {
               files: ( Math.random() * 100 ).toFixed(2) + 'M',  // 生成 0-99 之间的随机数 + 'M'
               atricles: Math.floor(Math.random() * 50)      // 生成 0-49 之间的随机数
            },
        })
    } else {
        res.send({
            code: 400,
        })
    }
}