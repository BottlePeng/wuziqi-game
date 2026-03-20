import { _decorator, Component, director } from 'cc';
import { Api } from '../api/api';
import { IGoBangGameInfo } from '../config/networkConfig';
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
    gameInfo: IGoBangGameInfo = {
        black_player_name: null,
        white_player_name: null,
        current_turn: 0,
        board_state: [
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
        ],
    };

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

    protected async start(): Promise<void> {
        this.getGameInfo();
    }

    //====================================方法============================================
    async getGameInfo() {
        try {
            const response: IGoBangGameInfo = await Api.getGameInfo();
            let data: IGoBangGameInfo = {
                black_player_name: response.black_player_name,
                white_player_name: response.white_player_name,
                current_turn: response.current_turn, // 0-黑棋，1-白棋
                board_state: response.board_state,
            };
            this.gameInfo = data;
        } catch (error) {
            console.error('获取游戏信息失败:', error);
        }
    }
}
