import { IPuzzle } from '../../model/interfaces';
import { PuzzleModifier } from '../puzzle-modifier';

export class HousekeepClues extends PuzzleModifier {
    constructor() {  super(); }

    exec(puzzle: IPuzzle) {
        if (puzzle && puzzle.clues) {
            puzzle.clues = puzzle.clues.filter(clue => {
                return clue.text && 
                    clue.text.trim().length > 0;
            });
        }
    }
}
