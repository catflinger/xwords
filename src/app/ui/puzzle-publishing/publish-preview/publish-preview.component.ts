import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { NavService } from 'src/app/services/navigation/nav.service';
import { AppTrackData } from 'src/app/services/navigation/tracks/app-track-data';
import { IActivePuzzle } from 'src/app/services/puzzles/puzzle-management.service';
import { AppService } from '../../general/app.service';
import { ListLayout } from 'src/app/services/content-generator/list-layout';
import { TableLayout } from 'src/app/services/content-generator/table-layout';
import { Subscription } from 'rxjs';
import { Puzzle } from 'src/app/model/puzzle-model/puzzle';

@Component({
    selector: 'app-publish-preview',
    templateUrl: './publish-preview.component.html',
    styleUrls: ['./publish-preview.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublishPreviewComponent implements OnInit, OnDestroy {
    public content: string = null;
    public puzzle: Puzzle = null;

    private subs: Subscription[] = [];

    constructor(
        private appService: AppService,
        private navService: NavService<AppTrackData>,
        private activePuzzle: IActivePuzzle,
        private listLayout: ListLayout,
        private tableLayout: TableLayout,
        private changeRef: ChangeDetectorRef,
    ) { }

    ngOnInit() {
        window.scrollTo(0, 0);

        if (!this.activePuzzle.hasPuzzle) {
            this.navService.goHome();

        } else {
            this.subs.push(
                this.activePuzzle.observe().subscribe(puzzle => {

                    this.puzzle = puzzle;

                    if (puzzle) {
                        const generator = puzzle.publishOptions.layout === "table" ? this.tableLayout : this.listLayout;
                        this.content = generator.getContent(puzzle, null);
                    }

                    this.changeRef.detectChanges();
                })
            );
        }
    }

    public ngOnDestroy() {
        this.subs.forEach(sub => sub.unsubscribe());
    }

    public onClose() {
        this.navService.navigate("continue");
    }

    public onContentGenerated(content: string) {
        this.content = content;
    }

    public onCopyText() {
        navigator.clipboard.writeText(this.content);
        this.appService.setAlert("info", "The text has been copied to the clipboard.  You can paste this into the HTML editor on fifteensquared.net");
    }

    public onSaveGrid() {
        this.navService.navigate("image");
    }

}
