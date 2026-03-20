import { _decorator, Button, Component, director, EditBox, Label, Node, Prefab } from 'cc';
import { GameDirector } from '../globel/gameDirector';
import { Api } from '../api/api';
import { tips } from '../prefab/tips';
const { ccclass, property } = _decorator;

@ccclass('Login')
export class Login extends Component {
    @property(tips)
    tipsPrefab: tips = null;

    @property(EditBox)
    editBox: EditBox = null;

    @property(Label)
    label: Label = null;

    @property(Button)
    joinBtn: Button = null;

    @property(Button)
    watchBtn: Button = null;

    black_player_name: string | null = null;
    white_player_name: string | null = null;

    protected onLoad(): void {
        this.joinBtn.node.on(Button.EventType.CLICK, this.onJoinBtnClick, this);
        this.watchBtn.node.on(Button.EventType.CLICK, this.onWatchBtnClick, this);
    }

    protected update(dt: number): void {
        this.black_player_name = GameDirector.instance.gameInfo.black_player_name;
        this.white_player_name = GameDirector.instance.gameInfo.white_player_name;

        this.label.string = `当前对局:
黑方: ${this.black_player_name ? this.black_player_name : '无'}
白方: ${this.white_player_name ? this.white_player_name : '无'}`;
    }

    async onJoinBtnClick() {
        let playerName = this.editBox.string;
        if (!playerName) {
            this.tipsPrefab.startJumpEffect('请输入昵称');
            return;
        }

        await GameDirector.instance.getGameInfo();
        let res = await Api.isHasPlayer(this.editBox.string);
        
        if (res) {
            // 跳转GameScene
            director.loadScene('Game');
        } else {
            this.tipsPrefab.startJumpEffect('用户名不可用,请联系管理员');
        }
    }

    onWatchBtnClick() {
        // 跳转GameScene
        director.loadScene('Game');
    }
}
