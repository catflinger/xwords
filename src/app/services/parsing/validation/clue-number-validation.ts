import { Injectable } from '@angular/core';
import { Puzzle } from 'src/app/model/puzzle-model/puzzle';
import { Clue } from 'src/app/model/puzzle-model/clue';
import { Grid } from 'src/app/model/puzzle-model/grid';

export interface ClueEditSugestion {
    readonly clueId: string,
    readonly originalCaption: string;
    readonly suggestedCaption: string;
    readonly originalText: string;
    readonly suggestedText: string;
}

@Injectable({
    providedIn: 'root'
})
export class ClueNumberValidationService {

    constructor() { }

    public findSuspiciousClues(puzzle: Puzzle): ClueEditSugestion[] {
        let result: ClueEditSugestion[] = [];

        puzzle.clues.forEach(clue => {
            if (this.isSuspicious(clue, puzzle.grid)) {
                result.push(this.makeSuggestion(clue, puzzle));
            }
        })

        return result;
    }

    /** Sometimes the spaces between digits in PDF documents can be confusing and mistakes occur in the text extraction.
     * This is espeially prevalent in the first characters of a clue .  This function looks for such errors in the clue numbers.  
     * Examples are:
     *  12 This is a clue(5) is misread as 1 2 This is a clue(5)
     *  23/12 This is a clue(5) is misread as 2 3/12 This is a clue(5)
     * */
    private isSuspicious(clue: Clue, grid: Grid): boolean {
        let result = false;
        const caption = clue.caption.trim();
        const text = clue.text.trim();
        const fullText = caption + " " + text;

        const looksSuspicious = /^\d\s+\d/;

        // console.log(`FULL TEXT: [${fullText}]`)

        if (clue.group != "orphan" && looksSuspicious.test(fullText)) {
            let clueNumber = parseInt(caption);

            // console.log(`FULL TEXT: ${fullText.substring(0, 20)}`)

            let gridEntry = grid.getGridEntryFromReference({
                id: null,
                anchor: clueNumber,
                direction: clue.group
            });

            if (gridEntry){
                if (gridEntry.length !== clue.totalLetterCount) {
                    result = true;
                }
            } else {
                result = true;
            }
        }

        return result;
    }

    private makeSuggestion(clue: Clue, puzzle: Puzzle): ClueEditSugestion {
        const caption = clue.caption.trim();
        const text = clue.text.trim();
        const fullText = caption + " " + text;

        let suggestedCaption = clue.caption.trim() + clue.text[0];
        let suggestedText = text.substring(1).trim();

        // TO DO: this does work when commas are used as separators, or with clues with across or down indicators, for example
        // 23/4 DOWN/12 This is a clue(6,4,11)
        // 23,4,12 This is a clue(6,4,11)

        const isMultiEntry = new RegExp("^(/\\d+)+");

        if (isMultiEntry.test(suggestedText)) {
            suggestedCaption = suggestedCaption + suggestedText.match(isMultiEntry)[0];
            suggestedText = suggestedText.replace(isMultiEntry, "")
        }

        return {
            clueId: clue.id,
            originalCaption: clue.caption,
            originalText: clue.text,
            suggestedCaption: suggestedCaption.trim(),
            suggestedText: suggestedText.trim()
        }
    }

}
