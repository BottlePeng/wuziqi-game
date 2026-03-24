import { _decorator, Component, easing, Label, Node, tween, UIOpacity, Vec3, Tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Tips')
export class Tips extends Component {
    @property(Label)
    label: Label = null!;

    @property
    jumpDistance: number = -300; // 移动的距离

    @property
    jumpDuration: number = 1; // 移动的时间

    private _uiOpacity: UIOpacity = null!;
    private initialPosition: Vec3 = new Vec3(0, 0, 0);
    private _tweenOpacity: Tween<UIOpacity> | null = null;
    private _tweenPosition: Tween<Node> | null = null;

    start() {
        this._uiOpacity = this.node.getComponent(UIOpacity) || this.node.addComponent(UIOpacity);
        this.initialPosition = this.node.position.clone();
        this.node.active = false;
    }

    /**
     * 停止当前动画
     */
    private stopCurrentAnimation(): void {
        if (this._tweenOpacity) {
            this._tweenOpacity.stop();
            this._tweenOpacity = null;
        }
        if (this._tweenPosition) {
            this._tweenPosition.stop();
            this._tweenPosition = null;
        }
        // 重置状态
        this._uiOpacity.opacity = 255;
        this.node.setPosition(this.initialPosition);
        this.node.active = false;
    }

    /**
     * 启动跳跃和渐变效果
     */
    startJumpEffect(tips: string) {
        // 停止正在播放的动画
        this.stopCurrentAnimation();

        if (!this.label) {
            console.warn('Tips: label is not assigned');
            return;
        }

        this.label.string = tips;
        this.node.active = true;
        this._uiOpacity.opacity = 255;
        this.node.setPosition(this.initialPosition);

        const targetPosition = this.initialPosition.clone().add(new Vec3(0, this.jumpDistance, 0));

        // 透明度动画
        this._tweenOpacity = tween(this._uiOpacity)
            .to(this.jumpDuration, { opacity: 0 }, { easing: easing.circIn })
            .call(() => {
                this._uiOpacity.opacity = 255;
            })
            .start();

        // 位置动画
        this._tweenPosition = tween(this.node)
            .to(this.jumpDuration, { position: targetPosition }, { easing: easing.quintOut })
            .call(() => {
                this.node.setPosition(this.initialPosition);
                this.node.active = false;
            })
            .start();
    }

    onDestroy() {
        this.stopCurrentAnimation();
    }
}