import { PuzzleModifier } from '../puzzle-modifier';
import { IPuzzle } from '../../model/interfaces';
import { Grid } from 'src/app/model/puzzle-model/grid';

export class AddGrid extends PuzzleModifier {
    constructor(
        public args: {grid: Grid}
    ) {  super(); }

    exec(puzzle: IPuzzle) {
        if (puzzle) {
            if (typeof this.args.grid !== "undefined") {
                puzzle.grid = this.args.grid;
            }
        }
    }
}