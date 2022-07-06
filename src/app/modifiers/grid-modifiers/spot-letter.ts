import { PuzzleModifier } from '../puzzle-modifier';
import { IPuzzle } from 'src/app/model/interfaces';

export class SpotLetter extends PuzzleModifier {

    constructor(private letter: string) {  super(); }

    exec(puzzle: IPuzzle) {
        if (puzzle.grid) {
            puzzle.grid.cells.forEach((cell) => {
                if (this.letter === cell.content) {
                    this.spotlight(cell);
                }
            });
        }

    }
}