import { PuzzleModifier } from '../puzzle-modifier';
import { IPuzzle } from '../../model/interfaces';
import { RenumberGid } from './renumber-grid';

export class SetGridCaptions extends PuzzleModifier {
    constructor() {  super(); }

    exec(puzzle: IPuzzle) {
        if (puzzle.grid) {

            if (puzzle.grid.properties.numbered) {
                puzzle.grid.cells.forEach(cell => cell.caption = cell.anchor ? cell.anchor.toString() : null );
            }
        }
    }
}