import { PuzzleModifier } from '../puzzle-modifier';
import { IPuzzle } from '../../model/interfaces';

export class AddTextColumn implements PuzzleModifier {
    constructor() { }

    exec(puzzle: IPuzzle) {
        puzzle.publishOptions.textCols.push({
            caption: "",
            style: "answer",
        });
    }
}