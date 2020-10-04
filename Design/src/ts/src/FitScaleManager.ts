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

    public static detectBestScaleMode():integer {
        let iOS = /iPad|iPhone|iPod/.test(navigator.platform || "");
        let isAndroid = window.navigator.userAgent.toLowerCase().indexOf("android") > -1;
        return iOS || isAndroid ? Phaser.Scale.FIT : Phaser.Scale.NONE;
    };

    private static RESIZE_DELAY: number = 500;

    private game: Phaser.Game;

    private canvasStyle: CSSStyleDeclaration;
    private phaserScaleManager: Phaser.Scale.ScaleManager;

    constructor(game: Phaser.Game) {
        this.game = game;

        this.canvasStyle = this.game.canvas.style;
        this.phaserScaleManager = this.game.scale;
    }

    /**
     * Just call this method once in Boot scene's init() method
     */
    public setup(): void {
        this.phaserScaleManager.addListener(Phaser.Scale.Events.RESIZE, this.onResize, this);

        this.overridePhaserTransformMethods();

        this.onResize();
    }

    private calculateScale(): number {
        if (game.scale.scaleMode == Phaser.Scale.NONE) return 1;

        return Math.min(
            window.innerWidth / this.phaserScaleManager.width,
            window.innerHeight / this.phaserScaleManager.height
        );
    }

    private overridePhaserTransformMethods(): void {
        this.game.scale.transformX = (pageX: number) => {
            return (pageX - parseInt(this.canvasStyle.marginLeft.split("px")[0])) / this.calculateScale();
        };
        this.game.scale.transformY = (pageY: number) => {
            return (pageY - parseInt(this.canvasStyle.marginTop.split("px")[0])) / this.calculateScale();
        };
    }

    private onResize(): void {
        setTimeout(this.doResize, FitScaleManager.RESIZE_DELAY);
    }

    private doResize: () => void = () => {
        let scale: number = this.calculateScale();

        let newCanvasWidth: number = this.phaserScaleManager.width * scale;
        let newCanvasHeight: number = this.phaserScaleManager.height * scale;

        this.canvasStyle.width = newCanvasWidth + 'px';
        this.canvasStyle.height = newCanvasHeight + 'px';

        this.canvasStyle.marginLeft = (window.innerWidth - newCanvasWidth) / 2 + 'px';
        this.canvasStyle.marginTop = (window.innerHeight - newCanvasHeight) / 2 + 'px';
    };
}