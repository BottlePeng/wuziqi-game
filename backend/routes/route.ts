// src/routes/index.ts
import { Application, Request, Response } from 'express';
import { Serve } from '../controller/serve';

/**
 * 路由配置函数
 * @param app Express 应用实例
 */
export default function setupRoutes(app: Application): void {
    // 根路径 - 欢迎信息
    app.get('/', (req: Request, res: Response) => {
        res.status(200)
            .type('text/plain')
            .send('Welcome to GoBang Game Server!');
    });

    // 验证用户是否注册
    app.get('/isRegister', async (req: Request, res: Response) => {
        try {
            await Serve.isRegister(req, res);
        } catch (error) {
            console.error('isRegister 路由错误:', error);
            res.status(500).json({
                success: false,
                message: '服务器内部错误'
            });
        }
    });

    // 处理 404 - 未找到的路由
    app.use((req: Request, res: Response) => {
        res.status(404).json({
            success: false,
            message: `无法找到 ${req.method} ${req.path} 接口`
        });
    });

    console.log('✅ 所有路由注册完成');
}