import { Expansion } from '@angular/compiler';
import { IGrid, GridNavigation, Direction, ClueGroup, IGridReference, IGridCell, IGridEntry } from '../interfaces';
import { GridCell } from './grid-cell';
import { GridProperties } from './grid-properties';
import { GridReference } from './grid-reference';

export class Grid implements IGrid {
    public readonly properties: GridProperties | null = null;
    public readonly cells: GridCell[];

    constructor(data: any) {
        if (data) {
            if (data.size) {
                this.properties = new GridProperties({ 
                    size: {
                        across: data.size.across, 
                        down: data.size.down,
                    },
                    style: data.style,
                    numbered: true,
                    symmetrical: true,
                });
            } else if (data.properties) {
                this.properties = new GridProperties(data.properties);
            }

            let cells: GridCell[] = [];
            data.cells.forEach((cell: any) => cells.push(new GridCell(cell)));
            this.cells = cells;
        } else {
            throw new Error("No data provided to Grid constructor");
        }
    }

    
    public getMutableCopy(): IGrid {
        return JSON.parse(JSON.stringify(this)) as IGrid;
    }

    // TO DO: find other places where grids are created and refactor to use this method

    public static createEmptyGrid(params: GridProperties): Grid {
        let cells: IGridCell[] = [];
        const cellsAcross = params.size.across;
        const cellsDown = params.size.down;

        for(let x = 0; x < cellsAcross; x++) {
            for(let y = 0; y < cellsDown; y++) {
                let cell: GridCell = {
                    id: `cell-${x}-${y}`,
                    x,
                    y,
                    anchor: 0,
                    caption: "",
                    content: "",
                    hasConflict: false,
                    light: true,
                    rightBar: false,
                    bottomBar: false,
                    highlight: false,
                    textColor: "",
                    hidden: false,
                    shading: "",
                    edit: false,
                };
                cells.push(cell);
            }
        }

        return new Grid({
            properties: params,
            cells: cells,
        });
    }


    public cellAt(x: number, y: number): GridCell | undefined {
        return this.cells.find((cell) => cell.x === x && cell.y === y);
    }

    public *getNavigator(startCellId: string, orientation: GridNavigation, wrap: boolean = true): Iterator<GridCell> {
        const cellsAcross = this.properties.size.across;
        const cellsDown = this.properties.size.down;

        let current: GridCell = this.cells.find(c => c.id === startCellId);
        
        // yield the "start" as the first "next" value
        // the naming seems confusing but is the way that one would expect the iterator to work
        if (current) {
            yield current;
        } else {
            return null;
        }

        while (current !== null) {

            switch(orientation) {
                case "right":
                    if (current.x + 1 < cellsAcross) {
                        current = this.cellAt(current.x + 1, current.y);
                    } else if (current.y + 1 < cellsDown) {
                        current = this.cellAt(0, current.y + 1);
                    } else {
                        current = wrap ? this.cellAt(0, 0) : null;
                    }
                    break;
                case "left":
                    if (current.x - 1 >= 0) {
                        current = this.cellAt(current.x - 1, current.y);
                    } else if (current.y - 1 >= 0) {
                        current = this.cellAt(cellsAcross - 1, current.y - 1);
                    } else {
                        current = wrap ? this.cellAt(cellsAcross - 1, cellsDown - 1) : null;
                    }
                    break;
                case "up":
                    if (current.y - 1 >= 0) {
                        current = this.cellAt(current.x, current.y - 1);
                    } else if (current.x - 1 >= 0) {
                        current = this.cellAt(current.x - 1, cellsDown - 1);
                    } else {
                        current = wrap ? this.cellAt(cellsAcross - 1, cellsDown - 1) : null;
                    }
                    break;
                case "down":
                    if (current.y + 1 < cellsDown) {
                        current = this.cellAt(current.x, current.y + 1);
                    } else if (current.x + 1 < cellsDown) {
                        current = this.cellAt(current.x + 1, 0);
                    } else {
                        current = wrap ? this.cellAt(0, 0) : null;
                    }
                    break;
            };

            if (current && current.id !== startCellId) {
                yield current;
            } else {
                return null as GridCell;
            }
        }

        return null as GridCell;
    }

    public getGridEntryForCell(cellId: string): GridCell[] {
        let entry: GridCell[] = [];
        let startCell = this.cells.find(c => c.id === cellId);

        if (startCell && startCell.light) {
            entry = this.getEntry(startCell, "across");
            if (entry.length < 2) {
                entry = this.getEntry(startCell, "down");
            }
        }

        return entry;
    }

    public getMaxAnchor(): number {
        const cells = this.cells
            .filter(cell => cell.anchor)
            .sort((a, b) => b.anchor - a.anchor);

        return cells.length > 0 ? cells[0].anchor : 0;
    }

    public getGridEntryFromReference(ref: GridReference): ReadonlyArray<GridCell> {
        let entry: ReadonlyArray<GridCell> = [];

        let startCell = this.cells.find(c => c.anchor === ref.anchor);

        if (startCell) {
            let cells = this.getEntry(startCell, ref.direction);
            if (cells.length > 0 && cells[0].anchor === ref.anchor) {
                entry = cells;
            }
        }

        return entry;
    }

