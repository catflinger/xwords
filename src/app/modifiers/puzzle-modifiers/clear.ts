import { PuzzleModifier } from '../puzzle-modifier';
import { IPuzzle } from '../../model/interfaces';

export class Clear extends PuzzleModifier {
    constructor() {  super(); }

    exec(puzzle: IPuzzle) {
        if (puzzle.clues) {
            puzzle.clues.forEach((clue) => {
                clue.highlight = false;
            });
        }

        if (puzzle.grid) {
            puzzle.grid.cells.forEach((cell) => {
                cell.highlight = false;
                cell.edit = false;
            });
        }

    }
}