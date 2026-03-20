import { _decorator, Component, easing, Label, Node, tween, UIOpacity, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('tips')
export class tips extends Component {
    @property(Label)
    label: Label = null!;

    @property
    jumpDistance: number = -300; // 移动的距离

    @property
    jumpDuration: number = 1; // 移动的时间

    private _uiOpacity: UIOpacity = null!; // 添加UIOpacity引用

    start() {
        // 确保节点有UIOpacity组件
        this._uiOpacity = this.node.getComponent(UIOpacity) || this.node.addComponent(UIOpacity);
    }

    // 启动跳跃和渐变效果
    startJumpEffect(tips: string) {
        if (this.label) {
            this.label.string = tips;
        } else {
            console.warn('TipJump: label is not assigned');
        }

        const initialPosition = new Vec3(this.node.position);
        const targetPosition = initialPosition.clone().add(new Vec3(0, this.jumpDistance, 0));

        tween(this._uiOpacity) // 对UIOpacity组件进行tween
            .to(this.jumpDuration, { opacity: 0 }, { easing: easing.circIn }) // 渐变消失
            .call(() => {
                // 动画结束后,设置节点位置为初始位置,并设置UIOpacity组件的opacity为255
                this._uiOpacity.opacity = 255;
            })
            .start();

        // 位置动画单独处理
        tween(this.node)
            .to(this.jumpDuration, { position: targetPosition }, { easing: easing.quintOut })
            .call(() => {
                this.node.setPosition(initialPosition);
            })
            .start();
    }
}


