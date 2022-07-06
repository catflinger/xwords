import { PuzzleModifier } from '../puzzle-modifier';
import { Clear } from '../puzzle-modifiers/clear';
import { IPuzzle } from '../../model/interfaces';

export class SelectNextClue extends PuzzleModifier {
    constructor(public readonly clueId: string) {  super(); }

    exec(puzzle: IPuzzle) {
        new Clear().exec(puzzle);

        let index = puzzle.clues.findIndex((clue) => clue.id === this.clueId);
        if (index >= 0 && index + 1 < puzzle.clues.length) {
            puzzle.clues[index + 1].highlight = true;
        }
    }
}