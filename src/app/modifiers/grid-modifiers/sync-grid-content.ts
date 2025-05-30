import { PuzzleModifier } from '../puzzle-modifier';
import { IPuzzle } from '../../model/interfaces';
import { Grid } from 'src/app/model/puzzle-model/grid';

export class SyncGridContent extends PuzzleModifier {
    constructor() {  super(); }

    exec(puzzle: IPuzzle) {
        if (!puzzle || !puzzle.clues || !puzzle.grid) {
            return;
        }

        // TO DO: temporary fix, need to think of something better
        let gridX: Grid = new Grid(puzzle.grid);

        // clear the grid
        puzzle.grid.cells.forEach(cell => {
            cell.content = ""; 
            cell.hasConflict = false; 
        });

        puzzle.clues.forEach((clue) => {
            let answer = clue.answers[0].toUpperCase().replace(/[^A-Z?]/g, "").replace(/[?]/g, " ");
            let index = 0;

            if (answer) {
                clue.link.gridRefs.forEach((gridRef) => {
                    gridX.getGridEntryFromReference(gridRef)
                    .map(cell => cell.id)
                    .forEach(id => {
                        let cell = puzzle.grid.cells.find(c => c.id === id);
                        if (index < answer.length) {
                            const letter = answer.charAt(index);

                            if (cell.content && cell.content !== letter) {
                                cell.hasConflict = true;
                            }
                            cell.content = letter;
                        }
                        index++;
                    });
                });
            }
        });
    }
}