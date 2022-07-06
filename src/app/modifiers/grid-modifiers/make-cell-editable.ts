import { PuzzleModifier } from '../puzzle-modifier';
import { IPuzzle } from '../../model/interfaces';

export class MakeCellEditable extends PuzzleModifier {
    constructor(private cellId: string) {  super(); }

    exec(puzzle: IPuzzle) {
        if (puzzle && puzzle.grid) {
            puzzle.grid.cells.forEach(cell => {
                let isMatch = cell.id === this.cellId;
                cell.edit = isMatch;
            });
        }
    }
}