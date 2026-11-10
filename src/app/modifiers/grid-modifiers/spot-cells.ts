import { PuzzleModifier } from '../puzzle-modifier';
import { IPuzzle } from '../../model/interfaces';
import { GridCell } from 'src/app/model/puzzle-model/grid-cell';

export class SpotCells extends PuzzleModifier {
    constructor(private cells: readonly GridCell[]) {  super(); }

    exec(puzzle: IPuzzle) {
        if (puzzle && puzzle.grid) {
            puzzle.grid.cells.forEach(cell => {
                const target = this.cells.find(c => c.id === cell.id);
                if (target) {
                    this.spotlight(cell);
                }
            });
        }
    }
}