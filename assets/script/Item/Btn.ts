import { _decorator, Color, Component, Node, Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Btn')
export class Btn extends Component {
    protected start(): void {
        this.node.getChildByName('Sprite').active = false;
    }

    setColor(color: number) {
        let sprite = this.node.getChildByName('Sprite');
        switch (color) {
            case 0:
                sprite.active = false;
                break;
            case 1:
                sprite.getComponent(Sprite).color = new Color(0, 0, 0);
                sprite.active = true;
                break;
            case 2:
                sprite.getComponent(Sprite).color = new Color(255, 255, 225);
                sprite.active = true;
                break;
        }
    }
}

