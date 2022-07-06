import { PuzzleModifier } from '../puzzle-modifier';
import { IPuzzle } from '../../model/interfaces';

export class FactoryResetClues extends PuzzleModifier {
    constructor(
    ) {  super(); }

    exec(puzzle: IPuzzle) {
        if (puzzle) {
            puzzle.clues = [];
        }
    }
}