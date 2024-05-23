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


    private isSuspicious(clue: Clue, grid: Grid): boolean {
        let result = false;
        let caption = clue.caption.trim();
        let text = clue.text.trim();
        let fullText = caption + " " + text;

        //console.log(`FULL TEXT: ${fullText}`)

        if (/^\d\s+\d\s+/.test(fullText)) {
            let clueNumber = parseInt(caption);

            //console.log(`FULL TEXT: ${fullText.substring(0, 20)}`)

            let gridEntry = grid.getGridEntryFromReference({
                id: null,
                anchor: clueNumber,
                direction: clue.group
            });

            if (gridEntry){
                //console.log(`LETTER COUNT  ${clue.letterCount}`)
                //console.log(`TOTAL LETTER COUNT ${clue.totalLetterCount}`)
                //console.log(`GRID CELLS ${gridEntry.length}`)

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
        return {
            clueId: clue.id,
            originalCaption: clue.caption,
            originalText: clue.text,
            suggestedCaption: clue.caption.trim() + clue.text.trim()[0],
            suggestedText: clue.text.trim().substring(1),
        }
    }

}
