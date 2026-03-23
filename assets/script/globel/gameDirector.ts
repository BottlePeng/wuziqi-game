import { _decorator, Component, director } from 'cc';
import { Api } from '../api/api';
const { ccclass, property } = _decorator;

@ccclass('GameDirector')
export class GameDirector extends Component {
    // 静态实例引用
    private static _instance: GameDirector = null;
    // 公开的静态方法获取实例
    public static get instance(): GameDirector {
        return GameDirector._instance;
    }

    //=======================================变量=========================================
    // 由服务器返回的信息控制

    blackPlayerId: number | null = null;
    blackPlayerName: string | null = null;
    whitePlayerId: number | null = null;
    whitePlayerName: string | null = null;
    currentTurn: 0 | 1 = 0; //当前回合 0-黑方，1-白方
    boardState: Array<Array<0 | 1 | 2>> = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ]

    playerId: number = -1; // 玩家id, -1-游客,*-玩家id
    playerName: string = 'Tourist'; // 玩家标识，游客-'Tourist', 玩家-玩家用户名称
    playerColor: 0 | 1 = 0; // 玩家颜色，-1-游客，0-黑色，1-白色

    token: string = ''; // 玩家token
    
    //=======================================生命周期=========================================

    onLoad() {
        // 单例检查
        if (GameDirector._instance !== null && GameDirector._instance !== this) {
            // 如果已经存在实例，销毁当前节点
            this.node.destroy();
            return;
        }

        // 设置为实例
        GameDirector._instance = this;

        // 设置为常驻节点
        director.addPersistRootNode(this.node);
    }

    onDestroy() {
        // 清理实例引用
        if (GameDirector._instance === this) {
            GameDirector._instance = null;
        }
    }

    start() {
        // todo 进行服务器握手
    }

    //====================================方法============================================
    
}

