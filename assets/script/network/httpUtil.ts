import { networkConfig } from "../config/networkConfig";

/**
 * 封装一个基于 XMLHttpRequest 的网络请求
 * @param method 请求方法 ('GET', 'POST' 等)
 * @param url 请求地址 (可以只写路由路径，在工具函数里拼接完整地址)
 * @param data 要发送的数据 (对象形式)
 * @param callback 回调函数，处理返回结果
 */
export function request(method: string, url: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
        const baseUrl = networkConfig.baseUrl;
        const fullUrl = baseUrl + url;

        const xhr = new XMLHttpRequest();
        xhr.open(method, fullUrl, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.responseType = 'json';

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr.response);
            } else {
                reject(new Error(`请求失败，状态码：${xhr.status}`));
            }
        };

        xhr.onerror = () => {
            reject(new Error('网络错误，请检查连接'));
        };

        const dataStr = data ? JSON.stringify(data) : null;
        xhr.send(dataStr);
    });
}

//========================示例=============================

// // --- 在你的游戏脚本（例如 game.ts）中使用 ---
// import { request } from './network/httpUtil';
// import { _decorator, Component } from 'cc';
// const { ccclass, property } = _decorator;

// @ccclass('Game')
// export class Game extends Component {
//     start() {
//         // 示例1：发起 GET 请求
//         this.getUserInfo('user_123');

//         // 示例2：发起 POST 请求，比如用户登录
//         this.login('test_user', 'password123');
//     }

//     getUserInfo(userId: string) {
//         request('GET', `/api/user/${userId}`, null, (err, response) => {
//             if (err) {
//                 console.error('获取用户信息失败:', err.message);
//                 // 这里可以给用户一个提示
//                 return;
//             }
//             console.log('获取用户信息成功:', response);
//             // 处理你的用户数据...
//         });
//     }

//     login(username: string, password: string) {
//         const loginData = { username, password };
//         request('POST', '/api/auth/login', loginData, (err, response) => {
//             if (err) {
//                 console.error('登录失败:', err.message);
//                 return;
//             }
//             console.log('登录成功:', response);
//             // 保存 token，跳转游戏场景等...
//         });
//     }
// }