import { Component, OnInit } from '@angular/core';
import { Puzzle } from 'src/app/model/puzzle-model/puzzle';
import { range, Subscription } from 'rxjs';
import { IActivePuzzle } from 'src/app/services/puzzles/puzzle-management.service';
import { GridCell } from 'src/app/model/puzzle-model/grid-cell';
import { AppService } from '../../general/app.service';
import { NavService } from '../../../services/navigation/nav.service';
import { AppTrackData } from '../../../services/navigation/tracks/app-track-data';
import { Grid } from 'src/app/model/puzzle-model/grid';
import { filter, map, mergeMap, reduce, tap, toArray } from 'rxjs/operators';
import { ScratchpadService } from '../../grid/scratchpad.service';
import { SpotLetter } from 'src/app/modifiers/grid-modifiers/spot-letter';
import { SpotClear } from 'src/app/modifiers/grid-modifiers/spot-clear';
import { SpotRow } from 'src/app/modifiers/grid-modifiers/spot-row';
import { SpotColumn } from 'src/app/modifiers/grid-modifiers/spot-column';
import { ClearShading } from 'src/app/modifiers/grid-modifiers/clear-shading';
import { PuzzleModifier } from 'src/app/modifiers/puzzle-modifier';
import { SpotDiagonalUp } from 'src/app/modifiers/grid-modifiers/spot-diagonal-up';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SpotDiagonalDown } from 'src/app/modifiers/grid-modifiers/spot-diagonal-down';

class PangramLetter {
    private _count: number = 0;

    constructor(
        public readonly letter: string,
    ) {}

    public isMatchFor(s: string): boolean {
        if (s && typeof (s) === "string") {
            return s.toUpperCase().includes(this.letter);
        }
        return false;
    }

    public get count() : number {
        return this._count;
    }
    
    public incrementCount() {
        this._count ++;
    }
}

@Component({
  selector: 'app-nina-finder',
  templateUrl: './nina-finder.component.html',
  styleUrls: ['./nina-finder.component.css']
})
export class NinaFinderComponent implements OnInit {
    private subs: Subscription[] = [];

    public puzzle: Puzzle = null;
    public barred: boolean = false;

    public pangramCounter: PangramLetter[] = [];

    public mainDiagonal: string = "";
    public otherDiagonal: string = "";
    public mainDiagonalReverse: string = "";
    public otherDiagonalReverse: string = "";

    public perimiter: string = "";

    public uncheckedRows: string[] = [];
    public uncheckedColumns: string[] = [];
    public uncheckedRowsR: string[] = [];
    public uncheckedColumnsR: string[] = [];

    public diagonals: string[] = [];
    public diagonals2: string[] = [];

    public activePanel: string = "letterPanel";

    public form: FormGroup;

    constructor(
        private navService: NavService<AppTrackData>,
        private appService: AppService,
        private activePuzzle: IActivePuzzle,
        private scratchpad: ScratchpadService,
        private formBuilder: FormBuilder,
    ) {
        this.clearPangramCounter();
    }

    public ngOnInit() {

        this.form = this.formBuilder.group({
            diagonal: "both",
            rowcol: "both"
        });

        this.form.valueChanges.subscribe(() => this.scratchpad.update(new SpotClear()));

        if (!this.activePuzzle.hasPuzzle) {
            this.navService.goHome();
        } else {
            this.subs.push(
                this.activePuzzle.observe()
                .subscribe(
                    (puzzle) => {
                        this.puzzle = puzzle;

                        if (!puzzle){
                            // skip over this
                        } else if (!puzzle.grid){
                            this.appService.setAlertError("This puzzle does not have a grid", null);
                        } else {
                            this.barred = puzzle.grid.properties.style === "barred";
                            this.countLetters(puzzle.grid);
                            this.extractDiagonals(puzzle.grid);
                            this.getExtractPerimiter(puzzle.grid);
                            this.extractUncheckedRows(puzzle.grid);
                            this.extractUncheckedColumns(puzzle.grid);

                            this.getDiagonals(puzzle.grid)
                            .subscribe(result => {
                                this.diagonals = result;
                            });

                            this.getDiagonals2(puzzle.grid)
                            .subscribe(result => {
                                this.diagonals2 = result;
                            });
                        }
                    }
            ));
        }
    }

    public ngOnDestroy(){
        this.subs.forEach(sub => sub.unsubscribe());
    }

    public onCellClick(cell: GridCell) {
        this.appService.clear();

        if (this.activePanel === "rowcolPanel") {
            let mods: PuzzleModifier[] = [new SpotClear()];
            const mode = this.form.value.rowcol;

            if (mode === "row" || mode === "both") {
                mods.push(new SpotRow(cell));
            }
            if (mode === "col" || mode === "both") {
                mods.push(new SpotColumn(cell));
            }
            this.scratchpad.update(...mods);

        } else if (this.activePanel === "diagonalPanel") {

            let mods: PuzzleModifier[] = [new SpotClear()];
            const mode = this.form.value.diagonal;

            if (mode === "rising" || mode === "both") {
                mods.push(new SpotDiagonalUp(cell));
            } 
            if (mode === "falling" || mode === "both") {
                mods.push(new SpotDiagonalDown(cell));
            }
            this.scratchpad.update(...mods);
        }
    }

    public onBack() {
        this.appService.clear();
        this.navService.navigate("back");
    }

    public reverseString(line: string) {
        return [...line].reverse().join("");
    }

    public onLetterClick(letter: string) {
        this.scratchpad.update(
            new SpotClear(),
            new SpotLetter(letter)
        );
    }

    public onTabChange() {
        this.scratchpad.update(
            new SpotClear(),
        );
    }

