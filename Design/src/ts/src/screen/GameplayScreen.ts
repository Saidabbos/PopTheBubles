namespace ctb.screen {

    import Gameplay = ctb.core.Gameplay;
    import Preloader = ctb.scene.Preloader;

    export class GameplayScreen extends Phaser.GameObjects.Container {
        _gameStage: Phaser.GameObjects.Image;
        _btnClose: Phaser.GameObjects.Image;

        private gameplayContainer: Phaser.GameObjects.Container;

        gameplay: Gameplay;

        _btnSound: Phaser.GameObjects.Image;

        words:Phaser.GameObjects.Container[];

        private bgMusic:any = null;

        private character:Phaser.GameObjects.Sprite;

        private tfCorrectAnswerCount:Phaser.GameObjects.Text;
        private tfWrongAnswerCount:Phaser.GameObjects.Text;
        private tfTimer:Phaser.GameObjects.Text;

        constructor(scene: Phaser.Scene, gameplay: Gameplay) {
            super(scene);
            this.gameplay = gameplay;window["gs"]=this;

            this._gameStage = new Phaser.GameObjects.Image(this.scene, game.scale.width / 2, game.scale.height / 2, 'BG');
            this._gameStage.setOrigin(0.5, 0.5);
            this._gameStage.setScale(1.02);
            // this._gameStage.setInteractive();
            this.add(this._gameStage);

            this._btnClose = new Phaser.GameObjects.Image(this.scene, 1025-105, 100-50,'x Button');
            this._btnClose.setInteractive({cursor: 'pointer'});
            this._btnClose["defScale"] = this._btnClose.scale;
            setupButtonTextureBased(this._btnClose, 'x Button','x Button HOVER EFFECT');
            this.add(this._btnClose);
            this._btnClose.on('pointerup', () => {
                playBtnClickAnim(this._btnClose);

                this.onCloseClick();
            });
            this._btnSound = new Phaser.GameObjects.Image(this.scene, 160-105, 100-50, 'Sound');
            this._btnSound.setInteractive({cursor: 'pointer'});
            this._btnSound["defScale"] = this._btnSound.scale;
            setupButtonTextureBased(this._btnSound, 'Sound','Sound HOVER EFFECT');
            this.add(this._btnSound);
            this._btnSound.on('pointerup', () => {
                playBtnClickAnim(this._btnSound);

                this.onSoundClick();
            });
        }


        private correctAudio = null;
        private playCorrectAudio():void {
            if (this.correctAudio) {
                this.correctAudio.stop();
            }
            this.correctAudio = this.scene.sound.add(this.gameplay.currentWordData["word"]);
            this.correctAudio.play();
            if (this.areYouSureWindow && this.areYouSureWindow.parentContainer == this) {
                this.correctAudio.pause();
            }
        }

        public onSoundClick(): void {
            this.playCorrectAudio();
        }

        private idleDelayedCall = null;
        private playIdle:()=>void = ()=>{
            Preloader.playAnim('turtle_idle', this.character, ()=> {
                this.idleDelayedCall = delayedCall(Math.floor(Math.random()*5)*500, this.playIdle);
            });
        };
        private destroyIdleDelayedCallIfExists():void {
            if (this.idleDelayedCall != null) {
                destroyDelayedCall(this.idleDelayedCall);
                this.idleDelayedCall = null;
            }
        }

        public showGameplay(): void {
            setPageBackground("bg-australia");

            this.bgMusic = this.scene.sound.add("Bachground ambience");
            this.bgMusic.play();
            this.bgMusic.loop = true;

            this.gameplayContainer = new Phaser.GameObjects.Container(this.scene);
            this.addAt(this.gameplayContainer, this.getIndex(this._btnClose));

            this.gameplay.reset();

            this.createRounds();
            this.prepareRound();
            this.gameplay.setupCallbacks(this.showCompleteWindow, this.showLoseWindow, ()=>{
                this.onNewRound(true);
            });
        }

        public createRounds():void {
            this.gameplayContainer.removeAll();

            this.character = this.scene.add.sprite(205, 435, null);
            this.playIdle();
            this.gameplayContainer.add(this.character);

            let randomized:object[] = this.gameplay.allWorlds.slice();//Phaser.Utils.Array.Shuffle(this.gameplay.allWorlds.slice());
            this.words = [];
            let positions = [
                {x:68, y:174},{x:235, y:72},{x:461, y:98},{x:367, y:253},{x:674, y:52},{x:605, y:226},{x:429, y:416},{x:654, y:390}
            ];
            for (let i:number = 0; i < randomized.length; i++) {
                let w:Phaser.GameObjects.Container = new Phaser.GameObjects.Container(this.scene, positions[i]['x']+20+83, positions[i]['y']+23+65);
                w.add(w["-image-"] = this.scene.add.sprite(0, 0, null));
                w["-image-"].setOrigin(0.5, 0.5);
                this.words.push(w);

                let txt:Phaser.GameObjects.Text | Phaser.GameObjects.Image;
                if (this.gameplay.useImages) {
                    txt = new Phaser.GameObjects.Image(this.scene, 0, 0, randomized[i]["imageKey"]);
                    w.add(txt);
                } else {
                    txt = this.scene.add.text(0, -5, "", {
                        "fontFamily": "Quran Era font",
                        "fontSize": 55 as any,
                        "color": "#000000",
                        "align": 'center'
                    });
                    txt.setOrigin(0.5, 0.5);
                    txt.style.fixedHeight = 75;
                    txt.setText(randomized[i]["word"]);
                    w.add(txt);
                }

                w["-letter-"] = txt;
                w["-word-text-"] = randomized[i]["word"];
                this.gameplayContainer.add(w);

                Preloader.playAnim('bubble_idle', w["-image-"]);
            }

            for (let word of this.words) {
                word.setSize(word["-image-"].width, word["-image-"].height);
                word.setInteractive({cursor: 'pointer'});

                word.on('pointerdown', () => {
                    this.setInputEnabled(false);

                    if (word["-word-text-"] == this.gameplay.currentWordData["word"]) {
                        this.onCorrectAnswer();

                        word.destroy(true);
                        this.showPopBubble(word);

                        // this.fadeBubblesOut();

                        this.tfCorrectAnswerCount.setText(String(this.gameplay.correctAnswersCount));
                    } else {
                        let lost:boolean = this.onWrongAnswer();

                        this.shakeBubble(word);

                        delayedCall(500, ()=>{
                            this.destroyIdleDelayedCallIfExists();
                            Preloader.playAnim('turtle_shock_in', this.character, ()=>{
                                delayedCall(800, ()=>{
                                    Preloader.playAnim('turtle_shock_out', this.character, this.playIdle);
                                });
                            });
                            this.scene.sound.add("Turtle animation sfx").play();
                        });

                        delayedCall(3200, ()=>{
                            if (!lost) {
                                this.setInputEnabled(true);
                            }
                        });

                        this.tfWrongAnswerCount.setText(String(this.gameplay.wrongAnswersCount));
                    }
                });
            }

            this._btnClose.setInteractive({cursor: 'pointer', pixelPerfect:true});

            this.setInputEnabled(false);

            this.tfCorrectAnswerCount = this.scene.add.text(game.scale.width/2-118, 29, "0", {
                "fontFamily": "Kids Rock Demo",
                "fontSize": 20 as any,
                "color": "#FFFFFF",
                "align": 'center'
            });
            this.gameplayContainer.add(this.tfCorrectAnswerCount);
            this.tfWrongAnswerCount = this.scene.add.text(game.scale.width/2-26, 29, "0", {
                "fontFamily": "Kids Rock Demo",
                "fontSize": 20 as any,
                "color": "#FFFFFF",
                "align": 'center'
            });
            this.gameplayContainer.add(this.tfWrongAnswerCount);
            this.tfTimer = this.scene.add.text(game.scale.width/2+73, 29, "00:00", {
                "fontFamily": "Kids Rock Demo",
                "fontSize": 20 as any,
                "color": "#FFFFFF",
                "align": 'center'
            });
            this.gameplayContainer.add(this.tfTimer);

            let seconds:number = 120;
            this.renderTimer(seconds);
            this.timerEvent = this.scene.time.addEvent({ delay: 1000, repeat: seconds });
            this.timerEvent.callback = ()=>{
                if (this.timerEvent.repeatCount == 0) {
                    this.showLoseWindow(0, 0);
                }
                this.renderTimer(this.timerEvent.repeatCount);
            };
        }

        private timerEvent: Phaser.Time.TimerEvent;

        private renderTimer(seconds:number):void {
            let sec:number = seconds % 60;
            let min:number = Math.round((seconds - sec) / 60);
            this.tfTimer.setText((min < 10 ? '0'+min:min)
                +":"+
                (sec < 10 ? '0'+sec:sec));
        }

        private showPopBubble(bubble) {
            let bubble_poping = this.scene.add.sprite(bubble.x, bubble.y, null);
            this.gameplayContainer.add(bubble_poping);
            Preloader.playAnim('bubble_poping', bubble_poping, ()=>{
                if (bubble_poping.parentContainer) bubble_poping.parentContainer.remove(bubble_poping);
            });
        }

        private shakeBubble(bubble) {
            this.scene.tweens.add({
                targets: bubble,
                x: bubble.x-5,
                duration: 100,
                yoyo: true,
                repeat: 5
            });
            this.scene.tweens.add({
                targets: bubble,
                y: bubble.y+5,
                duration: 70,
                yoyo: true,
                repeat: 5
            });
        }

        private addIdleAnim(bubble) {
            this.scene.tweens.add({
                targets: bubble,
                "scaleX": 0.95,
                duration: 1000,
                yoyo: true,
                repeat: -1
            });
            this.scene.tweens.add({
                targets: bubble,
                "scaleY": 0.97,
                duration: 800,
                yoyo: true,
                repeat: -1
            });
        }

        public prepareRound():void {
            delayedCall(750, ()=>{
                this.playCorrectAudio();

                delayedCall(750, ()=>{this.setInputEnabled(true);});
            });
        }

        private onNewRound(showOut:boolean):void {
            this.setInputEnabled(false);

            if (showOut) {
                this.prepareRound();
            }
        }

        private sfxBubblePopCounter:number = 0;
        public onCorrectAnswer(): boolean {
            let i: number = this.gameplay.getCurrentTotalAnswersCount();

            let completed:boolean = this.gameplay.onCorrectAnswer();

            this.scene.sound.add(this.sfxBubblePopCounter++%2==0?'Bubble Pop 1':'Bubble Pop 2').play();

            return completed;
        }

        public onWrongAnswer(): boolean {
            let i: number = this.gameplay.getCurrentTotalAnswersCount();

            let lost:boolean = this.gameplay.onWrongAnswer();

            this.scene.sound.add("Wrong click").play();

            this.destroyIdleDelayedCallIfExists();

            if (!lost) delayedCall(2500, ()=>{this.playCorrectAudio();});

            return lost;
        }

        public onCloseClick(): void {
            this.showAreYouSurePage();
            this.scene.sound.add('warning page pop up sfx').play();
        }

        private wfsnd = null;
        private instructionPage: InstructionPage;
        public showInstructionPage(): void {
            setPageBackground("bg-blue");

            let playInstructionSound:()=>void = ()=>{
                if (this.wfsnd) {
                    this.wfsnd.stop();
                }
                this.wfsnd = this.scene.sound.add("Help Salty");
                this.wfsnd.play();
            };

            this.instructionPage = new InstructionPage(this.scene, (target) => {
                playBtnClickAnim(target);
                this.instructionPage.destroy(true);
                this.showGameplay();

                if (this.wfsnd) {
                    this.wfsnd.stop();
                }
            },(target) => {
                playBtnClickAnim(target);
                playInstructionSound();
            });
            this.add(this.instructionPage);
            playInstructionSound();
        }

        private areYouSureWindow:AreYouSureWindow;
        public showAreYouSurePage(): void {
            pauseAllDelayedCalls();
            setPageBackground("bg-blue");
            this.scene.tweens.pauseAll();

            this.pauseSounds();

            this.areYouSureWindow = new AreYouSureWindow(this.scene, ()=> {
                this.scene.tweens.resumeAll();
                this.areYouSureWindow.destroy(true);
                this.destroyGameplay();
                this.showInstructionPage();
            },()=> {
                this.scene.tweens.resumeAll();
                this.areYouSureWindow.destroy(true);
                this.unpauseSounds();
                resumeAllDelayedCalls();
                setPageBackground("bg-australia");
            });
            this.add(this.areYouSureWindow);
        }

        public showCompleteWindow: (score: number, starScore: number) => void = (score: number, starScore: number) => {
            let completeWindow: CompleteWindow = new CompleteWindow(this.scene, (target) => {
                playBtnClickAnim(target);
            }, (target) => {
                playBtnClickAnim(target);
                this.destroyGameplay();
                completeWindow.destroy(true);
                this.showInstructionPage();
            }, (target) => {
                playBtnClickAnim(target);
            });
            this.setInputEnabled(false);
            delayedCall(2500, () => {
                setPageBackground("bg-blue");

                this.add(completeWindow);
                completeWindow.show(score, starScore);

                this.bgMusic.stop();
            });
        };

        public showLoseWindow: (score: number, starScore: number) => void = (score: number, starScore: number) => {
            this.timerEvent.destroy();

            let tryAgainWindow: TryAgainWindow = new TryAgainWindow(this.scene, (target) => {
                playBtnClickAnim(target);
            }, (target) => {
                playBtnClickAnim(target);
                this.destroyGameplay();
                tryAgainWindow.destroy(true);
                this.showInstructionPage();
            });
            this.setInputEnabled(false);
            delayedCall(3000, () => {
                setPageBackground("bg-blue");

                this.add(tryAgainWindow);
                tryAgainWindow.show(score, starScore);

                this.bgMusic.stop();
            });
        };

        public setInputEnabled(enabled: boolean): void {
            if (enabled) {
                for (let a of this.words) if (a.parentContainer) a.setInteractive({cursor: 'pointer'});
            } else {
                for (let a of this.words) a.disableInteractive();
            }
        }

        public pauseSounds():void {
            this.scene.sound.pauseAll();
        }

        public unpauseSounds():void {
            this.scene.sound.resumeAll();
        }

        public destroyGameplay():void {
            this.setInputEnabled(false);
            this.remove(this.gameplayContainer);
            this.scene.sound.stopAll();
            destroyAllDelayedCalls();
        }
    }
}