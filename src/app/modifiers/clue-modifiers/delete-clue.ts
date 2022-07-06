import { IPuzzle } from '../../model/interfaces';
import { PuzzleModifier } from '../puzzle-modifier';

export class DeleteClue extends PuzzleModifier {
    constructor(
        private id: string,
    ) {  super(); }

    exec(puzzle: IPuzzle) {
        if (puzzle) {
            puzzle.clues = puzzle.clues.filter((c) => c.id !== this.id);
        }
    }
}