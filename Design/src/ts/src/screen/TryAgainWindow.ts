namespace ctb.screen {
    export class TryAgainWindow extends Phaser.GameObjects.Container {

        _bg:Phaser.GameObjects.Image;
        _star:Phaser.GameObjects.Image;
        _btnBack:Phaser.GameObjects.Image;
        _btnReplay:Phaser.GameObjects.Image;

        totalScoreTxt:Phaser.GameObjects.Text;
        starScoreTxt:Phaser.GameObjects.Text;

        constructor(scene: Phaser.Scene, onBack:(target)=>void, onReplay:(target)=>void) {
            super(scene);

            this.setPosition(-106, -48);

            this._bg = new Phaser.GameObjects.Image(this.scene, 0, 0, 'Try again page');
            this._bg.setOrigin(0, 0);
            // this._bg.setInteractive();
            this._star = new Phaser.GameObjects.Image(this.scene, 400, 415, 'Break Star');
            this._btnBack = new Phaser.GameObjects.Image(this.scene, 600, 580, 'btnBACK1');
            this._btnReplay = new Phaser.GameObjects.Image(this.scene, 765, 580, 'btnReplay1');

            this.totalScoreTxt = this.scene.add.text(830, 355, "", {
                "fontFamily": "Kids Rock Demo",
                "fontSize": 35,
                "color": "#F49F1C",
                "align": 'center',
                'stroke': '#70451A',
                'strokeThickness': 6
            });
            this.totalScoreTxt.setOrigin(0.5, 0.5);

            let grd = this.totalScoreTxt.context.createLinearGradient(0, 0, 0, this.totalScoreTxt.height);
            grd.addColorStop(0, '#FFFF00');
            grd.addColorStop(1, '#C17316');
            this.totalScoreTxt.setFill(grd);

            this.starScoreTxt = this.scene.add.text(635, 431, "", {
                "fontFamily": "Kids Rock Demo",
                "fontSize": 24,
                "color": "#FFFFFF",
                "align": 'center'
            });
            this.starScoreTxt.setOrigin(0.5, 0.5);

            this.add([
                this._bg,
                this._star,
                this._btnBack,
                this._btnReplay,
                this.totalScoreTxt,
                this.starScoreTxt
            ]);

            this._btnBack.setInteractive({cursor: 'pointer'});
            this._btnBack.on('pointerup', ()=>{
                onBack(this._btnBack);
                // if (this.music) {
                //     this.music.stop();
                // }
            });
            setupButtonTextureBased(this._btnBack, 'btnBACK1', 'btnBACK2');
            this._btnReplay.setInteractive({cursor: 'pointer'});
            this._btnReplay.once('pointerup', ()=>{
                onReplay(this._btnReplay);
                if (this.music) {
                    this.music.stop();
                }
            });
            setupButtonTextureBased(this._btnReplay, 'btnReplay1', 'btnReplay2');
        }

        private music = null;
        public show(score:number, starScore:number):void {
            this._star.scale = 1.25;
            this.scene.tweens.add({
                targets: this._star,
                "scale": 1,
                duration: 500,
                ease: Phaser.Math.Easing.Back.Out
            });

            this.totalScoreTxt.text = String(score);
            this.starScoreTxt.text = String(starScore);

            this.music = this.scene.sound.add("Fail - close one");
            this.music.play();
        }
    }
}