import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { PuzzleProvider } from 'src/app/model/interfaces';
import { NavService } from 'src/app/services/navigation/nav.service';
import { AppTrackData } from 'src/app/services/navigation/tracks/app-track-data';
import { AppStatus, AppService } from '../../general/app.service';
import { DateTime } from "luxon";

// This page is similar in functionality to the Independent select by date component
// but from a user perspective the Guardian and Independent puzzles are different

const dateFormat = "DD-MM-yyyy";

@Component({
    selector: 'app-guardian',
    templateUrl: './guardian.component.html',
    styleUrls: ['./guardian.component.css']
})
export class GuardianComponent implements OnInit, OnDestroy {
    public appStatus: AppStatus;
    public form: FormGroup;
    public readonly today: Date;
    public daysDisabled: number[] = [];

    private subs: Subscription[] = [];

    constructor(
        private navService: NavService<AppTrackData>,
        private appService: AppService,
        private formBuilder: FormBuilder,
        //private route: ActivatedRoute,
    ) { }

    public ngOnInit() {

        this.form = this.formBuilder.group({
            provider: ["", Validators.required],
            date: [moment().format("DD-MM-yyyy"), Validators.required],
        });

        this.appService.clearAlerts();
        this.subs.push(this.appService.getObservable().subscribe(appStatus => this.appStatus = appStatus));
        this.subs.push(this.form.get("provider").valueChanges.subscribe((provider: PuzzleProvider) => {
            const sun = 0, mon = 1, tue = 2, wed = 3, thu = 4, fri = 5, sat = 6;

            if (provider === "cryptic-pdf") {
                this.daysDisabled = [sat, sun];

            } else if (provider === "prize-pdf") {
                this.daysDisabled = [sun, mon, tue, wed, thu, fri];

            } else if (provider === "everyman") {
                this.daysDisabled = [mon, tue, wed, thu, fri, sat];

            } else {
                this.daysDisabled = [];
            }

            if (this.daysDisabled.includes(moment(this.form.value.date, dateFormat).day())) {
                this.form.patchValue({ date: moment(this.getLatestValidDate(provider)).format(dateFormat) });
            }

        }));
    }

    public ngOnDestroy() {
        this.subs.forEach(sub => sub.unsubscribe());
    }

    public openPuzzleByDate() {
        const date = moment(this.form.value.date, dateFormat).toDate();
        const provider = this.form.value.provider;

        this.appService.clear();
        this.appService.setOpenPuzzleParams({ 
            provider,
            date
        });
        this.navService.beginTrack("createArchiveTrack", {}, "open-puzzle");
    }

    private getLatestValidDate(provider: string): Date {
        const saturday = 6;
        const sunday = 7;

        let day = DateTime.now();

        if (provider === "prize-pdf") {
            while (day.weekday !== saturday) {
                day = day.minus({ days: 1 });
            }

        } else if (provider === "cryptic-pdf") {
            while ([saturday, sunday].includes(day.weekday)) {
                day = day.minus({ days: 1 });
            }

        } else if (provider === "everyman-pdf") {
            while (day.weekday !== sunday) {
                day = day.minus({ days: 1 });
            }
        }

        return day.toJSDate();
    }
}