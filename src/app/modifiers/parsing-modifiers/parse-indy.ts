import { IClue, IGrid, IGridCell, IPuzzle } from "src/app/model/interfaces";
import { PuzzleModifier } from "../puzzle-modifier";
import { Grid } from "src/app/model/puzzle-model/grid";
import { Clue } from "src/app/model/puzzle-model/clue";
import { GridReference } from "src/app/model/puzzle-model/grid-reference";

export class ParseIndy extends PuzzleModifier {

    constructor(
        //private traceService: TraceService,
    ) {
        super();
    }

    public exec(puzzle: IPuzzle): void {

        try {
            const source = JSON.parse(puzzle.provision.source);


        } catch (error) {
            throw new Error("Failed to parse Independent data: " + error);
        }
    }
}
