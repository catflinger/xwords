import { IPuzzle } from '../../model/interfaces';
import { PuzzleModifier } from '../puzzle-modifier';

export class DeleteClues implements PuzzleModifier {
    constructor() { }

    exec(puzzle: IPuzzle) {
        if (puzzle) {
            puzzle.clues = null;
        }
    }
}