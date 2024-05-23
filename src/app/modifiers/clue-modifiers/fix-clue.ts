import { PuzzleModifier } from '../puzzle-modifier';
import { IPuzzle } from '../../model/interfaces';
import { ClueEditSugestion } from 'src/app/services/parsing/validation/clue-number-validation';

export class FixClue extends PuzzleModifier {

    constructor(private suggestions: readonly ClueEditSugestion[]) {  super(); }

    public exec(puzzle: IPuzzle) {

        this.suggestions.forEach(suggestion => {
            let clue = puzzle.clues.find((c) => c.id === suggestion.clueId);

            if (clue) {
                clue.caption = suggestion.suggestedCaption;
                clue.text = suggestion.suggestedText;
            }
        });
    }
}