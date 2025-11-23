import { Component, OnInit } from '@angular/core';
import { AppService, AppStatus } from '../../general/app.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DateTime } from 'luxon';
import { Subscription } from 'rxjs';
import { NavService } from 'src/app/services/navigation/nav.service';
import { AppTrackData } from 'src/app/services/navigation/tracks/app-track-data';

@Component({
  selector: 'app-mycrossword',
  templateUrl: './mycrossword.component.html',
  styleUrls: ['./mycrossword.component.css']
})
export class MycrosswordComponent implements OnInit {
   public appStatus: AppStatus;
    public form: FormGroup;

    private subs: Subscription[] = [];

    constructor(
        private navService: NavService<AppTrackData>,
        private appService: AppService,
        private formBuilder: FormBuilder,
    ) { }

    public ngOnInit() {

        this.form = this.formBuilder.group({
            id: ["", Validators.required],
        });

        this.appService.clearAlerts();
        this.subs.push(this.appService.getObservable().subscribe(appStatus => this.appStatus = appStatus));
    }

    public ngOnDestroy() {
        this.subs.forEach(sub => sub.unsubscribe());
    }

    public openPuzzleById() {
        const serialNumber = parseInt(this.form.value.id, 10);

        this.appService.clear();
        this.appService.setOpenPuzzleParams({ 
            provider: "mycrossword",
            serialNumber
        });
        this.navService.beginTrack("createArchiveTrack", {}, "open-puzzle");
    }
}