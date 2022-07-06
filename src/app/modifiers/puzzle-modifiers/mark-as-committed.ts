import { PuzzleModifier } from '../puzzle-modifier';
import { IPuzzle } from '../../model/interfaces';

export class MarkAsCommitted implements PuzzleModifier {
    constructor() { }

    exec(puzzle: IPuzzle) {
        if (puzzle) {
            puzzle.uncommitted = false;
        }

    }
}