import { PuzzleModifier } from '../puzzle-modifier';
import { IPuzzle } from '../../model/interfaces';

export class MakeCellEditable implements PuzzleModifier {
    constructor(private cellId: string) { }

    exec(puzzle: IPuzzle) {
        if (puzzle && puzzle.grid) {
            puzzle.grid.cells.forEach(cell => {
                let isMatch = cell.id === this.cellId;
                cell.edit = isMatch;
            });
        }
    }
}