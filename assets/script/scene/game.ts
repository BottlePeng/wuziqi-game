import { _decorator, Button, Component, Label, Node } from 'cc';
import { GameDirector } from '../globel/gameDirector';
import { GameWebSocket } from '../network/webSocket';
import { Api } from '../api/api';
import { Tips } from '../prefab/tips';
import { Btn } from '../Item/Btn';
const { ccclass, property } = _decorator;

@ccclass('Game')
export class Game extends Component {
    // 静态实例引用
    private static _instance: Game = null;
    // 公开的静态方法获取实例
    public static get instance(): Game {
        return Game._instance;
    }


    @property(Tips)
    tipsNode: Tips = null;

    @property(Label)
    label: Label = null;

    @property(Node)
    btns: Node = null;
    
    onDestroy() {
        // 清理实例引用
        if (Game._instance === this) {
            Game._instance = null;
        }
    }

    protected onLoad(): void {
        // 单例检查
        if (Game._instance !== null && Game._instance !== this) {
            // 如果已经存在实例，销毁当前节点
            this.node.destroy();
            return;
        }
        // 设置为实例
        Game._instance = this;

        GameWebSocket.instance.connectWebSocket(GameDirector.instance.playerId, GameDirector.instance.token);

        if (GameDirector.instance.playerName !== 'Tourist') {
            this.btns.children.forEach((btn: Node) => {
                const row = Math.floor(parseInt(btn.name) / 13);
                const col = parseInt(btn.name) % 13;
                btn.on(Button.EventType.CLICK, () => {
                    this.makeStep(row, col);
                    if (GameDirector.instance.currentTurn === GameDirector.instance.playerColor) {
                        btn.getComponent(Btn).setColor(GameDirector.instance.playerColor + 1);
                        console.log('row:', row, 'col:', col);
                    }
                });
            });
        } 
    }

    protected start(): void {
        this.updateBtns();
    }

    protected update(dt: number): void {
        let color = GameDirector.instance.playerColor;
        this.label.string = `黑方:${GameDirector.instance.blackPlayerName}
白方: ${GameDirector.instance.whitePlayerName}
当前回合: ${GameDirector.instance.currentTurn === 0 ? '黑方' : '白方'}
你自己: ${GameDirector.instance.playerName}-${color === 0 ? '黑色' : color === 1 ? '白色' : '游客'}`;
    }

    makeStep(row: number, col: number): void {
        if (GameDirector.instance.currentTurn === GameDirector.instance.playerColor) {
            Api.makeStep({ row, col }, GameDirector.instance.playerColor)
        } else {
            this.tipsNode.startJumpEffect('请等待对方落子');
        }
    }

    updateBtns(): void {
        this.btns.children.forEach((btn: Node) => {
            const row = Math.floor(parseInt(btn.name) / 13);
            const col = parseInt(btn.name) % 13;
            btn.getComponent(Btn).setColor(GameDirector.instance.boardState[row][col]);
            console.log(GameDirector.instance.boardState[row][col]);
            
        });
    }
}


