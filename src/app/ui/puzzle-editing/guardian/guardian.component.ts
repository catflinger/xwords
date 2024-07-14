import { Component, OnInit } from '@angular/core';
import { NavService } from 'src/app/services/navigation/nav.service';
import { AppTrackData } from 'src/app/services/navigation/tracks/app-track-data';

@Component({
    selector: 'app-guardian',
    templateUrl: './guardian.component.html',
    styleUrls: ['./guardian.component.css']
})
export class GuardianComponent implements OnInit {

    constructor(
        private navService: NavService<AppTrackData>,
    ) { }

    ngOnInit(): void {
    }

    public onPdf() {
        this.navService.beginTrack("createPdfTrack", {});
    }


}
