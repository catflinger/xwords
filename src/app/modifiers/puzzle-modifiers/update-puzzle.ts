import { PuzzleModifier } from '../puzzle-modifier';
import { IPuzzle } from '../../model/interfaces';

export class UpdatePuzzle extends PuzzleModifier {
    constructor(
        private args: { 
            wordsearch?:  string, 
        },
    ) {  super(); }

    exec(puzzle: IPuzzle) {
        if (typeof this.args.wordsearch === "string") {
            puzzle.wordsearch = this.args.wordsearch;
        }
    }
}