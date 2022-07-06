import { PuzzleModifier } from '../puzzle-modifier';
import { IPuzzle } from '../../model/interfaces';

export class ClearGridReferences implements PuzzleModifier {
    constructor() { }

    public exec(puzzle: IPuzzle) {

        puzzle.clues.forEach(clue => {
            clue.link.gridRefs = [];
        });
    }

}