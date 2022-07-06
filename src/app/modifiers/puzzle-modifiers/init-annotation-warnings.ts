import { PuzzleModifier } from '../puzzle-modifier';
import { IPuzzle } from '../../model/interfaces';

export class InitAnnotationWarnings extends PuzzleModifier {
    constructor() {  super(); }

    exec(puzzle: IPuzzle) {
        if (puzzle) {
            if (puzzle.clues) {
                puzzle.clues.forEach(clue => clue.warnings = [ "missing answer", "missing comment", "missing definition"]);
            }
        }
    }
}