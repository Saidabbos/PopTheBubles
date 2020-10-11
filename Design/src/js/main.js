var ctb;
(function (ctb) {
    class App extends Phaser.Game {
        constructor() {
            let config = {
                type: Phaser.AUTO,
                width: App.CANVAS_WIDTH,
                height: App.CANVAS_HEIGHT,
                parent: 'game-container',
                dom: {
                    createContainer: false
                },
                scale: {
                    mode: FitScaleManager.detectBestScaleMode(),
                    autoCenter: Phaser.Scale.CENTER_BOTH
                },
                transparent: true,
                scene: {
                    create: () => {
                        this.scene.add('Boot', ctb.scene.Boot, true);
                    }
                }
            };
            super(config);
        }
    }
    App.CANVAS_WIDTH = 980;
    App.CANVAS_HEIGHT = 600;
    ctb.App = App;
})(ctb || (ctb = {}));
let game;
window.onload = () => {
    game = new ctb.App();
};
let delayedCalls = [];
function delayedCall(delay, callback, args, callbackScope) {
    let scene = game.scene.getAt(0);
    if (scene) {
        let dc = scene.time.delayedCall(delay, callback, args, callbackScope);
        delayedCalls.push(dc);
        return dc;
    }
    let t = setTimeout(callback, delay);
    delayedCalls.push(t);
    return t;
}
function pauseAllDelayedCalls() {
    for (let dc of delayedCalls) {
        if (dc instanceof Phaser.Time.TimerEvent) {
            dc.paused = true;
        }
    }
}
function resumeAllDelayedCalls() {
    for (let dc of delayedCalls) {
        if (dc instanceof Phaser.Time.TimerEvent) {
            dc.paused = false;
        }
    }
}
function destroyAllDelayedCalls() {
    for (let dc of delayedCalls) {
        if (dc instanceof Phaser.Time.TimerEvent) {
            dc.remove(false);
        }
        else {
            clearTimeout(dc);
        }
    }
    delayedCalls = [];
}
function destroyDelayedCall(dc) {
    if (dc instanceof Phaser.Time.TimerEvent) {
        dc.remove(false);
    }
    else {
        clearTimeout(dc);
    }
    let ind = delayedCalls.indexOf(dc);
    if (ind >= 0)
        delayedCalls.splice(ind, 1);
}
function setPageBackground(bg) {
    document.querySelector("html").style.backgroundImage = "url(assets/imgs/" + bg + ".jpg)";
}
function setupButton(btn, frame) {
    btn.on('pointerdown', () => { btn.setFrame(frame + '_hover' + '0000'); });
    btn.on('pointerover', () => { btn.setFrame(frame + '_hover' + '0000'); game.scene.getAt(0).sound.add("button hover").play(); });
    btn.on('pointerout', () => { btn.setFrame(frame + '0000'); });
    btn.on('pointerup', () => { btn.setFrame(frame + '0000'); game.scene.getAt(0).sound.add('activity selection - button selection').play(); });
}
function setupButtonTextureBased(btn, texture, hoverTexture) {
    btn.on('pointerdown', () => { btn.setTexture(hoverTexture); });
    btn.on('pointerover', () => { btn.setTexture(hoverTexture); game.scene.getAt(0).sound.add("button hover").play(); });
    btn.on('pointerout', () => { btn.setTexture(texture); });
    btn.on('pointerup', () => { btn.setTexture(texture); game.scene.getAt(0).sound.add('activity selection - button selection').play(); });
}
function playBtnClickAnim(target) {
    let sc = target.hasOwnProperty("defScale") ? target["defScale"] : 1;
    target.scaleX = target.scaleY = sc;
    let scene = game.scene.getAt(0);
    scene.tweens.add({
        targets: target,
        "scaleX": 0.9 * sc,
        "scaleY": 0.9 * sc,
        duration: 100,
        yoyo: true
    });
}
/**
 * @author Roman Parada
 * This class is created to fix overlapping of bottom part of canvas by navigation bar in iOS.
 * It make a delayed resize of the canvas (like Phaser-3 FIT methods does) and it overrides Phaser-3 input window to Phaser-3 core transform methods
 *
 * How to use:
 * Just call the code line below in Boot scene's init() method of your project:
 * new FitScaleManager(this.game).setup();
 */
