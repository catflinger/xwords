import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, Observable } from 'rxjs';
import { Frame } from './frame';
import { v4 as uuid } from "uuid";

@Injectable({
    providedIn: 'root'
})
export class FrameStoreService {

    private bsFrames: BehaviorSubject<readonly Frame[]> = new BehaviorSubject<readonly Frame[]>([]);

    constructor() { }

    public observe(): Observable<readonly Frame[]> {
        return this.bsFrames.asObservable()
    }

    public addFrame(data: string): void {
        this.bsFrames.next([...this.bsFrames.value, { id: uuid(), data: data}]);
    }

    public removeFrame(id: number): void {
    }

}
