namespace ctb.core {
    export class Gameplay {
        public totalRoundsNum:number;
        public readonly failsNumToLose:number;

        private currentRound:number = 0;
        public allWorlds:object[];
        public words:object[];
        public currentWordData:object;
        public correctAnswersCount: number = 0;
        public wrongAnswersCount: number = 0;
        public correctAnswersCountThisRound: number = 0;
        public wrongAnswersCountThisRound: number = 0;

        private onComplete:(score:number, starScore:number)=>void;
        private onLose:(score:number, starScore:number)=>void;
        private onNewRound:()=>void = null;

        public useImages:boolean;

        constructor() {
            this.failsNumToLose = Number(game.cache.json.get('gameplay')["failsNumToLose"]);
            this.useImages = Boolean(game.cache.json.get('gameplay')["useImages"]);
        }

        public setupCallbacks(onComplete:(score:number, starScore:number)=>void, onLose:(score:number, starScore:number)=>void, onNewRound:()=>void):void {
            this.onComplete = onComplete;
            this.onLose = onLose;
            this.onNewRound = onNewRound;
        }

        public calculateScore():number {
            return this.totalRoundsNum - this.wrongAnswersCount;
        }

        public onLetterChosen():boolean {
            if (this.correctAnswersCountThisRound == 1) {
                this.currentRound++;
                if (this.currentRound >= this.totalRoundsNum) {
                    let score:number = this.calculateScore();
                    this.onComplete(score, score);
                    return true;
                } else {
                    this.nextLetter();
                }
            }
            return false;
        }

        public nextLetterDelay:number = 0;
        public nextLetter():void {
            let fn:()=>void = ()=>{
                this.currentWordData = Phaser.Utils.Array.RemoveRandomElement(this.words);

                this.correctAnswersCountThisRound = 0;
                this.wrongAnswersCountThisRound = 0;

                if (this.onNewRound) this.onNewRound();
            };
            if (this.nextLetterDelay == 0) {
                fn();
            } else {
                delayedCall(this.nextLetterDelay, fn);
            }
        }

        public onCorrectAnswer(): boolean {
            this.correctAnswersCount++;
            this.correctAnswersCountThisRound++;

            this.nextLetterDelay = 3500;

            return this.onLetterChosen();
        }

        public onWrongAnswer(): boolean {
            this.wrongAnswersCount++;
            this.wrongAnswersCountThisRound++;

            this.nextLetterDelay = 0;

            if (this.wrongAnswersCount >= this.failsNumToLose) {
                this.onLose(0, 0);
                return true;
            } else {
                this.onLetterChosen();
            }
            return false;
        }

        public getCurrentTotalAnswersCount(): number {
            return this.correctAnswersCount + this.wrongAnswersCount;
        }

        public getCurrentTotalAnswersCountThisRound(): number {
            return this.correctAnswersCountThisRound + this.wrongAnswersCountThisRound;
        }

        public isNewRound():boolean {
            return this.getCurrentTotalAnswersCountThisRound() == 0;
        }

        public isRoundsComplete():boolean {
            return this.currentRound >= this.totalRoundsNum;
        }

        public reset():void {
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
}