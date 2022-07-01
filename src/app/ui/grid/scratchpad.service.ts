import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Puzzle } from '../../model/puzzle-model/puzzle';
import { IPuzzleModifier } from '../../modifiers/puzzle-modifier';
import { IPuzzle } from 'src/app/model/interfaces';

@Injectable({
    providedIn: 'root'
})
export class ScratchpadService {

    private bsActive: BehaviorSubject<Puzzle>;

    constructor() {
        this.bsActive = new BehaviorSubject<Puzzle>(null);
    }

    public observe(): Observable<Puzzle> {
        return this.bsActive.asObservable();
    }

    public use(puzzle:IPuzzle, ...reducers: IPuzzleModifier[]): void {
        if (puzzle) {
            let copy = JSON.parse(JSON.stringify(puzzle));
            reducers.forEach(reducer => reducer.exec(copy));
            this.bsActive.next(new Puzzle(copy));
        } else {
            this.bsActive.next(null);
        }
    }
    public update(...reducers: IPuzzleModifier[]): void {
        let current = this.bsActive.value;

        if (current) {
            let copy = JSON.parse(JSON.stringify(current));
            reducers.forEach(reducer => reducer.exec(copy));
            this.bsActive.next(new Puzzle(copy));
        } else {
            this.bsActive.next(null);
        }
    }
}
