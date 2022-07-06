import { IPuzzle } from '../../model/interfaces';
import { PuzzleModifier } from '../puzzle-modifier';

export class DeleteClue implements PuzzleModifier {
    constructor(
        private id: string,
    ) { }

    exec(puzzle: IPuzzle) {
        if (puzzle) {
            puzzle.clues = puzzle.clues.filter((c) => c.id !== this.id);
        }
    }
}