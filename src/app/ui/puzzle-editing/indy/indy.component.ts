import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AppStatus, AppService } from 'src/app/ui/general/app.service';
import { PuzzleProvider } from 'src/app/model/interfaces';
import { NavService } from '../../../services/navigation/nav.service';
import { AppTrackData } from '../../../services/navigation/tracks/app-track-data';
import { DateTime, WeekdayNumbers } from "luxon";

const Sunday = 7;

// This page is similar in functionality to the Guardian select by date component
// but from a user perspective the Guardian and Independent puzzles are different

@Component({
    selector: 'app-indy',
    templateUrl: './indy.component.html',
    styleUrls: ['./indy.component.css']
  })
  export class IndyComponent implements OnInit, OnDestroy {
    public appStatus: AppStatus;
    public form: FormGroup;
    public provider: PuzzleProvider;
    public today: Date;

    private subs: Subscription[] = [];

    constructor(
        private navService: NavService<AppTrackData>,
        private appService: AppService,
        private formBuilder: FormBuilder,
    ) {
        this.provider = DateTime.now().weekday === Sunday ? "ios" : "independent";
        this.today = new Date();
    }

    public ngOnInit() {

        this.form = this.formBuilder.group({
            date: ["", Validators.required], 
        });

        this.appService.clearAlerts();
        this.subs.push(this.appService.getObservable().subscribe(appStatus => this.appStatus = appStatus));
    }

    public ngOnDestroy() {
        this.subs.forEach(sub => sub.unsubscribe());
    }

    public openLatest() {
        this.openPuzzle(this.provider, this.today);
    }

    public openPuzzleByDate() {
        const date = DateTime.fromJSDate(this.form.value.date);
        const provider = date.weekday === Sunday ? "ios" : "independent";
        this.openPuzzle(provider, date.toJSDate());
    }

    private openPuzzle(provider: PuzzleProvider, date: Date) {
        this.appService.clear();
        this.appService.setOpenPuzzleParams({ provider, date});
        this.navService.beginTrack("createPdfTrack", {}, "open-puzzle");
    }
}

