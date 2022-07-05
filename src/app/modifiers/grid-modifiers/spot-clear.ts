import { IPuzzleModifier } from '../puzzle-modifier';
import { IPuzzle } from 'src/app/model/interfaces';

export class SpotClear implements IPuzzleModifier {

    constructor() { }

    exec(puzzle: IPuzzle) {
        if (puzzle.grid) {
            puzzle.grid.cells.forEach((cell) => {
                cell.shading = "lightgrey";
            });
        }

    }
}