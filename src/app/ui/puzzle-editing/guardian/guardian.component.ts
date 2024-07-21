import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { PuzzleProvider } from 'src/app/model/interfaces';
import { NavService } from 'src/app/services/navigation/nav.service';
import { AppTrackData } from 'src/app/services/navigation/tracks/app-track-data';
import { AppStatus, AppService } from '../../general/app.service';
import { ActivatedRoute } from '@angular/router';
import { DateTime } from "luxon";

// TO DO: think about merging this with the very similar Indy select by date component

@Component({
    selector: 'app-guardian',
    templateUrl: './guardian.component.html',
    styleUrls: ['./guardian.component.css']
})
export class GuardianComponent implements OnInit, OnDestroy {
    public appStatus: AppStatus;
    public form: FormGroup;
    public provider: PuzzleProvider;
    public readonly today: Date;
    public latest: Date;
    public daysDisabled: number[] = [];

    private subs: Subscription[] = [];

    constructor(
        private navService: NavService<AppTrackData>,
        private appService: AppService,
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
    ) {
        this.today = new Date();


        this.subs.push(this.route.params.subscribe(params => {
            const sun = 0, mon = 1, tue = 2, wed = 3, thu = 4, fri = 5, sat = 6;

            this.provider = params["provider"];

            if (this.provider === "cryptic") {
                this.daysDisabled = [sat, sun];
            
            } else if (this.provider === "prize") {
                this.daysDisabled = [sun, mon, tue, wed, thu, fri];

            } else if (this.provider === "everyman") {
                this.daysDisabled = [mon, tue, wed, thu, fri, sat];

            } else {
                this.daysDisabled = [];
            }

            this.latest = this.getLatestValidDate(this.provider);
        }));
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
        this.openPuzzle(this.provider, this.latest);
    }

    public openPuzzleByDate() {
        const date = moment(this.form.value.date).toDate();

        this.openPuzzle(this.provider, date);
    }

    private openPuzzle(provider: PuzzleProvider, date: Date) {
        this.appService.clear();
        this.appService.setOpenPuzzleParams({ provider, date, requestPdf: true });
        this.navService.beginTrack("createPdfTrack", {}, "open-puzzle");
    }

    private getLatestValidDate(provider: string): Date {
        const saturday = 6;
        const sunday = 7;

        let day = DateTime.now();

        if (provider === "prize") {
            while(day.weekday !== saturday) {
                day = day.minus({ days: 1});
            }
        
        } else if (provider === "cryptic") {
             while([saturday, sunday].includes(day.weekday)) {
                day = day.minus({ days: 1});
            }

        } else if (provider === "everyman") {
            while(day.weekday !== sunday) {
                day = day.minus({ days: 1});
            }
       }

        return day.toJSDate();
    }
}