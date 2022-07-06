import { GridLinkMethod, IPuzzle } from '../../model/interfaces';
import { PuzzleModifier } from '../puzzle-modifier';

export class UpdatePuzzleOptions extends PuzzleModifier {
    constructor(
        private linkMethod: GridLinkMethod
    ) {  super(); }

    public exec(puzzle: IPuzzle) {
        puzzle.options.linkMethod = this.linkMethod;
    }
}