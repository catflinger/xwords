import { PuzzleModifier } from '../puzzle-modifier';
import { IPuzzle } from 'src/app/model/interfaces';
import { GridCell } from 'src/app/model/puzzle-model/grid-cell';

export class SpotRow implements PuzzleModifier {

    constructor(private cell: GridCell) { }

    exec(puzzle: IPuzzle) {
        if (puzzle.grid) {
            puzzle.grid.cells.forEach((cell) => {
                if (this.cell.y === cell.y) {
                    cell.shading =  "lightyellow";
                }
            });
        }

    }
}