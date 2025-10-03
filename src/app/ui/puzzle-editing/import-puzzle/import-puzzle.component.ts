import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import bsCustomFileInput from 'bs-custom-file-input';
import { NavService } from 'src/app/services/navigation/nav.service';
import { AppTrackData } from 'src/app/services/navigation/tracks/app-track-data';
import { AppService } from '../../general/app.service';
import { PuzzleManagementService } from 'src/app/services/puzzles/puzzle-management.service';
import { Puzzle } from 'src/app/model/puzzle-model/puzzle';

@Component({
  selector: 'app-import-puzzle',
  templateUrl: './import-puzzle.component.html',
  styleUrls: ['./import-puzzle.component.css']
})
export class ImportPuzzleComponent implements OnInit {
    public form: FormGroup;

    private file: File = null;

    constructor(
        private appService: AppService,
        private navService: NavService<AppTrackData>,
        private puzzleService: PuzzleManagementService,
        private formBuilder: FormBuilder,
    ) {}


    public ngOnInit() {

        this.form = this.formBuilder.group({
            file: ["", Validators.required],
        });

        this.appService.clear();
    }

    public ngAfterViewInit() {
        bsCustomFileInput.init();
    }

    public onFileChange(files: FileList) {
        this.appService.clear();

        if (files && files.length) {
            let mimeType = files[0].type;

            if (mimeType.match(/\/json/) === null) {
                this.appService.setAlert("danger", "Only json files can be loaded.");

            } else {
                this.file = files[0];
            }
        }
    }

    public onOpenPdf() {
        this.appService.clear();
        try {
            if (this.file) {
                const reader = new FileReader();

                reader.onload = () => {
                    const puzzles = JSON.parse(reader.result as string);

                    if (Array.isArray(puzzles)) {

                        puzzles.forEach((data: any) => {
                            const puzzle = new Puzzle(data);
                            this.puzzleService.addPuzzle(puzzle);
                        })
                        this.navService.navigate("home");
                    }
                }

                reader.readAsText(this.file, "utf-8");
            }
        } catch (err) {
            this.appService.setAlertError(`An error occurred whilst attempting to import this puzzle`, err);
        }
    }
}
