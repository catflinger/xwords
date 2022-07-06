import { PuzzleModifier } from '../puzzle-modifier';
import { IPuzzle } from 'src/app/model/interfaces';

export class ClearHiddenCells extends PuzzleModifier {
    constructor() {  super(); }

    exec(puzzle: IPuzzle) {
        if (puzzle.grid) {
            puzzle.grid.cells.forEach((cell) => {
                cell.hidden = false;
                cell.light = true;
            });
        }

    }
}