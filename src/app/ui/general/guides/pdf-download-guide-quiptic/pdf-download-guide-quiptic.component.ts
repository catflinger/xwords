import { Component, OnInit } from '@angular/core';
import { NavService } from 'src/app/services/navigation/nav.service';
import { AppTrackData } from 'src/app/services/navigation/tracks/app-track-data';

@Component({
  selector: 'app-pdf-download-guide-quiptic',
  templateUrl: './pdf-download-guide-quiptic.component.html',
  styleUrls: ['./pdf-download-guide-quiptic.component.css']
})
export class PdfDownloadGuideQuipticComponent implements OnInit {
    constructor(
        private navService: NavService<AppTrackData>,
    ) { }

    ngOnInit(): void {
    }

    public onPdf() {
        this.navService.beginTrack("createPdfTrack", {});
    }
}