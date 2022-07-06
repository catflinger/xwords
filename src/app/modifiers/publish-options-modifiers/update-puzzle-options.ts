import { GridLinkMethod, IPuzzle } from '../../model/interfaces';
import { PuzzleModifier } from '../puzzle-modifier';

export class UpdatePuzzleOptions implements PuzzleModifier {
    constructor(
        private linkMethod: GridLinkMethod
    ) { }

    public exec(puzzle: IPuzzle) {
        puzzle.options.linkMethod = this.linkMethod;
    }
}