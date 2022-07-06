import { PuzzleModifier } from '../puzzle-modifier';
import { IPuzzle } from '../../model/interfaces';

export class AddTextColumn extends PuzzleModifier {
    constructor() {  super(); }

    exec(puzzle: IPuzzle) {
        puzzle.publishOptions.textCols.push({
            caption: "",
            style: "answer",
        });
    }
}