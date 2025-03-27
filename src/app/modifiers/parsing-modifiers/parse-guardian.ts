import { IClue, IGrid, IGridCell, IPuzzle } from "src/app/model/interfaces";
import { PuzzleModifier } from "../puzzle-modifier";
import { Grid } from "src/app/model/puzzle-model/grid";
import { Clue } from "src/app/model/puzzle-model/clue";
export class ParseGuardian extends PuzzleModifier {

    constructor(
        //private traceService: TraceService,
    ) {
        super();
    }

    public exec(puzzle: IPuzzle): void {

        console.log("Guardian Parser: STARTING");

        try {
            const source = JSON.parse(puzzle.provision.source);

            //console.log("Guardian Parser: " + JSON.stringify(source, null, 2));

            const crossword = source.data;

            puzzle.info.instructions = crossword.instructions;

            this.parseSetter(puzzle, crossword);
            this.parseDate(puzzle, crossword);
            this.parseClues(puzzle, crossword);
            this.parseGrid(puzzle, crossword);

            console.log("Guardian Parser: FINISHED");


        } catch (error) {
            console.log("Guardian Parser: " + error);
        }
    }

    private parseSetter(puzzle: IPuzzle, crossword: any) {
        puzzle.info.setter = puzzle.info.provider === "everyman" ? "Everyman" : crossword.creator.name;
    }

    private parseDate(puzzle: IPuzzle, crossword: any) {
        // TO DO: get date from crossword
    }

    private parseClues(puzzle: IPuzzle, crossword: any) {
        let clueCounter = 0;

        puzzle.clues = [];

        crossword.entries.forEach((entry: any) => {

            var clueText = (entry.clue as string).replace(/<[a-z/]+>/gi, "");

            let clue: IClue = {
                id: "clue" + clueCounter++,
                caption: entry.humanNumber,
                group: entry.direction,
                text: clueText,
                solution: entry.solution ? entry.solution : "",
                letterCount: Clue.getLetterCount(clueText),
                annotation: "",
                redirect: "",
                format: "",
                highlight: false,
                answers: [""],
                link: {
                    warning: "",
                    gridRefs: []
                },
                comment: null,
                chunks: [{
                    text: clueText,
                    isDefinition: false
                }], // TO DO: get chunks from crossword
                warnings: [],
            };

            entry.group.forEach((groupId: string) => {

                //The group array in the json contains a list of entry ids, each id references an 
                //entry (possibly the current one) that contains a grid word in the solution.

                let entry = crossword.entries.find(entry => entry.id === groupId);

                if (entry) {
                    clue.link.gridRefs.push({
                        id: entry.id,
                        anchor: entry.number,
                        direction: entry.direction
                    });
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

        //console.log(`GRID ${JSON.stringify(grid, null, 2)}`);

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
            digits = "";

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

                //write out the placeholder for the remaining word (if there is one)
                let wordLength = parseInt(digits);
                for (let i = 0; i < wordLength; i++) {
                    format += ",";
                }
            });

            return format;
        }
    }
}
