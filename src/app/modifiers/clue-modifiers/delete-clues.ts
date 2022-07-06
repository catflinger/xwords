import { IPuzzle } from '../../model/interfaces';
import { PuzzleModifier } from '../puzzle-modifier';

export class DeleteClues extends PuzzleModifier {
    constructor() {  super(); }

    exec(puzzle: IPuzzle) {
        if (puzzle) {
            puzzle.clues = null;
        }
    }
}