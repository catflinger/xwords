import { PuzzleModifier } from '../puzzle-modifier';
import { IPuzzle } from '../../model/interfaces';

export class UpdateTextColumn extends PuzzleModifier {
    constructor(
        private index: number, 
        private caption: string) {  super(); }

    public exec(puzzle: IPuzzle) {
        let textCol = puzzle.publishOptions.textCols[this.index];

        if (textCol) {
            textCol.caption = this.caption;
        }
    }
}