import { Component, OnInit } from '@angular/core';
import { NavService } from 'src/app/services/navigation/nav.service';
import { AppTrackData } from 'src/app/services/navigation/tracks/app-track-data';
import { AppService } from '../../app.service';
import { IActivePuzzle } from 'src/app/services/puzzles/puzzle-management.service';

@Component({
    selector: 'app-pdf-download-guide',
    templateUrl: './pdf-download-guide.component.html',
    styleUrls: ['./pdf-download-guide.component.css']
})
export class PdfDownloadGuideComponent implements OnInit {

    constructor(
        private navService: NavService<AppTrackData>,
        private appService: AppService,
        private activePuzzle: IActivePuzzle
    ) { }

    ngOnInit(): void {
    }

    public onLoadPDF() {
        this.activePuzzle.clear();
        this.appService.clear();
        this.appService.setOpenPuzzleParams({
            provider: "pdf",
        });
        this.navService.beginTrack("createPdfTrack", {});
    }

}
