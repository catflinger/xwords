import { IGrid, IClue, ClueGroup } from "src/app/model/interfaces";
import { Clue } from "src/app/model/puzzle-model/clue";
import { Grid } from "src/app/model/puzzle-model/grid";
import { GridReference } from "src/app/model/puzzle-model/grid-reference";
import { IParseContext } from "src/app/services/parsing/text/text-parsing-context";

export function resolveOrphans(context: IParseContext, gridData: IGrid): IClue[] {
    let result: IClue[];

    if (context.orphans.length) {
        const bestFit: ClueGroup = getBestFit(context.orphans, context.clues, gridData);

        // make a mutable copy of the orphaned clues
        let orphans = JSON.parse(JSON.stringify(context. orphans));
        orphans.forEach((orphan: IClue) => orphan.group = bestFit);

        result = JSON.parse(JSON.stringify(context.clues)).concat(orphans);

    } else {
        result = JSON.parse(JSON.stringify(context.clues));
    }

    return result;
}

function getBestFit(orphans: readonly Clue[], clues: readonly Clue[], gridData: IGrid): ClueGroup {
    let result: ClueGroup;

    if (gridData) {
        const grid: Grid = new Grid(gridData);

        let acrossCount = 0;
        let downCount = 0;

        orphans.forEach(orphan => {
            let firstDigits: number = 0;

            let match = /^\d{1,2}/.exec(orphan.caption);
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

            if (acrossRef.length) {
                acrossCount++;
            }

            if (downRef.length) {
                downCount++;
            }
        });

        result = acrossCount > downCount ? "across" : "down";

    } else {
        const acrossCount = clues.filter(clue => clue.group === "across").length;
        const downCount = clues.filter(clue => clue.group === "down").length;

        result = acrossCount < downCount ? "across" : "down";
    }

    return result;
}