    private clearPangramCounter() {
        this.pangramCounter = [];

        range(0, 26)
        .subscribe(offset => 
            this.pangramCounter.push(
                new PangramLetter(
                    String.fromCharCode("A".charCodeAt(0) + offset)
                )
            )
        );
    }

    private countLetters(grid: Grid) {
        this.clearPangramCounter();

        grid.cells.forEach(cell => {
            let entry = this.pangramCounter.find(pl => cell.light && pl.isMatchFor(cell.content));
            if (entry) {
                entry.incrementCount();
            }
        });
    }

    private extractDiagonals(grid: Grid) {
        const diagLength = Math.min(grid.properties.size.across, grid.properties.size.down);
        this.mainDiagonal = "";
        this.otherDiagonal = "";

        range(0, diagLength)
        .pipe(
            map(offset => [
                this.letterOrUnderscore(grid.cellAt(offset, offset)),
                this.letterOrUnderscore(grid.cellAt(offset, diagLength - 1 - offset))
            ]),
            reduce(
                (acc: {main: string, other: string}, letters: string[]) => {
                    return {
                        main: acc.main += letters[0],
                        other: acc.other += letters[1]
                    };
                },
                { main: "", other: "" }
            )
        )
        .subscribe(diags => {
            this.mainDiagonal = diags.main;
            this.otherDiagonal = diags.other;
            this.mainDiagonalReverse = this.mainDiagonal.split("").reverse().join("");
            this.otherDiagonalReverse = this.otherDiagonal.split("").reverse().join("");
        })
    }

    private extractUncheckedRows(grid: Grid) {
        this.uncheckedRows = [];
        this.uncheckedRowsR = [];
        const down = grid.properties.size.down;
        
        for(let y: number = 0; y < down; y++) {

            const checkedCells = grid.cells.filter(c => c.y === y && this.inAcrossLight(c) && this.inDownLight(c));

            if (checkedCells.length === 0) {

                const unCheckedCells = grid.cells.filter(c => c.y === y && c.light);

                if (unCheckedCells.length > 0) {
                    let str = unCheckedCells.map(c => this.letterOrUnderscore(c))
                    .join("");
    
                    this.uncheckedRows.push(str);
                    this.uncheckedRowsR.push(str.split("").reverse().join(""));
                }
            }
        }
    }

    private extractUncheckedColumns(grid: Grid) {
        this.uncheckedColumns = [];
        this.uncheckedColumnsR = [];
        const across = grid.properties.size.across;
        
        for(let x: number = 0; x < across; x++) {

            const checkedCells = grid.cells.filter(c => c.x === x && this.inAcrossLight(c) && this.inDownLight(c));

            if (checkedCells.length === 0) {

                const unCheckedCells = grid.cells.filter(c => c.x === x && c.light);

                if (unCheckedCells.length > 0) {
                    let str = unCheckedCells.map(c => this.letterOrUnderscore(c))
                    .join("");
    
                    this.uncheckedColumns.push(str);
                    this.uncheckedColumnsR.push(str.split("").reverse().join(""));
                }
            }
        }
    }

    private getExtractPerimiter(grid: Grid) {
        this.perimiter = "";
        const across = grid.properties.size.across;
        const down = grid.properties.size.down;

        for(let x: number = 0; x < across; x++) {
            this.perimiter += this.letterOrUnderscore(grid.cellAt(x, 0));
        }

        for(let y: number = 0; y < down; y++) {
            this.perimiter += this.letterOrUnderscore(grid.cellAt(across - 1, y));
        }

        for(let x: number = across - 1; x >= 0; x--) {
            this.perimiter += this.letterOrUnderscore(grid.cellAt(x, down - 1));
        }

        for(let y: number = down - 1; y >= 0; y--) {
            this.perimiter += this.letterOrUnderscore(grid.cellAt(0, y));
        }

    }

    private letterOrUnderscore(cell: GridCell): string {
        if (cell.light) {
            const trim = cell.content ? cell.content.trim() : "";
            return trim || "_";
        }
        return "";
    }

    private inAcrossLight(target: GridCell): boolean {
        const grid = this.puzzle.grid;
        let checked: boolean = false;

        if (grid.properties.style === "standard") {

            const neigbours = grid.cells
                .filter(c => c.y === target.y && Math.abs(c.x - target.x) === 1)
                .filter(c => c.light)
                .length;

            checked = target.light && neigbours > 0;

        }

        return checked;
    }

    private inDownLight(target: GridCell): boolean {
        const grid = this.puzzle.grid;
        let checked: boolean = false;

        if (grid.properties.style === "standard") {

            const neigbours = grid.cells
                .filter(c => c.x === target.x && Math.abs(c.y - target.y) === 1)
                .filter(c => c.light)
                .length;

            checked = target.light && neigbours > 0;

        }

        return checked;
    }

    private getDiagonals(grid: Grid) {
        const across = grid.properties.size.across;
        const down = grid.properties.size.down;
        const max = Math.max(across, down);

        return range(0, max * 2)
        .pipe(
            mergeMap(x =>
                range(0, max)
                .pipe(
                    map(y => grid.cellAt((x + y ) - max, max - 1 - y)),
                    filter(cell => !!cell),
                    map(cell => cell.content || "?"),
                    reduce( (accum, val) => accum + val, ""),
                )
            ),
            toArray(),
        )
    }

    private getDiagonals2(grid: Grid) {
        const across = grid.properties.size.across;
        const down = grid.properties.size.down;
        const max = Math.max(across, down);

        return range(0, max * 2)
        .pipe(
            mergeMap(y =>
                range(0, max)
                .pipe(
                    map(x => grid.cellAt(x, y + x - max)),
                    filter(cell => !!cell),
                    map(cell => cell.content || "?"),
                    reduce( (accum, val) => accum + val, ""),
                )
            ),
            toArray(),
        )
    }

}
