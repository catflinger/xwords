import { PuzzleModifier } from '../puzzle-modifier';
import { IGrid, IGridCell, IPuzzle } from 'src/app/model/interfaces';
import { GridCell } from 'src/app/model/puzzle-model/grid-cell';
import { Observable, range } from 'rxjs';
import { filter, map } from "rxjs/operators";

export class SpotDiagonalDown extends PuzzleModifier {

    constructor(private cell: GridCell) {
        super();
    }

    public exec(puzzle: IPuzzle) {
        if (puzzle.grid) {
            this.getDiagonalFalling(puzzle.grid, this.cell).subscribe(cell => this.spotlight(cell));
        }
    }

    private getDiagonalFalling(grid: IGrid, cell: IGridCell): Observable<IGridCell> {
        const across = grid.properties.size.across;
        const down = grid.properties.size.down;
        const max = Math.max(across, down);

        const X = 0;
        const Y = cell.y - cell.x; 

        return range(0, max * 2)
        .pipe(
            map(n => grid.cells.find((cell) => cell.x === X + n && cell.y === Y + n)),
            filter(cell => !!cell)
        )
    }
}