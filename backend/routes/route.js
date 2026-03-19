const serve = require('../controller/serve')

module.exports = function(app) {
    app.get('/', function(req, res) {
        res.send('Hello World!');
    });

    // 验证是否注册
    app.get('/isRegister', function(req, res) {
        serve.isRegister(req, res);
    })

    // 注册
    app.post('/signup', function(req, res) {
        serve.insertUser(req, res);
    })

    // 登录
    app.post('/signin', function(req, res) {
        serve.signin(req, res);
    })

    app.post('/overview', function(req, res) {
        serve.overview(req, res);
    })
}