import { _decorator, Button, Component, director, EditBox, Label, Node, Prefab } from 'cc';
import { GameDirector } from '../globel/gameDirector';
import { Api } from '../api/api';
import { Tips } from '../prefab/tips';
const { ccclass, property } = _decorator;

@ccclass('Login')
export class Login extends Component {
    @property(Tips)
    tipsNode: Tips = null;

    @property(EditBox)
    editBox: EditBox = null;

    @property(Button)
    joinBtn: Button = null;

    @property(Button)
    watchBtn: Button = null;
    

    protected onLoad(): void {
        this.joinBtn.node.on(Button.EventType.CLICK, this.onJoinBtnClick, this);
        this.watchBtn.node.on(Button.EventType.CLICK, this.onWatchBtnClick, this);
    }

    async onJoinBtnClick() {
        let playerName = this.editBox.string;
        if (!playerName) {
            this.tipsNode.startJumpEffect('请输入昵称');
            return;
        }

        try {
            await Api.joinGame(playerName);
            // 跳转Game场景
            director.loadScene('Game');
        } catch (error) {
            this.tipsNode.startJumpEffect(error);
            console.error(error);
        }
    }

    onWatchBtnClick() {
        try {
            Api.joinGame('Tourist');
            // 跳转Game场景
            director.loadScene('Game');
        } catch (error) {
            this.tipsNode.startJumpEffect(error);
            console.error(error);
        }
    }
}
