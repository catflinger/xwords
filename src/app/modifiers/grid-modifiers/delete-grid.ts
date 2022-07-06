import { PuzzleModifier } from '../puzzle-modifier';
import { IPuzzle } from '../../model/interfaces';

export class DeleteGrid implements PuzzleModifier {
    constructor() { }

    exec(puzzle: IPuzzle) {
        if (puzzle) {
            puzzle.grid = null;
            if (puzzle.clues) {
                puzzle.clues.forEach( clue => {
                    clue.link.gridRefs = [];
                    clue.link.warning = null;
                });
            }
        }
    }
}