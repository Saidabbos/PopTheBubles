module ctb.scene {

    export class Preloader extends Phaser.Scene {

        public static readonly ANIMS_DATA:object = {
            'bubble_poping': {
                'start': 0,
                'end': 26,
                'padNum': 4,
                'prefix': 'bubble_poping',
                'repeat': 0,
                'frameRate': 24,
                'atlas': 'bubble-atlas'
            },
            'bubble_idle': {
                'start': 0,
                'end': 50,
                'padNum': 4,
                'prefix': 'idle',
                'repeat': -1,
                'frameRate': 24,
                'atlas': 'bubble-atlas'
            },
            'turtle_idle': {
                'start': 0,
                'end': 35,
                'padNum': 4,
                'prefix': 'turtle_idle',
                'repeat': 0,
                'frameRate': 24,
                'atlas': 'turtle-idle-atlas'
            },
            'turtle_shock_in': {
                'start': 0,
                'end': 16,
                'padNum': 4,
                'prefix': 'turtle_shock',
                'repeat': 0,
                'frameRate': 24,
                'atlas': 'turtle_shock-atlas'
            },
            'turtle_shock_out': {
                'start': 16,
                'end': 32,
                'padNum': 4,
                'prefix': 'turtle_shock',
                'repeat': 0,
                'frameRate': 24,
                'atlas': 'turtle_shock-atlas'
            },
        };

        preload() {
            this.load.json('gameplay', 'assets/json/gameplay.json');
        }

        create() {
            let json = game.cache.json.get('gameplay');
            if (json["useImages"]) {
                for (let w of json["words"]) {
                    this.load.image(w["letterName"], "assets/imgs/words/"+w["imageKey"]+".png");
                }
            }
            for (let w of json["words"]) {
                this.load.audio(w["audioKey"], "assets/sound/mp3/words/"+w["audioKey"]+".mp3");
            }

            let progressTxt:Phaser.GameObjects.Text = this.add.text(game.scale.width/2, game.scale.height/2, "", {
                "fontFamily": "Quran Era font",
                "fontSize": 25,
                "color": "#000000",
                "align": 'center'
            });
            progressTxt.setOrigin(0.5, 0.5);

            this.load.pack('preloader', 'assets/pack.json');

            this.load.on('progress', (value:number) => {
                progressTxt.text = Math.ceil(value * 100) + "%";
            }, this);

            this.load.on('complete', () => {
                this.nextScene();
            });

            this.load.start();
        }

        public static playAnim(animKey:string, sprite:Phaser.GameObjects.Sprite, onComplete:()=>void = null):Phaser.GameObjects.Sprite {
            let mainScene = game.scene.getScene('ScreenMain');
            if (!mainScene.anims.exists(animKey)) {
                let data = Preloader.ANIMS_DATA[animKey];
                mainScene.anims.create({
                    key: animKey,
                    frames: mainScene.anims.generateFrameNames(data['atlas'], {
                        start: data['start'], end: data['end'], zeroPad: data['padNum'],
                        prefix: data['prefix'], suffix: ''
                    }),
                    frameRate: data['frameRate'],
                    repeat: data['repeat']
                });
            }
            if (sprite.anims.currentAnim) {
                sprite.anims.currentAnim.off('complete');
            }
            sprite.anims.stop();
            sprite.play(animKey);
            sprite.anims.currentAnim.once('complete', ()=>{
                if (onComplete) onComplete();
            });
            return sprite;
        }

        private nextScene():void {
            game.scene.remove('Preloader');
            game.scene.add('ScreenMain', ctb.scene.MainScene, true);
        }
    }
}