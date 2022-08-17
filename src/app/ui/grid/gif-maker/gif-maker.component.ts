import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { NavService } from 'src/app/services/navigation/nav.service';
import { AppTrackData } from 'src/app/services/navigation/tracks/app-track-data';
import { IActivePuzzle } from 'src/app/services/puzzles/puzzle-management.service';
import { Frame } from 'src/app/services/storage/frame';
import { FrameStoreService } from 'src/app/services/storage/frame-store.service';
import { AppService } from '../../general/app.service';

@Component({
    selector: 'app-gif-maker',
    templateUrl: './gif-maker.component.html',
    styleUrls: ['./gif-maker.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GifMakerComponent implements OnInit {
    private subs: Subscription[] = [];

    public frames: readonly Frame[] = [];

    constructor(
        private appService: AppService,
        private navService: NavService<AppTrackData>,
        private frameStore: FrameStoreService,
        private detRef: ChangeDetectorRef,
    ) { }

    public ngOnInit() {

            this.subs.push(
                this.frameStore.observe().subscribe(frames => {
                    this.frames = frames;
                    this.detRef.detectChanges();
                })
            );
    }

    public ngOnDestroy() {
        this.subs.forEach(sub => sub.unsubscribe());
    }

    public onBack() {
        this.appService.clear();
        this.navService.navigate("back");
    }

}
