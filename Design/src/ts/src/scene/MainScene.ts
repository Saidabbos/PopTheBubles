namespace ctb.scene {

    import Gameplay = ctb.core.Gameplay;
    import GameplayScreen = ctb.screen.GameplayScreen;

    export class MainScene extends Phaser.Scene {

        private gameplay:Gameplay;
        private gameplayScreen:GameplayScreen;

        public create():void {
            this.gameplay = new Gameplay();

            this.gameplayScreen = new ctb.screen.GameplayScreen(this, this.gameplay);
            this.children.add(this.gameplayScreen);
            this.gameplayScreen.showInstructionPage();
        }
    }
}