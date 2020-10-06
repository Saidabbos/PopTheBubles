module ctb.scene {
    export class Boot extends Phaser.Scene {
        init() {
            this.game.scale.transformX = (pageX: number) => {
                let offsetLeft: number = 0;
                let parentElement = game.canvas.parentElement;
                while (parentElement) {
                    if (parentElement.offsetLeft) {
                        offsetLeft = parentElement.offsetLeft;
                        break;
                    }
                    parentElement = parentElement.parentElement;
                }
                return (pageX - offsetLeft) * this.game.scale.displayScale.x;
            };
            this.game.scale.transformY = (pageY: number) => {
                let offsetTop: number = 0;
                let parentElement = game.canvas.parentElement;
                while (parentElement) {
                    if (parentElement.offsetTop) {
                        offsetTop = parentElement.offsetTop;
                        break;
                    }
                    parentElement = parentElement.parentElement;
                }
                return (pageY - offsetTop) * this.game.scale.displayScale.y;
            };
        }

        create() {
            game.scene.remove('Boot');
            game.scene.add('Preloader', ctb.scene.Preloader, true);
        }
    }
}