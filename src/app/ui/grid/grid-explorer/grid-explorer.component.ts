import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { GridCell } from 'src/app/model/puzzle-model/grid-cell';
import { Puzzle } from 'src/app/model/puzzle-model/puzzle';
import { ClearShading } from 'src/app/modifiers/grid-modifiers/clear-shading';
import { IActivePuzzle } from 'src/app/services/puzzles/puzzle-management.service';
import { GridParameters } from '../../common';
import { GridPainterService } from '../grid-painter.service';
import { ScratchpadService } from '../scratchpad.service';


class GridParametersSpotlight implements GridParameters {
    public readonly cellSize = 33;
    public readonly borderWidth = 1;
    public readonly barWidth = 3;
    public readonly gridPadding = 5;
    public readonly cellPadding = 2;
    public readonly captionFont = "9px serif";
    public readonly textFont = "20px sans-serif";
    public readonly gridColor = "grey";
    public readonly highlightColor = "BurlyWood";
    public readonly conflictColor = "Tomato";
}

@Component({
    selector: 'app-grid-explorer',
    templateUrl: './grid-explorer.component.html',
    styleUrls: ['./grid-explorer.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridExplorerComponent implements OnInit {

    //TO DO:this component has quite a lot of similarities with GridComponent.
    // Think about whether it would be a good idea to share some of this functionality.
    // Maybe it would just add complexity and dependencies for no great benefit.

    @ViewChild('gridCanvas', { static: false }) canvas: ElementRef;
    @Output() cellClick = new EventEmitter<GridCell>();

    public canvasHeight: number = 0;
    public canvasWidth: number = 0;
    public puzzle: Puzzle;

    private gridParams: GridParameters;
    private viewInitiated = false;
    private subs: Subscription[] = [];

    constructor(
        private activePuzzleService: IActivePuzzle,
        private scratchpadService: ScratchpadService,
        private gridPainter: GridPainterService,
        private detRef: ChangeDetectorRef) {
    }

    public ngOnInit() {
        this.gridParams = new GridParametersSpotlight();

        this.subs.push(
            this.activePuzzleService.observe().subscribe((puzzle) => {
                this.scratchpadService.use(puzzle, new ClearShading())
            })
        );

        this.subs.push(
            this.scratchpadService.observe().subscribe(
                (puzzle) => {
                    this.puzzle = puzzle;

                    if (puzzle && puzzle.grid) {
                        this.resizeCanvas();

                        // don't refresh the grid until the native canvas has had a chance to resize
                        setTimeout(() => { 
                            this.drawGrid(null); 
                            this.detRef.detectChanges() 
                        }, 0);

                        this.detRef.detectChanges();
                    }
                }
            )
        );

    }

    public ngAfterViewInit() {
        this.viewInitiated = true;
        this.drawGrid(null);
    }

    private resizeCanvas() {
        if (this.puzzle) {

            this.canvasWidth = this.gridParams.cellSize * this.puzzle.grid.properties.size.across + this.gridParams.gridPadding * 2;
            this.canvasHeight = this.gridParams.cellSize * this.puzzle.grid.properties.size.down + this.gridParams.gridPadding * 2;
            }
    }
    
    private drawGrid(caption: string): void {
        if (this.puzzle && this.puzzle.grid && this.viewInitiated && this.canvas) {
            const canvasEl = <HTMLCanvasElement>this.canvas.nativeElement;
            const context = canvasEl.getContext('2d');

            let params = { ...this.gridParams };
            
            this.gridPainter.drawGrid(context, this.puzzle.grid, null, params, caption);
        }
    }

    public onCanvasClick(params: any) {
        const cellSize = this.gridParams.cellSize;

        const bounds = this.canvas.nativeElement.getBoundingClientRect();
        let xOffsetInGrid = params.clientX - bounds.left - this.gridParams.gridPadding;
        let yOffsetInGrid = params.clientY - bounds.top - this.gridParams.gridPadding;

        // i,j represent the cell number in the model eg 3 cells across and two cells down
        const i = Math.floor(xOffsetInGrid / cellSize);
        const j = Math.floor(yOffsetInGrid / cellSize);

        // x,y represent the offset (in pixels) of the mouse click from the top-left corner of cell i,j
        let x = xOffsetInGrid % cellSize;
        let y = yOffsetInGrid % cellSize;

        let cell: GridCell = this.puzzle.grid.cellAt(i, j);
        if (cell) {
            // for all grids emit an event to say a cell has been clicked
            this.cellClick.emit(cell);

            //TO DO: need to start coding here...

        }
    }

}
