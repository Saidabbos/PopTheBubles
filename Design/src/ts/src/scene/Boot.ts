module ctb.scene {
    export class Boot extends Phaser.Scene {
        init() {
            new FitScaleManager(this.game).setup();
        }

        create() {
            game.scene.remove('Boot');
            game.scene.add('Preloader', ctb.scene.Preloader, true);
        }
    }
}