import { PuzzleModifier } from '../puzzle-modifier';
import { IPuzzle } from '../../model/interfaces';

export class AddTextColumn extends PuzzleModifier {
    constructor(private caption?: string) {  super(); }

    exec(puzzle: IPuzzle) {
        puzzle.publishOptions.textCols.push({
            caption: this.caption ? this.caption : "",
            style: "answer",
        });
    }
}