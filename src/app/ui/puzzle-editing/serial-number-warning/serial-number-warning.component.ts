import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Puzzle } from 'src/app/model/puzzle-model/puzzle';
import { NavService } from 'src/app/services/navigation/nav.service';
import { AppTrackData } from 'src/app/services/navigation/tracks/app-track-data';
import { IActivePuzzle } from 'src/app/services/puzzles/puzzle-management.service';

@Component({
  selector: 'app-serial-number-warning',
  templateUrl: './serial-number-warning.component.html',
  styleUrls: ['./serial-number-warning.component.css']
})
export class SerialNumberWarningComponent implements OnInit, OnDestroy {
    private subs: Subscription[] = [];

    public puzzle: Puzzle = null;

    constructor(
        private navService: NavService<AppTrackData>,
        private activePuzzle: IActivePuzzle,
    ) { }

        public ngOnInit() {
    
            if (!this.activePuzzle.hasPuzzle) {
                this.navService.goHome();
            } else {
                this.subs.push(
                    this.activePuzzle.observe().subscribe(puzzle => this.puzzle = puzzle));
            }
        }

        public ngOnDestroy(){
            this.subs.forEach(sub => sub.unsubscribe());
        }

        public onContinue() {
            this.navService.navigate("ok");
        }

        public onCancel() {
            this.navService.navigate("cancel");
        }
}