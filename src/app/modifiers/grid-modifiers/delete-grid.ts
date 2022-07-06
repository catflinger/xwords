import { PuzzleModifier } from '../puzzle-modifier';
import { IPuzzle } from '../../model/interfaces';

export class DeleteGrid extends PuzzleModifier {
    constructor() {  super(); }

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