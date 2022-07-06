import { PuzzleModifier } from '../puzzle-modifier';
import { IPuzzle } from '../../model/interfaces';

export class FactoryResetClues implements PuzzleModifier {
    constructor(
    ) { }

    exec(puzzle: IPuzzle) {
        if (puzzle) {
            puzzle.clues = [];
        }
    }
}