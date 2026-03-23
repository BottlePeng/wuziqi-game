import { _decorator, Button, Component, director, EditBox, Label, Node, Prefab } from 'cc';
import { GameDirector } from '../globel/gameDirector';
import { Api } from '../api/api';
import { Tips } from '../prefab/tips';
const { ccclass, property } = _decorator;

@ccclass('Login')
export class Login extends Component {
    @property(Tips)
    tipsPrefab: Tips = null;

    @property(EditBox)
    editBox: EditBox = null;

    @property(Label)
    label: Label = null;

    @property(Button)
    joinBtn: Button = null;

    @property(Button)
    watchBtn: Button = null;

    blackPlayer: string | null = null;
    whitePlayer: string | null = null;
    watchers: number = 0;
    

    protected onLoad(): void {
        this.joinBtn.node.on(Button.EventType.CLICK, this.onJoinBtnClick, this);
        this.watchBtn.node.on(Button.EventType.CLICK, this.onWatchBtnClick, this);
    }

    protected update(dt: number): void {
        this.blackPlayer = GameDirector.instance.blackPlayerName;
        this.whitePlayer = GameDirector.instance.whitePlayerName;
        this.watchers = GameDirector.instance.watchers;

        this.label.string = `当前对局:
黑方: ${this.blackPlayer ? this.blackPlayer : '无'}
白方: ${this.whitePlayer ? this.whitePlayer : '无'}
观战人数: ${this.watchers} / 10
token = ${GameDirector.instance.token}`;
    }

    async onJoinBtnClick() {
        let playerName = this.editBox.string;
        if (!playerName) {
            this.tipsPrefab.startJumpEffect('请输入昵称');
            return;
        }

        if (playerName !== this.blackPlayer && playerName !== this.whitePlayer) {
            try {

                let id: number = await Api.isHasPlayer(playerName);
                
                if (id !== -1) {
                    let token:string = '';
                    if (this.blackPlayer === null) {
                        token = await Api.joinGame(id, 0);
                    } else if (this.whitePlayer === null){
                        token = await Api.joinGame(id, 1);
                    } else {
                        this.tipsPrefab.startJumpEffect('对局玩家已满');
                    }

                    GameDirector.instance.token = token;
                    GameDirector.instance.playerName = playerName;
                    GameDirector.instance.playerId = id;

                    // 跳转GameScene
                    // director.loadScene('Game');
                    console.log('跳转GameScene');
                } else {
                    this.tipsPrefab.startJumpEffect('用户名不可用,请联系管理员');
                }
            } catch (error) {
                this.tipsPrefab.startJumpEffect(error);
                console.error(error);
            }
        } else {
            this.tipsPrefab.startJumpEffect('该用户已在线,请选择其他用户名');
        }
    }

    onWatchBtnClick() {
        GameDirector.instance.playerName = this.editBox.string;
        
        if (this.watchers < 10) {
            Api.joinGame(-1, 0);
            // 跳转Game场景
            // director.loadScene('Game');
            console.log('跳转GameScene');
        } else { 
            this.tipsPrefab.startJumpEffect('观战人数已满');
        }
    }
}
