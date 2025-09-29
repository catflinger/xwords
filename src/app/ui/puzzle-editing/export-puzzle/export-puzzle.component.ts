import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Puzzle } from 'src/app/model/puzzle-model/puzzle';
import { NavService } from 'src/app/services/navigation/nav.service';
import { AppTrackData } from 'src/app/services/navigation/tracks/app-track-data';
import { IActivePuzzle } from 'src/app/services/puzzles/puzzle-management.service';
import { AppService } from '../../general/app.service';

@Component({
    selector: 'app-export-puzzle',
    templateUrl: './export-puzzle.component.html',
    styleUrls: ['./export-puzzle.component.css']
})
export class ExportPuzzleComponent implements OnInit {
    public puzzle: Puzzle = null;
    public form: FormGroup;

    public dataUrl: string;
    public filename: string;

    private subs: Subscription[] = [];

    constructor(
        private navService: NavService<AppTrackData>,
        private appService: AppService,
        private activePuzzle: IActivePuzzle,
        private formBuilder: FormBuilder,
        private detRef: ChangeDetectorRef,
    ) { }

    public ngOnInit() {

        this.form = this.formBuilder.group({
            filename: [
                this.appService.recentlyUsed.downloadFilename, 
                [
                    Validators.required, 
                    Validators.pattern(/^[ a-z0-9-]+$/i)
                ]
            ],
        });

        if (!this.activePuzzle.hasPuzzle) {
            this.navService.goHome();
        } else {
            this.subs.push(
                this.activePuzzle.observe().subscribe(
                    (puzzle) => {
                        if (puzzle) {
                            if (!puzzle.grid) {
                                this.navService.goHome();
                            }
                            this.form.patchValue({filename: this.makeFilename(puzzle.info.title)});
                        }
                        this.puzzle = puzzle;
                        this.detRef.detectChanges();
                    }
                )
            );
        }
    }

    public ngOnDestroy() {
        this.subs.forEach(sub => sub.unsubscribe());
    }

    public onClose() {
        this.appService.clear();
        this.navService.navigate("back");
    }

    public onDownload() {
        this.appService.clear();

        this.filename = this.form.value
        this.dataUrl = "data:text/json," + encodeURI(JSON.stringify(this.puzzle, null, 2));

        setTimeout(
            () => {
                this.downloadFile(this.dataUrl, this.form.value.filename);
                this.appService.setAlert("info", `The puzzle has been exported.  Look in your to your browser's downloads folder.`);
            },
            250
        );
    }

    private downloadFile(url: string, fileName: string): void {
        const downloadLink = document.createElement('a');
        downloadLink.download = fileName + ".json";
        downloadLink.href = url;
        downloadLink.click();
        this.puzzle = null;
     }

     private makeFilename(title: string): string {
        return title.replace(/,+/, "")
            .replace(/[^ 0-9a-z-]/gi, "-")
            .replace(/-{2,}/g, "-");
     }
}
