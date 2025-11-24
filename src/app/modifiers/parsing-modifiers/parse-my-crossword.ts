import { ClueGroup, IClue, IGrid, IGridCell, IPuzzle } from "src/app/model/interfaces";
import { PuzzleModifier } from "../puzzle-modifier";
import { Grid } from "src/app/model/puzzle-model/grid";
import { Clue } from "src/app/model/puzzle-model/clue";
import { GridReference } from "src/app/model/puzzle-model/grid-reference";
import { ProviderService } from "src/app/services/puzzles/provider.service";

// The MyCrossword JSON format is based on The Mxw JSON format, so currently most of this is file indentical to parse-guardian.ts
// Going forward there is no intention to keep the two input formats in synch, so duplicate the code so they can be modified independently

interface IMxwCrossword {
    id: string;
    number: number; // the crossword serial number
    name: string;   // the crossword title
    creator: IMxwCreator;
    date: number;   // what is this? - the date of what?
    webPublicationDate: number; // the date the crossword was published perhaps?
    entries: IMxwEntry[];  // both the clues and grid entries, yuk!
    dimensions: IMxwDimensions;    // the size of the grid
    crosswordType: string;  // eg "cryptic" or "prize"
    pdf?: string;           // the url of the pdf version of the crossword
    instructions?: string;  // special instructions for this crossword
}

// IMxwEntry appears to be a bit of a confused mish-mash between the clues and the grid entries
// In some repects IMxwEntry represents a clue, in others it represents a grid entry
// for example, it has a clue text and a solution (like a clue), but also a position and a length (like a grid entry)
// However: there is not a 1 to 1 relationship between clues and grid entries, so having a common interface does not make sense

interface IMxwEntry {
    id: string;         // the unique id of the entry when regarded as a clue
    number: number;     // the grid number (grid anchor) of the entry when regarded as a grid entry
    humanNumber: string; // the caption for the clue - eg "3, 13 across"
    direction: string;  // "across" or "down" - applicable to both the clueand the grid entry
    length: number;     // number of cells in this entry, not the answer to the clue
    group: string[];    // array of IGuradianEntry ids
    position: IMxwPosition; // the position of the first cell of this entry (not not necessarily of the solution to the clue) - zero based
    solution?: string;   // the letters that go into this grid entry, not necessarily the solution to the clue
    clue: string;       // the clue text for "number direction" - eg "1 across"
}

interface IMxwPosition {
    x: number;  // zero based column index
    y: number;  // zero basedc row index
}

interface IMxwCreator {
    name: string;
    webUrl: string;
}

interface IMxwDimensions {
    cols: number;
    rows: number;
}

export class ParseMyCrossword extends PuzzleModifier {

    constructor(
        private providerService: ProviderService,
    ) {
        super();
    }

    public exec(puzzle: IPuzzle): void {

        try {
            const crossword: IMxwCrossword = JSON.parse(puzzle.provision.source);

            puzzle.info.instructions = crossword.instructions;

            this.parseSetter(puzzle, crossword);
            this.parseDate(puzzle, crossword);
            this.parseClues(puzzle, crossword);
            this.parseGrid(puzzle, crossword);

        } catch (error) {
            throw new Error(`Failed to parse ${puzzle.info.provider} data: ` + error);
        }
    }

    private parseSetter(puzzle: IPuzzle, crossword: IMxwCrossword) {
        const providerString = this.providerService.getProviderString(puzzle.info.provider);

        puzzle.info.setter = crossword.creator.name;
        puzzle.info.title = `${providerString} ${crossword.name} by ${puzzle.info.setter}`;
    }

    private parseDate(puzzle: IPuzzle, crossword: IMxwCrossword) {
        try {
            puzzle.info.puzzleDate = new Date(crossword.date);
        } catch { }
    }

    private parseClues(puzzle: IPuzzle, crossword: IMxwCrossword) {
        puzzle.clues = [];

        crossword.entries.forEach((entry: IMxwEntry) => {

            let clueText = (entry.clue as string).replace(/<[a-z/]+>/gi, "");
            let letterCount = Clue.getLetterCount(clueText);

            let clue: IClue = {
                id: entry.id,
                caption: entry.humanNumber,
                group: entry.direction as ClueGroup,
                text: clueText,
                solution: "",
                letterCount: Clue.getLetterCount(clueText),
                annotation: null,
                redirect: this.getRedirect(crossword, entry.id),
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

                    if (entry.solution) {
                        clue.solution += " " + entry.solution;
                    }
                }

                clue.solution = clue.solution.trim();
            });

            puzzle.clues.push(clue);
        });
    }

    private parseGrid(puzzle: IPuzzle, crossword: IMxwCrossword) {

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
        crossword.entries.forEach((entry: IMxwEntry) => {

            for (let i = 0; i < entry.length; i++) {
                let cell: IGridCell;

                let x = entry.position.x;
                let y = entry.position.y;

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

    private getRedirect(crossword: IMxwCrossword, clueId: string): string {
        let result = null;
        const clue = crossword.entries.find(entry => entry.id === clueId);

        if (Clue.isRedirect(clue.clue)) {
            result = clue.group[0];
        }

        return result;
    }
}
