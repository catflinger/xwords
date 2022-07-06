import { PuzzleModifier } from '../puzzle-modifier';
import { IPuzzle } from '../../model/interfaces';

export class InitAnnotationWarnings implements PuzzleModifier {
    constructor() { }

    exec(puzzle: IPuzzle) {
        if (puzzle) {
            if (puzzle.clues) {
                puzzle.clues.forEach(clue => clue.warnings = [ "missing answer", "missing comment", "missing definition"]);
            }
        }
    }
}