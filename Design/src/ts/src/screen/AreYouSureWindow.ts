namespace ctb.screen {
    export class AreYouSureWindow extends Phaser.GameObjects.Container {

        private _areYouSurePage: Phaser.GameObjects.Image;
        private _btnSureYes: Phaser.GameObjects.Image;
        private _btnSureNo: Phaser.GameObjects.Image;

        constructor(scene: Phaser.Scene, onYes:()=>void, onNo:()=>void) {
            super(scene);

            this._areYouSurePage = new Phaser.GameObjects.Image(this.scene, -105, 0-48, 'Exit warning');
            this._areYouSurePage.setOrigin(0, 0);
            // this._areYouSurePage.setInteractive();

            this._btnSureYes = new Phaser.GameObjects.Image(this.scene, game.scale.width / 2 - 95, 485-50, 'btnYES1');
            this._btnSureYes.setInteractive({cursor: 'pointer'});
            this._btnSureYes.once('pointerup', onYes);
            setupButtonTextureBased(this._btnSureYes, 'btnYES1', 'btnYES2');

            this._btnSureNo = new Phaser.GameObjects.Image(this.scene, game.scale.width / 2 + 95, 485-50, 'btnNO1');
            this._btnSureNo.setInteractive({cursor: 'pointer'});
            this._btnSureNo.once('pointerup', onNo);
            setupButtonTextureBased(this._btnSureNo, 'btnNO1', 'btnNO2');

            this.add(this._areYouSurePage);
            this.add(this._btnSureYes);
            this.add(this._btnSureNo);
        }
    }
}