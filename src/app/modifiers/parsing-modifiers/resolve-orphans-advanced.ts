import { IGrid, IClue, IPuzzle, ClueGroup } from "src/app/model/interfaces";
import { Clue } from "src/app/model/puzzle-model/clue";
import { Grid } from "src/app/model/puzzle-model/grid";
import { GridReference } from "src/app/model/puzzle-model/grid-reference";
import { IParseContext } from "src/app/services/parsing/text/text-parsing-context";

type GridFit = "across" | "down" | "both" | "unknown" | null;

class Orphan {
    public readonly clue;
    public gridFit: GridFit = null;

    constructor(clue: Clue) {
        this.clue = clue;
    }
}

export function resolveClues(context: IParseContext, grid: Grid): IClue[] {
    let result: IClue[] = [...context.clues];

    // console.log(`Across Clues: ${context.clues.filter(c => c.group === "across").length}`);
    // console.log(`Down Clues: ${context.clues.filter(c => c.group === "down").length}`);
    // console.log(`Orphan Clues: ${context.clues.filter(c => c.group === "orphan").length}`);
    // console.log(`Unresolved orphans: ${context.orphans.length}`);

    if (context.orphans.length && grid) {

        // wrap the clues array as Orphans
        const orphans: Orphan[] = [];
        context.orphans.forEach(clue => orphans.push(new Orphan(clue)));

        // find out where each orphan might fit in the grid
        orphans.forEach(orphan => {
            orphan.gridFit = getGridFit(orphan, grid);
        });

        // orphans.forEach(orphan => console.log(`LINE: ${orphan.clue.lineNumber} FIT: ${orphan.gridFit}`));

        // sort the clues so they are in the order they were parsed from the source material
        const sorted = [...orphans].sort((a, b) => a.clue.lineNumber - b.clue.lineNumber);

        // add the orphans  where there is no ambiguity
        result = result
        .concat(orphans.filter(o => o.gridFit === "across" || o.gridFit === "down")
        .map(o => {
            let clue = o.clue;
            clue.group = o.gridFit;
            return clue;
        }));

        // identify the clues with ambiguous positions in the grid
        const boths = orphans.filter(c => c.gridFit === "both");

        // for each ambigous clue see if its neighbours help make things clearer
        boths.forEach(orphan => {
            const clueId: string = orphan.clue.id;

            // console.log(`CLUE ID is ${clueId}`)

            // find the position of the ambiguous clue in the original source text
            let x: number = sorted.findIndex(s => s.clue.id === clueId);
            const prev = sorted[x - 1];
            const next = sorted[x + 1];

            // look at its neighbours
            if (prev && next && prev.gridFit === next.gridFit && isDefinitiveFit(prev.gridFit)) {
                // two neighbours that agree on a definitve grid fit
                pushClue(result, orphan, prev.gridFit);

            } else if (next && !prev  && isDefinitiveFit(next.gridFit)) {
                // this is the first clue in the text, the second is definite
                pushClue(result, orphan, next.gridFit);

            } else if (prev && !next && isDefinitiveFit(prev.gridFit)) {
                // this is the last clue in the text, the second last is definite
                pushClue(result, orphan, prev.gridFit);
            } else {
                // some of the neighbouring clues are also ambiguous
                // what to do here?  Is this ever likely to arise in practice? 
            }
        });
    }

    return result;
}

function pushClue(result: IClue[], orphan: Orphan, fit: GridFit): void {
    orphan.gridFit = fit;
    orphan.clue.group = fit;
    result.push(orphan.clue);
}

function isDefinitiveFit(a: GridFit): boolean {
    return (a === "across" || a === "down");
}

function getGridFit(orphan: Orphan, grid: Grid): GridFit {
    let result: GridFit = "unknown";

    if (grid) {

        let firstDigits: number = 0;

        let match = /^\d{1,2}/.exec(orphan.clue.caption);
        if (match) {
            firstDigits = parseInt(match.toString());
        }

        let acrossRef = grid.getGridEntryFromReference(new GridReference({
            id: 0,
            // TO DO: think about 1, 2 etc
            anchor: firstDigits,
            direction: "across"
        }));

        let downRef = grid.getGridEntryFromReference(new GridReference({
            id: 0,
            // TO DO: think about 1, 2 etc
            anchor: firstDigits,
            direction: "down"
        }));

        // console.log(`LETTER COUNT: ${orphan.clue.totalLetterCount}`);

        if (acrossRef.length === orphan.clue.totalLetterCount && downRef.length === orphan.clue.totalLetterCount) {
            result = "both";
        } else if (acrossRef.length === orphan.clue.totalLetterCount) {
            result = "across";
        } else if (downRef.length === orphan.clue.totalLetterCount) {
            result = "down";
        } else {
            result = "unknown";
        }

    } else {
        result = "unknown";
    }

    return result;
}
