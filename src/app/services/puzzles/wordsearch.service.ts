import { Injectable } from '@angular/core';
import { Grid } from 'src/app/model/puzzle-model/grid';

export type GridCoordinate = [number, number];

export type WordsearchStrategy = "linear" | "circular";

@Injectable({
    providedIn: 'root'
})
export class WordsearchService {

    constructor() { }

    public searchGrid(grid: Grid, text: string): [GridCoordinate?] {
        
        // TO DO: think about the clean up more, do we allow numbers or symbols?
        // TO DO: think about how to handle mutiple words, use hyphens?
        // TO DO: think if this needs to be asynchronous, delivering artial progres resuts
        // TO DO: think about how to search for multiple terms

        const exp = new RegExp(String.raw`[^a-z]`, "g");
        const searchWord = text.replace(exp, "");

        console.log(`Searching for [${searchWord}]`);

        return [];
    }

    private findWord(word: string, start: GridCoordinate) {


    }


    private getAdjacentCells(start: GridCoordinate): GridCoordinate[] {
        return [];
    }
}
