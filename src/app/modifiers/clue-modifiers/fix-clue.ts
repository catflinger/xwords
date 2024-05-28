import { PuzzleModifier } from '../puzzle-modifier';
import { IPuzzle } from '../../model/interfaces';
import { ClueEditSugestion } from 'src/app/services/parsing/validation/clue-number-validation';
import { UpdateClue } from './update-clue';

export class FixClue extends PuzzleModifier {

    constructor(private suggestions: readonly ClueEditSugestion[]) {  super(); }

    public exec(puzzle: IPuzzle) {

        this.suggestions.forEach(suggestion => {
            const update = new UpdateClue({
                id: suggestion.clueId,
                caption: suggestion.suggestedCaption,
                text: suggestion.suggestedText,
            });

            update.exec(puzzle);
        });
    }
}