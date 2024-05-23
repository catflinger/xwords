import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { IActivePuzzle } from 'src/app/services/puzzles/puzzle-management.service';

@Component({
  selector: 'app-puzzle-scratchpad',
  templateUrl: './scratchpad.component.html',
  styleUrls: ['./scratchpad.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScratchpadComponent implements OnInit, OnDestroy {
    private subs: Subscription[] = [];

    public hideSuggestions = false;

    constructor(
        private activePuzzle: IActivePuzzle,
        private detRef: ChangeDetectorRef,
    ) { }

    ngOnInit() {
    }

    ngOnDestroy() {
        this.subs.forEach(s => s.unsubscribe())
    }

    public onIgnoreSuggestions() {
        this.hideSuggestions = true;
    }

}
