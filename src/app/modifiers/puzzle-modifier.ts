
// TO DO: 1) Make teh modifiers into angular services so they are easy to test
// TO DO: 2) Consolidate the various update-xxxxx.ts modifiers into a single update modifier 

import { IGridCell, IPuzzle } from '../model/interfaces';

export abstract class PuzzleModifier {
    
    // return any truthy value to cancel the update
    abstract exec(puzzle: IPuzzle): void;

    protected spotlight(cell: IGridCell): void {
        cell.shading =  "burlywood";
        cell.textColor = "black";
    }
};
