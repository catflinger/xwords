import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Puzzle } from 'src/app/model/puzzle-model/puzzle';
import { NavService } from 'src/app/services/navigation/nav.service';
import { AppTrackData } from 'src/app/services/navigation/tracks/app-track-data';
import { IActivePuzzle } from 'src/app/services/puzzles/puzzle-management.service';
import { AppService } from '../../general/app.service';
import fileDownload from "js-file-download";
import { v4 as uuid } from "uuid";
import { DateTime } from "luxon";

@Component({
    selector: 'app-export-puzzle',
    templateUrl: './export-puzzle.component.html',
    styleUrls: ['./export-puzzle.component.css']
})
export class ExportPuzzleComponent implements OnInit {
    public puzzle: Puzzle = null;
    public form: FormGroup;
    public done = false;

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
        const copy = this.puzzle.getMutableCopy();
        copy.info.id = uuid();
        copy.info.title = this.form.value.filename;

        // put the puzzle into an array to allow forward compatibility with possible multiple import/export in future
        const data = `${JSON.stringify([copy], null, 2)}`;
        const filename = `${this.form.value.filename}.json`;

        fileDownload(data, filename);

        this.appService.setAlert("info", `The puzzle is being exported.  Look in your to your browser's downloads folder.`);
        this.done = true;

        // TO DO: why is angular not picking this change up automatically?
        this.detRef.detectChanges();
    }

     private makeFilename(title: string): string {
        const today = DateTime.now().toFormat("MMM d yyyy");

        return title .concat(` exported on ${today}`)
            .replace(/,+/, "")
            .replace(/[^ 0-9a-z-]/gi, "-")
            .replace(/-{2,}/g, "-");
     }
}


