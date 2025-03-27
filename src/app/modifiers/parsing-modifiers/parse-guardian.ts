import { IClue, IGrid, IGridCell, IPuzzle } from "src/app/model/interfaces";
import { PuzzleModifier } from "../puzzle-modifier";
import { Grid } from "src/app/model/puzzle-model/grid";
import { Clue } from "src/app/model/puzzle-model/clue";
import { GridReference } from "src/app/model/puzzle-model/grid-reference";
export class ParseGuardian extends PuzzleModifier {

    constructor(
        //private traceService: TraceService,
    ) {
        super();
    }

    public exec(puzzle: IPuzzle): void {

        try {
            const source = JSON.parse(puzzle.provision.source);

            const crossword = source.data;

            puzzle.info.instructions = crossword.instructions;

            this.parseSetter(puzzle, crossword);
            this.parseDate(puzzle, crossword);
            this.parseClues(puzzle, crossword);
            this.parseGrid(puzzle, crossword);

        } catch (error) {
            throw new Error("Failed to parse Guardian data: " + error);
        }
    }

    private parseSetter(puzzle: IPuzzle, crossword: any) {
        puzzle.info.setter = puzzle.info.provider === "everyman" ? "Everyman" : crossword.creator.name;
        puzzle.info.title = crossword.name;
        if (puzzle.info.provider !== "everyman") {
            puzzle.info.title += " by " + puzzle.info.setter;
        }
    }

    private parseDate(puzzle: IPuzzle, crossword: any) {
        // TO DO: get date from crossword
    }

    private parseClues(puzzle: IPuzzle, crossword: any) {
        let clueCounter = 0;

        puzzle.clues = [];

        crossword.entries.forEach((entry: any) => {

            let clueText = (entry.clue as string).replace(/<[a-z/]+>/gi, "");
            let letterCount = Clue.getLetterCount(clueText);

            let clue: IClue = {
                id: "clue" + clueCounter++,
                caption: entry.humanNumber,
                group: entry.direction,
                text: clueText,
                solution: entry.solution ? entry.solution : "",
                letterCount: Clue.getLetterCount(clueText),
                annotation: null,
                redirect: null,  // TO DO: get redirect from crossword
                format: this.getSolutionFormat(letterCount),
                highlight: false,
                answers: [""],
                link: {
                    warning: "",
                    gridRefs: []
                },
                comment: {
                    ops: [
                        { insert: "" }
                    ]
                },
                chunks: [{
                    text: clueText,
                    isDefinition: false
                }],
                warnings: [],
            };

            entry.group.forEach((groupId: string) => {

                //The group array in the json contains a list of entry ids, each id references an 
                //entry (possibly the current one) that contains a grid word in the solution.

                let entry = crossword.entries.find(entry => entry.id === groupId);

                if (entry) {
                    clue.link.gridRefs.push(new GridReference({
                        anchor: entry.number,
                        direction: entry.direction
                    }));
                }
            });

            puzzle.clues.push(clue);
        });
    }

    private parseGrid(puzzle: IPuzzle, crossword: any) {

        // create an empty mutable grid
        let grid: IGrid = Grid.createEmptyGrid({
            style: "standard",
            size: {
                across: crossword.dimensions.cols,
                down: crossword.dimensions.rows
            },
            symmetrical: true,
            numbered: true,
            showCaptions: true,
        }).getMutableCopy();

        // default all cells to be black
        grid.cells.forEach((cell) => {
            cell.light = false;
        });

        // add the white cells from the json source
        crossword.entries.forEach((entry: any) => {

            for (let i = 0; i < entry.length; i++) {
                let cell: IGridCell;

                let x = parseInt(entry.position.x);
                let y = parseInt(entry.position.y);

                if (entry.direction === "across") {
                    cell = grid.cells.find(c => c.id === `cell-${x + i}-${y}`);
                } else {
                    cell = grid.cells.find(c => c.id === `cell-${x}-${y + i}`);
                }

                cell.light = true;

                //give only the first cell a caption
                if (i === 0) {
                    cell.anchor = entry.number;
                    cell.caption = String(entry.number);
                }

                //add the solution letter
                //  if (entry.solution != null && entry.solution.Length > i) {
                //     cell.solution = entry.solution[i];
                // }

               }
        });

        grid.properties.showCaptions = true;

        puzzle.grid = grid;
    }

    private getSolutionFormat(letterCount: string): string {
        let digits = "";
        let format = "";

        if (letterCount) {
            //for each number write a sequence of commas as placeholder
            //for each comma write a space
            //ingnore spaces
            //write everything else unchanged
            //for example the format string for (3, 2-5) becomes ",,, ,,-,,,,,"

            Array.from(letterCount).forEach((ch) => {

                //concatenate adjacent digits into a string
                if (/[0-9]/.test(ch)) {
                    digits += ch;
                }
                else
                {
                    //no more digits so write out the placeholder for the previous word (if there is one)
                    if (digits.length > 0)
                    {
                        let wordLength = parseInt(digits);
                        for (let i = 0; i < wordLength; i++) {
                            format += ",";
                        }
                        digits = "";
                    }

                    //now write the punctuation characters
                    if (ch == ',')
                    {
                        format += ' ';
                    }
                    // skip whitespace
                    else if (/[^\S]/.test(ch))
                    {
                        format += ch;
                    }
                }

            });

            //write out the placeholder for the remaining word (if there is one)
            if (digits.length > 0) {
                let wordLength = parseInt(digits);
                for (let i = 0; i < wordLength; i++) {
                    format += ",";
                }
            }

            return format;
        }
    }
}
