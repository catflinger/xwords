import { PuzzleModifier } from '../puzzle-modifier';
import { IPuzzle } from '../../model/interfaces';

export class DeleteTextColumn extends PuzzleModifier {
    constructor(private index: number) {  super(); }

    exec(puzzle: IPuzzle) {
        if (this.index > 0) {
            puzzle.publishOptions.textCols.splice(this.index, 1);
        }
    }
}