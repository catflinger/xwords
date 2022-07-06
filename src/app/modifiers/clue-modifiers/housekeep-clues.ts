import { IPuzzle } from '../../model/interfaces';
import { PuzzleModifier } from '../puzzle-modifier';

export class HousekeepClues implements PuzzleModifier {
    constructor() { }

    exec(puzzle: IPuzzle) {
        if (puzzle && puzzle.clues) {
            puzzle.clues = puzzle.clues.filter(clue => {
                return clue.text && 
                    clue.text.trim().length > 0;
            });
        }
    }
}
