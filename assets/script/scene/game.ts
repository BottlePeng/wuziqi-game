import { _decorator, Component, Label, Node } from 'cc';
import { GameDirector } from '../globel/gameDirector';
import { GameWebSocket } from '../network/webSocket';
const { ccclass, property } = _decorator;

@ccclass('game')
export class game extends Component {
    @property(Label)
    label: Label = null;

    protected onLoad(): void {
        GameWebSocket.instance.connectWebSocket(GameDirector.instance.playerId, GameDirector.instance.token);
    }

    protected update(dt: number): void {
        let color = GameDirector.instance.playerColor;
        this.label.string = `黑方:${GameDirector.instance.blackPlayerName}
白方: ${GameDirector.instance.whitePlayerName}
当前回合: ${GameDirector.instance.currentTurn === 0 ? '黑方' : '白方'}
你自己: ${GameDirector.instance.playerName}-${color === 0 ? '黑色' : color === 1 ? '白色' : '游客'}`;
    }
}