    public getNextClueNumber(startRef: IGridReference): number {

        // TO DO: work how to handle this for non-numbered grids (eg carte blanches etc)
        let clueNumber = startRef.anchor;
        let found = false;

        // find the caption of the next entry in the same direction

        do {
            clueNumber++;
            let startCell = this.cells.find(c => c.anchor === clueNumber);
            let x: number;
            let y : number;
            
            if (!startCell) {
                return null;
            } else {
                x = startCell.x;
                y = startCell.y;
            }

            if (startRef.direction === "across") {
                if (x === 0) {
                    found = true;
                } else {
                    let prevCell = this.cellAt( x - 1, y);
                    
                    if (this.properties.style === "standard") {
                        found = !prevCell.light;
                    } else {
                        found = prevCell.rightBar;
                    }
                }
            } else {
                if (y === 0) {
                    found = true;
                } else {
                    let prevCell = this.cellAt( x, y - 1);
                    
                    if (this.properties.style === "standard") {
                        found = !prevCell.light;
                    } else {
                        found = prevCell.bottomBar;
                    }
                }
            }
        } while (!found);

        return clueNumber;
    }

    public hasConflict(): boolean {
        let result = false;

        this.cells.forEach(cell => {
            if (cell.hasConflict) {
                result = true;
            }
        });

        return result;
    }

    public getEntries(): ReadonlyArray<IGridEntry> {
        let entries: IGridEntry[] = [];

        this.cells.filter(c => c.anchor).forEach(cell => {

            ["across", "down"].forEach(direction => {
                let entry: GridCell[] = this.getEntry(cell, direction as Direction);
            
                if (entry.length > 1) {
                    entries.push({
                        id: cell.id,
                        anchor: cell.anchor,
                        direction: direction as Direction,
                        length: entry.length,
                    });
                }
            });
        });

        return entries;
    }

    private getEntry(entryCell: GridCell, direction: Direction): GridCell[] {
        let result: GridCell[] = [];
        let startCell: GridCell = null;

        const indexProp = direction === "across" ? "x" : "y";
        const barProp = direction === "across" ? "rightBar" : "bottomBar";
        const forwards = direction === "across" ? "right" : "down";
        const backwards = direction === "across" ? "left" : "up";
        const gridSize = direction === "across" ? this.properties.size.across : this.properties.size.down;

        // first backtrack looking for the start of the entry
        let nav = this.getNavigator(entryCell.id, backwards);

        let cell = nav.next().value;
        let next = nav.next().value;

        while(cell) {
            if (cell[indexProp] === 0 ||
                (next && !next.light) ||
                (next && next[barProp])) {
                
                // found first cell in entry
                startCell = cell;
                cell = null;
                next = null;
            } else {
                cell = next;
                next = nav.next().value;
            }
        };

        // now go forward again looking for the end of the entry
        nav = this.getNavigator(startCell.id, forwards);
        cell = nav.next().value;
        next = nav.next().value;

        while(cell) {
            result.push(cell);

            if (cell[indexProp] === gridSize - 1 ||
                cell[barProp] ||
                (next && !next.light)) {

                //found last cell in entry
                cell = null;
                next = null;
            } else {
                cell = next;
                next = nav.next().value;
            }
        };

        return result;
    }

    private getEntryDirection(entry: GridCell[]): ClueGroup {
        let result: ClueGroup = "across";

        if (entry && entry.length > 1 && entry[0].x === entry[1].x) {
            result = "down";
        }

        return result;
    }

    public findWord(word: string): readonly (readonly GridCell[])[] {

        let results: (readonly GridCell[])[] = [];

        for(let startCell of this.getAllCells()) {
            for (let result of this.findWordInGrid(word, startCell, [])) {
                results.push(result);
            }
        }

        return results;

    }

    private getSurroundingCells(cell: GridCell, ignore: readonly GridCell[] = []): readonly GridCell[] {
        let result: GridCell[] = [];

        const surroundingCells: GridCell[] = [];
        for (let i = -1; i < 2; i++) {
                for (let j = -1; j < 2; j++) {
                    let x = cell.x + i;
                    let y = cell.y + j;

                    if (x >= 0 && y >= 0 && x < this.properties.size.across && y < this.properties.size.down) {
                        if (x !== cell.x || y !== cell.y) {
                            if (this.cellAt(x, y).light) {
                                surroundingCells.push(this.cellAt(x, y));
                            }
                        }
                    }
            }
        }

        if (ignore.length) {
            result = surroundingCells.filter(c => !ignore.includes(c));
        }
        else {
            result = surroundingCells;
        }

         return result;
    }

    private *getWordfinderGenerator(word: string, startCell: GridCell, history: readonly GridCell[]): Generator<readonly GridCell[], void, void> {

        if (!word) {
            throw "Word parameter must a non-empty string";
        }

        const firstLetterOfWord = word.substring(0, 1);
        const remainingLettersOfWord = word.substring(1);

        if(startCell.content === firstLetterOfWord) {

            // looking good, first letter matches so record this
            const progress: readonly GridCell[] = [...history, startCell];

            if (remainingLettersOfWord.length === 0) {
                // word has been found, so yield a result
                yield progress;
            
            } else {
                // now keep looking for the remaining letters
                for (const cell of this.getSurroundingCells(startCell, progress)) {
                    
                    for (let result of this.findWordInGrid(remainingLettersOfWord, cell, progress)) {
                        console.log(`Yielding-b ${result.map(c=> c.content).join("")}`)
                        yield result;
                    }
                }
            }
        } else {
            // not possible to continue any further so abandon without yieding anything
        }

        return;
    }

    // this function enables the generator to be used in a for() loop
    private findWordInGrid(word: string, startCell: GridCell, history: readonly GridCell[]) {
        return { 
            [Symbol.iterator]: () => this.getWordfinderGenerator(word, startCell, history)
        }
    }

    // this function enables the navigator to be used in a for() loop
    private getAllCells()  {
        return {
            [Symbol.iterator]: () => this.getNavigator(this.cellAt(0,0).id, "left", true)
        }
    }
}