class FitScaleManager {
    constructor(game) {
        this.doResize = () => {
            let scale = this.calculateScale();
            let newCanvasWidth = this.phaserScaleManager.width * scale;
            let newCanvasHeight = this.phaserScaleManager.height * scale;
            this.canvasStyle.width = newCanvasWidth + 'px';
            this.canvasStyle.height = newCanvasHeight + 'px';
            this.canvasStyle.marginLeft = (window.innerWidth - newCanvasWidth) / 2 + 'px';
            this.canvasStyle.marginTop = (window.innerHeight - newCanvasHeight) / 2 + 'px';
        };
        this.game = game;
        this.canvasStyle = this.game.canvas.style;
        this.phaserScaleManager = this.game.scale;
    }
    static detectBestScaleMode() {
        let iOS = /iPad|iPhone|iPod/.test(navigator.platform || "");
        let isAndroid = window.navigator.userAgent.toLowerCase().indexOf("android") > -1;
        return iOS || isAndroid ? Phaser.Scale.FIT : Phaser.Scale.NONE;
    }
    ;
    /**
     * Just call this method once in Boot scene's init() method
     */
    setup() {
        this.phaserScaleManager.addListener(Phaser.Scale.Events.RESIZE, this.onResize, this);
        this.overridePhaserTransformMethods();
        this.onResize();
    }
    calculateScale() {
        if (game.scale.scaleMode == Phaser.Scale.NONE)
            return 1;
        return Math.min(window.innerWidth / this.phaserScaleManager.width, window.innerHeight / this.phaserScaleManager.height);
    }
    overridePhaserTransformMethods() {
        this.game.scale.transformX = (pageX) => {
            return (pageX - parseInt(this.canvasStyle.marginLeft.split("px")[0])) / this.calculateScale();
        };
        this.game.scale.transformY = (pageY) => {
            return (pageY - parseInt(this.canvasStyle.marginTop.split("px")[0])) / this.calculateScale();
        };
    }
    onResize() {
        setTimeout(this.doResize, FitScaleManager.RESIZE_DELAY);
    }
}
FitScaleManager.RESIZE_DELAY = 500;
var ctb;
(function (ctb) {
    var core;
    (function (core) {
        class Gameplay {
            constructor() {
                this.currentRound = 0;
                this.correctAnswersCount = 0;
                this.wrongAnswersCount = 0;
                this.correctAnswersCountThisRound = 0;
                this.wrongAnswersCountThisRound = 0;
                this.onNewRound = null;
                this.nextLetterDelay = 0;
                this.failsNumToLose = Number(game.cache.json.get('gameplay')["failsNumToLose"]);
                this.useImages = Boolean(game.cache.json.get('gameplay')["useImages"]);
            }
            setupCallbacks(onComplete, onLose, onNewRound) {
                this.onComplete = onComplete;
                this.onLose = onLose;
                this.onNewRound = onNewRound;
            }
            calculateScore() {
                return this.totalRoundsNum - this.wrongAnswersCount;
            }
            onLetterChosen() {
                if (this.correctAnswersCountThisRound == 1) {
                    this.currentRound++;
                    if (this.currentRound >= this.totalRoundsNum) {
                        let score = this.calculateScore();
                        this.onComplete(score, score);
                        return true;
                    }
                    else {
                        this.nextLetter();
                    }
                }
                return false;
            }
            nextLetter() {
                let fn = () => {
                    this.currentWordData = Phaser.Utils.Array.RemoveRandomElement(this.words);
                    this.correctAnswersCountThisRound = 0;
                    this.wrongAnswersCountThisRound = 0;
                    if (this.onNewRound)
                        this.onNewRound();
                };
                if (this.nextLetterDelay == 0) {
                    fn();
                }
                else {
                    delayedCall(this.nextLetterDelay, fn);
                }
            }
            onCorrectAnswer() {
                this.correctAnswersCount++;
                this.correctAnswersCountThisRound++;
                this.nextLetterDelay = 1500;
                return this.onLetterChosen();
            }
            onWrongAnswer() {
                this.wrongAnswersCount++;
                this.wrongAnswersCountThisRound++;
                this.nextLetterDelay = 0;
                if (this.wrongAnswersCount >= this.failsNumToLose) {
                    this.onLose(0, 0);
                    return true;
                }
                else {
                    this.onLetterChosen();
                }
                return false;
            }
            getCurrentTotalAnswersCount() {
                return this.correctAnswersCount + this.wrongAnswersCount;
            }
            getCurrentTotalAnswersCountThisRound() {
                return this.correctAnswersCountThisRound + this.wrongAnswersCountThisRound;
            }
            isNewRound() {
                return this.getCurrentTotalAnswersCountThisRound() == 0;
            }
            isRoundsComplete() {
                return this.currentRound >= this.totalRoundsNum;
            }
            reset() {
                this.nextLetterDelay = 0;
                this.setupCallbacks(null, null, null);
                let json = game.cache.json.get('gameplay');
                this.words = json["words"].slice();
                this.allWorlds = json["words"].slice();
                this.totalRoundsNum = this.words.length;
                this.nextLetter();
                this.currentRound = 0;
                this.correctAnswersCount = 0;
                this.wrongAnswersCount = 0;
                this.correctAnswersCountThisRound = 0;
                this.wrongAnswersCountThisRound = 0;
            }
        }
        core.Gameplay = Gameplay;
    })(core = ctb.core || (ctb.core = {}));
})(ctb || (ctb = {}));
var ctb;
(function (ctb) {
    var scene;
    (function (scene) {
        class Boot extends Phaser.Scene {
            init() {
                this.game.scale.transformX = (pageX) => {
                    let offsetLeft = 0;
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
                this.game.scale.transformY = (pageY) => {
                    let offsetTop = 0;
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
        scene.Boot = Boot;
    })(scene = ctb.scene || (ctb.scene = {}));
})(ctb || (ctb = {}));
var ctb;
(function (ctb) {
    var scene;
    (function (scene) {
        var Gameplay = ctb.core.Gameplay;
        class MainScene extends Phaser.Scene {
            create() {
                this.gameplay = new Gameplay();
                this.gameplayScreen = new ctb.screen.GameplayScreen(this, this.gameplay);
                this.children.add(this.gameplayScreen);
                this.gameplayScreen.showInstructionPage();
            }
        }
        scene.MainScene = MainScene;
    })(scene = ctb.scene || (ctb.scene = {}));
})(ctb || (ctb = {}));
var ctb;
(function (ctb) {
    var scene;
    (function (scene) {
        class Preloader extends Phaser.Scene {
            preload() {
                this.load.json('gameplay', 'assets/json/gameplay.json');
            }
            create() {
                let json = game.cache.json.get('gameplay');
                if (json["useImages"]) {
                    for (let w of json["words"]) {
                        this.load.image(w["letterName"], "assets/imgs/words/" + w["imageKey"] + ".png");
                    }
                }
                for (let w of json["words"]) {
                    this.load.audio(w["audioKey"], "assets/sound/mp3/words/" + w["audioKey"] + ".mp3");
                }
                let progressTxt = this.add.text(game.scale.width / 2, game.scale.height / 2, "", {
                    "fontFamily": "Quran Era font",
                    "fontSize": 25,
                    "color": "#000000",
                    "align": 'center'
                });
                progressTxt.setOrigin(0.5, 0.5);
                this.load.pack('preloader', 'assets/pack.json');
                this.load.on('progress', (value) => {
                    progressTxt.text = Math.ceil(value * 100) + "%";
                }, this);
                this.load.on('complete', () => {
                    this.nextScene();
                });
                this.load.start();
            }
            static playAnim(animKey, sprite, onComplete = null) {
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
                sprite.anims.currentAnim.once('complete', () => {
                    if (onComplete)
                        onComplete();
                });
                return sprite;
            }
            nextScene() {
                game.scene.remove('Preloader');
                game.scene.add('ScreenMain', ctb.scene.MainScene, true);
            }
        }
        Preloader.ANIMS_DATA = {
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
            'turtle_shock': {
                'start': 0,
                'end': 32,
                'padNum': 4,
                'prefix': 'turtle_shock',
                'repeat': 0,
                'frameRate': 24,
                'atlas': 'turtle_shock-atlas'
            },
        };
        scene.Preloader = Preloader;
    })(scene = ctb.scene || (ctb.scene = {}));
})(ctb || (ctb = {}));
var ctb;
(function (ctb) {
    var screen;
    (function (screen) {
        class AreYouSureWindow extends Phaser.GameObjects.Container {
            constructor(scene, onYes, onNo) {
                super(scene);
                this._areYouSurePage = new Phaser.GameObjects.Image(this.scene, -105, 0 - 48, 'Exit warning');
                this._areYouSurePage.setOrigin(0, 0);
                this._areYouSurePage.setInteractive();
                this._btnSureYes = new Phaser.GameObjects.Image(this.scene, game.scale.width / 2 - 95, 485 - 50, 'btnYES1');
                this._btnSureYes.setInteractive({ cursor: 'pointer' });
                this._btnSureYes.once('pointerup', onYes);
                setupButtonTextureBased(this._btnSureYes, 'btnYES1', 'btnYES2');
                this._btnSureNo = new Phaser.GameObjects.Image(this.scene, game.scale.width / 2 + 95, 485 - 50, 'btnNO1');
                this._btnSureNo.setInteractive({ cursor: 'pointer' });
                this._btnSureNo.once('pointerup', onNo);
                setupButtonTextureBased(this._btnSureNo, 'btnNO1', 'btnNO2');
                this.add(this._areYouSurePage);
                this.add(this._btnSureYes);
                this.add(this._btnSureNo);
            }
        }
        screen.AreYouSureWindow = AreYouSureWindow;
    })(screen = ctb.screen || (ctb.screen = {}));
})(ctb || (ctb = {}));
var ctb;
(function (ctb) {
    var screen;
    (function (screen) {
        class CompleteWindow extends Phaser.GameObjects.Container {
            constructor(scene, onBack, onReplay, onNext) {
                super(scene);
                this.music = null;
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
                this._btnBack.setInteractive({ cursor: 'pointer' });
                this._btnBack.on('pointerup', () => {
                    onBack(this._btnBack);
                    // if (this.music) {
                    //     this.music.stop();
                    // }
                });
                setupButtonTextureBased(this._btnBack, 'btnBACK1', 'btnBACK2');
                this._btnReplay.setInteractive({ cursor: 'pointer' });
                this._btnReplay.once('pointerup', () => {
                    onReplay(this._btnReplay);
                    if (this.music) {
                        this.music.stop();
                    }
                });
                setupButtonTextureBased(this._btnReplay, 'btnReplay1', 'btnReplay2');
                this._btnNext.setInteractive({ cursor: 'pointer' });
                this._btnNext.on('pointerup', () => {
                    onNext(this._btnNext);
                    // if (this.music) {
                    //     this.music.stop();
                    // }
                });
                setupButtonTextureBased(this._btnNext, 'btnNEXT1', 'btnNEXT2');
            }
            show(score, starScore) {
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
        screen.CompleteWindow = CompleteWindow;
    })(screen = ctb.screen || (ctb.screen = {}));
})(ctb || (ctb = {}));
var ctb;
(function (ctb) {
    var screen;
    (function (screen) {
        var Preloader = ctb.scene.Preloader;
        class GameplayScreen extends Phaser.GameObjects.Container {
            constructor(scene, gameplay) {
                super(scene);
                this.bgMusic = null;
                this.correctAudio = null;
                this.idleDelayedCall = null;
                this.playIdle = () => {
                    Preloader.playAnim('turtle_idle', this.character, () => {
                        this.idleDelayedCall = delayedCall(Math.floor(Math.random() * 5) * 500, this.playIdle);
                    });
                };
                this.sfxBubblePopCounter = 0;
                this.wfsnd = null;
                this.showCompleteWindow = (score, starScore) => {
                    let completeWindow = new screen.CompleteWindow(this.scene, (target) => {
                        playBtnClickAnim(target);
                    }, (target) => {
                        playBtnClickAnim(target);
                        this.destroyGameplay();
                        this.remove(completeWindow);
                        this.showInstructionPage();
                    }, (target) => {
                        playBtnClickAnim(target);
                    });
                    this.setInputEnabled(false);
                    delayedCall(2000, () => {
                        setPageBackground("bg-blue");
                        this.add(completeWindow);
                        completeWindow.show(score, starScore);
                        this.bgMusic.stop();
                    });
                };
                this.showLoseWindow = (score, starScore) => {
                    this.timerEvent.destroy();
                    let tryAgainWindow = new screen.TryAgainWindow(this.scene, (target) => {
                        playBtnClickAnim(target);
                    }, (target) => {
                        playBtnClickAnim(target);
                        this.destroyGameplay();
                        this.remove(tryAgainWindow);
                        this.showInstructionPage();
                    });
                    this.setInputEnabled(false);
                    delayedCall(1500, () => {
                        setPageBackground("bg-blue");
                        this.add(tryAgainWindow);
                        tryAgainWindow.show(score, starScore);
                        this.bgMusic.stop();
                    });
                };
                this.gameplay = gameplay;
                window["gs"] = this;
                this._gameStage = new Phaser.GameObjects.Image(this.scene, game.scale.width / 2, game.scale.height / 2, 'BG');
                this._gameStage.setOrigin(0.5, 0.5);
                this._gameStage.setScale(1.02);
                this._gameStage.setInteractive();
                this.add(this._gameStage);
                this._btnClose = new Phaser.GameObjects.Image(this.scene, 1025 - 105, 100 - 50, 'x Button');
                this._btnClose.setInteractive({ cursor: 'pointer' });
                this._btnClose["defScale"] = this._btnClose.scale;
                setupButtonTextureBased(this._btnClose, 'x Button', 'x Button HOVER EFFECT');
                this.add(this._btnClose);
                this._btnClose.on('pointerup', () => {
                    playBtnClickAnim(this._btnClose);
                    this.onCloseClick();
                });
                this._btnSound = new Phaser.GameObjects.Image(this.scene, 160 - 105, 100 - 50, 'Sound');
                this._btnSound.setInteractive({ cursor: 'pointer' });
                this._btnSound["defScale"] = this._btnSound.scale;
                setupButtonTextureBased(this._btnSound, 'Sound', 'Sound HOVER EFFECT');
                this.add(this._btnSound);
                this._btnSound.on('pointerup', () => {
                    playBtnClickAnim(this._btnSound);
                    this.onSoundClick();
                });
            }
            playCorrectAudio() {
                if (this.correctAudio) {
                    this.correctAudio.stop();
                }
                this.correctAudio = this.scene.sound.add(this.gameplay.currentWordData["word"]);
                this.correctAudio.play();
                if (this.areYouSureWindow && this.areYouSureWindow.parentContainer == this) {
                    this.correctAudio.pause();
                }
            }
            onSoundClick() {
                this.playCorrectAudio();
            }
            showGameplay() {
                setPageBackground("bg-australia");
                this.bgMusic = this.scene.sound.add("Bachground ambience");
                this.bgMusic.play();
                this.bgMusic.loop = true;
                this.gameplayContainer = new Phaser.GameObjects.Container(this.scene);
                this.addAt(this.gameplayContainer, this.getIndex(this._btnClose));
                this.gameplay.reset();
                this.createRounds();
                this.prepareRound();
                this.gameplay.setupCallbacks(this.showCompleteWindow, this.showLoseWindow, () => {
                    this.onNewRound(true);
                });
            }
            createRounds() {
                this.gameplayContainer.removeAll();
                this.character = this.scene.add.sprite(205, 435, null);
                this.playIdle();
                this.gameplayContainer.add(this.character);
                let randomized = this.gameplay.allWorlds.slice(); //Phaser.Utils.Array.Shuffle(this.gameplay.allWorlds.slice());
                this.words = [];
                let positions = [
                    { x: 68, y: 174 }, { x: 235, y: 72 }, { x: 461, y: 98 }, { x: 367, y: 253 }, { x: 674, y: 52 }, { x: 605, y: 226 }, { x: 429, y: 416 }, { x: 654, y: 390 }
                ];
                for (let i = 0; i < randomized.length; i++) {
                    let w = new Phaser.GameObjects.Container(this.scene, positions[i]['x'] + 20 + 83, positions[i]['y'] + 23 + 65);
                    w.add(w["-image-"] = this.scene.add.sprite(0, 0, null));
                    w["-image-"].setOrigin(0.5, 0.5);
                    this.words.push(w);
                    let txt;
                    if (this.gameplay.useImages) {
                        txt = new Phaser.GameObjects.Image(this.scene, 0, 0, randomized[i]["imageKey"]);
                        w.add(txt);
                    }
                    else {
                        txt = this.scene.add.text(0, -5, "", {
                            "fontFamily": "Quran Era font",
                            "fontSize": 55,
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
                    word.setInteractive({ cursor: 'pointer' });
                    word.on('pointerdown', () => {
                        this.setInputEnabled(false);
                        if (word["-word-text-"] == this.gameplay.currentWordData["word"]) {
                            this.onCorrectAnswer();
                            word.parentContainer.remove(word);
                            this.showPopBubble(word);
                            // this.fadeBubblesOut();
                            this.tfCorrectAnswerCount.setText(String(this.gameplay.correctAnswersCount));
                        }
                        else {
                            let lost = this.onWrongAnswer();
                            this.shakeBubble(word);
                            Preloader.playAnim('turtle_shock', this.character, this.playIdle);
                            delayedCall(200, () => this.scene.sound.add("Turtle animation sfx").play());
                            delayedCall(550, () => {
                                if (!lost) {
                                    this.setInputEnabled(true);
                                }
                            });
                            this.tfWrongAnswerCount.setText(String(this.gameplay.wrongAnswersCount));
                        }
                    });
                }
                this._btnClose.setInteractive({ cursor: 'pointer', pixelPerfect: true });
                this.setInputEnabled(false);
                this.tfCorrectAnswerCount = this.scene.add.text(game.scale.width / 2 - 118, 29, "0", {
                    "fontFamily": "Kids Rock Demo",
                    "fontSize": 20,
                    "color": "#FFFFFF",
                    "align": 'center'
                });
                this.gameplayContainer.add(this.tfCorrectAnswerCount);
                this.tfWrongAnswerCount = this.scene.add.text(game.scale.width / 2 - 26, 29, "0", {
                    "fontFamily": "Kids Rock Demo",
                    "fontSize": 20,
                    "color": "#FFFFFF",
                    "align": 'center'
                });
                this.gameplayContainer.add(this.tfWrongAnswerCount);
                this.tfTimer = this.scene.add.text(game.scale.width / 2 + 73, 29, "00:00", {
                    "fontFamily": "Kids Rock Demo",
                    "fontSize": 20,
                    "color": "#FFFFFF",
                    "align": 'center'
                });
                this.gameplayContainer.add(this.tfTimer);
                let seconds = 120;
                this.renderTimer(seconds);
                this.timerEvent = this.scene.time.addEvent({ delay: 1000, repeat: seconds });
                this.timerEvent.callback = () => {
                    if (this.timerEvent.repeatCount == 0) {
                        this.showLoseWindow(0, 0);
                    }
                    this.renderTimer(this.timerEvent.repeatCount);
                };
            }
            renderTimer(seconds) {
                let sec = seconds % 60;
                let min = Math.round((seconds - sec) / 60);
                this.tfTimer.setText((min < 10 ? '0' + min : min)
                    + ":" +
                    (sec < 10 ? '0' + sec : sec));
            }
            showPopBubble(bubble) {
                let bubble_poping = this.scene.add.sprite(bubble.x, bubble.y, null);
                this.gameplayContainer.add(bubble_poping);
                Preloader.playAnim('bubble_poping', bubble_poping, () => {
                    if (bubble_poping.parentContainer)
                        bubble_poping.parentContainer.remove(bubble_poping);
                });
            }
            shakeBubble(bubble) {
                this.scene.tweens.add({
                    targets: bubble,
                    x: bubble.x - 5,
                    duration: 100,
                    yoyo: true,
                    repeat: 5
                });
                this.scene.tweens.add({
                    targets: bubble,
                    y: bubble.y + 5,
                    duration: 70,
                    yoyo: true,
                    repeat: 5
                });
            }
            addIdleAnim(bubble) {
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
            prepareRound() {
                delayedCall(750, () => {
                    this.playCorrectAudio();
                    delayedCall(750, () => { this.setInputEnabled(true); });
                });
            }
            onNewRound(showOut) {
                this.scene.sound.add("next_round").play();
                this.setInputEnabled(false);
                if (showOut) {
                    this.prepareRound();
                }
            }
            onCorrectAnswer() {
                let i = this.gameplay.getCurrentTotalAnswersCount();
                let completed = this.gameplay.onCorrectAnswer();
                this.scene.sound.add(this.sfxBubblePopCounter++ % 2 == 0 ? 'Bubble Pop 1' : 'Bubble Pop 2').play();
                return completed;
            }
            onWrongAnswer() {
                let i = this.gameplay.getCurrentTotalAnswersCount();
                let lost = this.gameplay.onWrongAnswer();
                this.scene.sound.add("Wrong click").play();
                if (this.idleDelayedCall != null) {
                    destroyDelayedCall(this.idleDelayedCall);
                    this.idleDelayedCall = null;
                }
                return lost;
            }
            onCloseClick() {
                this.showAreYouSurePage();
                this.scene.sound.add('warning page pop up sfx').play();
            }
            showInstructionPage() {
                setPageBackground("bg-blue");
                let playInstructionSound = () => {
                    if (this.wfsnd) {
                        this.wfsnd.stop();
                    }
                    this.wfsnd = this.scene.sound.add("Help Salty");
                    this.wfsnd.play();
                };
                this.instructionPage = new screen.InstructionPage(this.scene, (target) => {
                    playBtnClickAnim(target);
                    this.remove(this.instructionPage);
                    this.showGameplay();
                    if (this.wfsnd) {
                        this.wfsnd.stop();
                    }
                }, (target) => {
                    playBtnClickAnim(target);
                    playInstructionSound();
                });
                this.add(this.instructionPage);
                playInstructionSound();
            }
            showAreYouSurePage() {
                pauseAllDelayedCalls();
                setPageBackground("bg-blue");
                this.scene.tweens.pauseAll();
                this.pauseSounds();
                this.areYouSureWindow = new screen.AreYouSureWindow(this.scene, () => {
                    this.scene.tweens.resumeAll();
                    this.remove(this.areYouSureWindow);
                    this.destroyGameplay();
                    this.showInstructionPage();
                }, () => {
                    this.scene.tweens.resumeAll();
                    this.remove(this.areYouSureWindow);
                    this.unpauseSounds();
                    resumeAllDelayedCalls();
                    setPageBackground("bg-australia");
                });
                this.add(this.areYouSureWindow);
            }
            setInputEnabled(enabled) {
                if (enabled) {
                    for (let a of this.words)
                        a.setInteractive({ cursor: 'pointer' });
                }
                else {
                    for (let a of this.words)
                        a.disableInteractive();
                }
            }
            pauseSounds() {
                this.scene.sound.pauseAll();
            }
            unpauseSounds() {
                this.scene.sound.resumeAll();
            }
            destroyGameplay() {
                this.setInputEnabled(false);
                this.remove(this.gameplayContainer);
                this.scene.sound.stopAll();
                destroyAllDelayedCalls();
            }
        }
        screen.GameplayScreen = GameplayScreen;
    })(screen = ctb.screen || (ctb.screen = {}));
})(ctb || (ctb = {}));
var ctb;
(function (ctb) {
    var screen;
    (function (screen) {
        class InstructionPage extends Phaser.GameObjects.Container {
            constructor(scene, onPlayClick, onSndClick) {
                super(scene);
                this._instructionPage = new Phaser.GameObjects.Image(this.scene, 0 - 105, 0 - 48, 'Instructions page  ALL ACTIVITY  TITLEs');
                this._instructionPage.setOrigin(0, 0);
                this._instructionPage.setInteractive();
                this._instructionPageTitle = new Phaser.GameObjects.Image(this.scene, 495, 105, 'pop-the-bubbles-title');
                this._instructionPageTitle.setScale(0.65);
                this._btnPlay = new Phaser.GameObjects.Image(this.scene, game.scale.width / 2, 480 - 50, 'btnPLAY1');
                this._btnPlay.setInteractive({ cursor: 'pointer' });
                this._btnPlay.once('pointerup', onPlayClick);
                setupButtonTextureBased(this._btnPlay, 'btnPLAY1', 'btnPLAY2');
                this.instrTxt = this.scene.add.text(game.scale.width / 2, game.scale.height / 2, "Help Salty Turtle pop all the word\nbubbles. Listen to the word and tap on\nthe bubble.", {
                    "fontFamily": "Kids Rock Demo",
                    "fontSize": 30,
                    "color": "#43425D",
                    "align": 'center'
                });
                this.instrTxt.setOrigin(0.5, 0.5);
                this.instrTxt.setWordWrapWidth(650);
                this.instrTxt.setLineSpacing(10);
                this._btnSoundInstruction = new Phaser.GameObjects.Image(this.scene, 800 - 105, 156 - 50, 'Sound');
                this._btnSoundInstruction.setInteractive({ cursor: 'pointer' });
                this._btnSoundInstruction.on('pointerup', onSndClick);
                this._btnSoundInstruction["defScale"] = this._btnSoundInstruction.scale;
                setupButtonTextureBased(this._btnSoundInstruction, 'Sound', 'Sound HOVER EFFECT');
                this.add(this._instructionPage);
                this.add(this._instructionPageTitle);
                this.add(this.instrTxt);
                this.add(this._btnPlay);
                this.add(this._btnSoundInstruction);
            }
        }
        screen.InstructionPage = InstructionPage;
    })(screen = ctb.screen || (ctb.screen = {}));
})(ctb || (ctb = {}));
var ctb;
(function (ctb) {
    var screen;
    (function (screen) {
        class TryAgainWindow extends Phaser.GameObjects.Container {
            constructor(scene, onBack, onReplay) {
                super(scene);
                this.music = null;
                this.setPosition(-106, -48);
                this._bg = new Phaser.GameObjects.Image(this.scene, 0, 0, 'Try again page');
                this._bg.setOrigin(0, 0);
                this._bg.setInteractive();
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
                this._btnBack.setInteractive({ cursor: 'pointer' });
                this._btnBack.on('pointerup', () => {
                    onBack(this._btnBack);
                    // if (this.music) {
                    //     this.music.stop();
                    // }
                });
                setupButtonTextureBased(this._btnBack, 'btnBACK1', 'btnBACK2');
                this._btnReplay.setInteractive({ cursor: 'pointer' });
                this._btnReplay.once('pointerup', () => {
                    onReplay(this._btnReplay);
                    if (this.music) {
                        this.music.stop();
                    }
                });
                setupButtonTextureBased(this._btnReplay, 'btnReplay1', 'btnReplay2');
            }
            show(score, starScore) {
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
        screen.TryAgainWindow = TryAgainWindow;
    })(screen = ctb.screen || (ctb.screen = {}));
})(ctb || (ctb = {}));
