namespace ctb.screen {
    export class CompleteWindow extends Phaser.GameObjects.Container {

        _bgComplete:Phaser.GameObjects.Image;
        _cup:Phaser.GameObjects.Image;
        _btnBack:Phaser.GameObjects.Image;
        _btnReplay:Phaser.GameObjects.Image;
        _btnNext:Phaser.GameObjects.Image;

        totalScoreTxt:Phaser.GameObjects.Text;
        starScoreTxt:Phaser.GameObjects.Text;

        constructor(scene: Phaser.Scene, onBack:(target)=>void, onReplay:(target)=>void, onNext:(target)=>void) {
            super(scene);

            this.setPosition(-104.5, -48);

            this._bgComplete = new Phaser.GameObjects.Image(this.scene, 0, 0, 'Completion page LATEST UPDATED');
            this._bgComplete.setOrigin(0, 0);
            this._bgComplete.setInteractive();
            this._cup = new Phaser.GameObjects.Image(this.scene, 400, 410, 'Trophy');
            this._btnBack = new Phaser.GameObjects.Image(this.scene, 570, 570, 'btnBACK1');
            this._btnReplay = new Phaser.GameObjects.Image(this.scene, 720, 570, 'btnReplay1');
            this._btnNext = new Phaser.GameObjects.Image(this.scene, 870, 570, 'btnNEXT1');

            let _CollectedPoints = new Phaser.GameObjects.Image(this.scene, 620, 440, 'Collected Points');

            this.totalScoreTxt = this.scene.add.text(845, 352, "", {
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

            this.starScoreTxt = this.scene.add.text(648, 433, "", {
                "fontFamily": "Kids Rock Demo",
                "fontSize": 24,
                "color": "#FFFFFF",
                "align": 'center'
            });
            this.starScoreTxt.setOrigin(0.5, 0.5);

            this.add([
                this._bgComplete,
                _CollectedPoints,
                this._cup,
                this._btnBack,
                this._btnReplay,
                this._btnNext,
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
            this._btnNext.setInteractive({cursor: 'pointer'});
            this._btnNext.on('pointerup', ()=>{
                onNext(this._btnNext);
                // if (this.music) {
                //     this.music.stop();
                // }
            });
            setupButtonTextureBased(this._btnNext, 'btnNEXT1', 'btnNEXT2');
        }

        private music = null;
        public show(score:number, starScore:number):void {
            this._cup.scale = 1.25;
            this.scene.tweens.add({
                targets: this._cup,
                "scale": 1,
                duration: 500,
                ease: Phaser.Math.Easing.Back.Out
            });

            this.totalScoreTxt.text = String(score);
            this.starScoreTxt.text = String(starScore);

            // let music = this.scene.sound.add("viktory");
            this.music = this.scene.sound.add("Activity completion fantastic");
            this.music.play();
        }
    }
}