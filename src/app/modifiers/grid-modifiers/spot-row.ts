import { PuzzleModifier } from '../puzzle-modifier';
import { IPuzzle } from 'src/app/model/interfaces';
import { GridCell } from 'src/app/model/puzzle-model/grid-cell';

export class SpotRow extends PuzzleModifier {

    constructor(private cell: GridCell) {  super(); }

    exec(puzzle: IPuzzle) {
        if (puzzle.grid) {
            puzzle.grid.cells.forEach((cell) => {
                if (this.cell.y === cell.y) {
                    this.spotlight(cell);
                }
            });
        }

    }
}