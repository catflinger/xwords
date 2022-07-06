import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, Input } from '@angular/core';
import { from, Subscription } from 'rxjs';
import { GridCell } from 'src/app/model/puzzle-model/grid-cell';
import { Puzzle } from 'src/app/model/puzzle-model/puzzle';
import { IActivePuzzle } from 'src/app/services/puzzles/puzzle-management.service';
import { Clear } from 'src/app//modifiers/puzzle-modifiers/clear';
import { UpdateCell } from 'src/app//modifiers/grid-modifiers/update-cell';
import { RenumberGid } from 'src/app//modifiers/grid-modifiers/renumber-grid';
//import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { UpdateGridProperties } from 'src/app//modifiers/grid-modifiers/updare-grid-properties';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UpdateInfo } from 'src/app//modifiers/puzzle-modifiers/update-info';
import { GridControlOptions, GridEditors } from '../../common';
import { GridEditor } from '../../grid/grid-editors/grid-editor';
import { GridEditorService } from '../../grid/grid-editors/grid-editor.service';
import { ClearShading } from 'src/app//modifiers/grid-modifiers/clear-shading';
import { AppService } from '../../general/app.service';
import { NavService } from '../../../services/navigation/nav.service';
import { AppTrackData } from '../../../services/navigation/tracks/app-track-data';
import { PuzzleModifier } from 'src/app/modifiers/puzzle-modifier';
import { GridComponent, BarClickEvent, GridTextEvent, GridNavigationEvent } from '../../grid/grid/grid.component';
import { SetGridCaptions } from 'src/app/modifiers/grid-modifiers/set-grid-captions';
import { SelectCellsForEdit } from 'src/app/modifiers/grid-modifiers/select-cells-for-edit';
import { ClearGridCaptions } from 'src/app/modifiers/grid-modifiers/clear-grid-captions';
import { ClearHiddenCells } from 'src/app/modifiers/grid-modifiers/clear-hidden-cells';
import { distinct, filter, map, toArray } from 'rxjs/operators';
import { cssColorNameFromValue} from "../../puzzle-publishing/color-control/colors";

type ToolType = "grid" | "text" | "color" | "properties" | "captions" | "cells";

@Component({
    selector: 'app-grid-editor',
    templateUrl: './grid-editor.component.html',
    styleUrls: ['./grid-editor.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridEditorComponent implements OnInit, OnDestroy {
    public puzzle: Puzzle = null;
    public form: FormGroup;
    public captionForm: FormGroup;
    public symmetrical: boolean = true;
    public numbered: boolean = true;
    public showCaptions: boolean = true;
    public options: GridControlOptions = { editor: GridEditors.cellEditor, showHiddenCells: false };
    public gridEditors = GridEditors;

    public dataUrl: string;
    public filename: string;
    public cssColorNameFromValue = cssColorNameFromValue;

    @ViewChild("downloadLink", { static: false }) downloadLink: ElementRef;
    @ViewChild(GridComponent, { static: false }) gridControl: GridComponent;
    @ViewChild("captionControl", { static: false }) captionControl : ElementRef;

    private subs: Subscription[] = [];
    public tool: ToolType = "grid";
    public colorsUsed: string[] = [];
    
    private gridEditor: GridEditor;

    constructor(
        private navService: NavService<AppTrackData>,
        private appService: AppService,
        private activePuzzle: IActivePuzzle,
        private formBuilder: FormBuilder,
        private gridEditorService: GridEditorService,
        private detRef: ChangeDetectorRef,
    ) { }

    public ngOnInit() {

        this.form = this.formBuilder.group({
            title: ["", Validators.required],
            shadingColor: "#f0f8ff",
        });

        this.captionForm = this.formBuilder.group({
            caption: ["", Validators.maxLength(2)],
        });

        this.gridEditor = this.gridEditorService.getEditor(this.options.editor);

        if (!this.activePuzzle.hasPuzzle) {
            this.navService.goHome();
        } else {
            this.subs.push(
                this.activePuzzle.observe().subscribe(
                    (puzzle) => {
                        if (puzzle) {
                            if (!puzzle.grid) {
                                this.navService.goHome();
                            } else {
                                const selectedCell = puzzle.grid.cells.find(c => c.highlight);
                                this.form.patchValue({title: puzzle.info.title});
                                this.captionForm.patchValue({caption: selectedCell?.caption});
                                this.symmetrical = !!puzzle.grid.properties.symmetrical;
                                this.numbered = puzzle.grid.properties.numbered;
                                this.showCaptions = puzzle.grid.properties.showCaptions;
                                this.puzzle = puzzle;
                                
                                from(puzzle.grid.cells)
                                .pipe(
                                    map(cell => cell.shading),
                                    filter(color => !!color),
                                    distinct(),
                                    toArray()
                                ).subscribe(colors => {
                                    this.colorsUsed = colors;
                                    this.detRef.detectChanges();
                                });
                                
                                this.detRef.detectChanges();

                            }
                        }
                    }
                ));
        }
    }

    public ngOnDestroy() {
        this.subs.forEach(sub => sub.unsubscribe());
    }

    public get barred(): boolean {
        let result = false;

        if (this.puzzle && this.puzzle.grid.properties.style === "barred") {
            result = true;
        }
        return result;
    }

    public onTabChange(event: any) { // any stands for NgbTabChangeEvent, where to import this deprectaed item from??
        this.appService.clear();
        //this.tool = event.nextId as ToolType;
        this.options.showHiddenCells = event.nextId === "cells";
        this.activePuzzle.updateAndCommit(new Clear());
        this.detRef.detectChanges();
    }

    public onContinue() {
        this.appService.clear();
        this.activePuzzle.updateAndCommit(new Clear());
        this.navService.navigate("continue");
    }

    public onNina() {
        this.appService.clear();
        this.activePuzzle.updateAndCommit(new Clear());
        this.navService.navigate("nina");
    }

    public onClone() {
        this.appService.clear();
        this.activePuzzle.cloneAsGrid();
        this.appService.setAlert("info", 'A copy of the grid has been saved under the "Saved Grids" heading on this page');
        this.navService.goHome();
    }

    public onClose() {
        this.appService.clear();
        this.activePuzzle.updateAndCommit(new Clear());
        this.navService.navigate("close");
    }

    public onSubmit() {
        this.appService.clear();
        this.activePuzzle.updateAndCommit(new UpdateInfo({
            title: this.form.value.title
        }));
    }

    public onCaptionSubmit() {
        this.appService.clear();
        this.activePuzzle.updateAndCommit(
            new UpdateCell(
                this.puzzle.grid.cells.find(c => c.highlight)?.id,
                { caption: this.captionForm.value.caption }
            ),
            new Clear(),
        );
    }

    public onClearCaptions() {
        this.appService.clear();
        this.activePuzzle.updateAndCommit(new ClearGridCaptions());
    }

    public onClearHidden() {
        this.appService.clear();
        this.activePuzzle.updateAndCommit(new ClearHiddenCells());
    }

    public onSymmetrical(val: boolean) {
        this.appService.clear();
        this.activePuzzle.updateAndCommit(new UpdateGridProperties({
            symmetrical: val,
        }));
    }

    public onNumbered() {
        // TO DO: Use reactive forms and observe grid properties
        this.appService.clear();
        this.activePuzzle.updateAndCommit(
            new UpdateGridProperties({ numbered: !this.numbered }),
            new RenumberGid(),
            new SetGridCaptions(),
            new Clear(),
        );
    }

    public onShowCaptions() {
        // TO DO: Use reactive forms and observe grid properties
        this.appService.clear();
        this.activePuzzle.updateAndCommit(
            new UpdateGridProperties({ showCaptions: !this.showCaptions }),
        );
    }

    public onCellClick(cell: GridCell) {
        this.appService.clear();
        switch(this.tool) {
            case "grid":
                const symCell = this.getSymCell(cell);
                if (this.puzzle.grid.properties.style === "standard") {
                    const newVal = !cell.light;
                    let mods: PuzzleModifier[] = [new UpdateCell(cell.id, { light: newVal })];

                    if (symCell) {
                        mods.push(new UpdateCell(symCell.id, { light: newVal }));
                    }
                    mods.push(new RenumberGid());
                    mods.push(new SetGridCaptions());

                    this.activePuzzle.updateAndCommit(...mods);
                }
                break;

            case "text":
                if (cell.light) {
                    if (cell.highlight) {
                        // cell is already part of a text edit
                        let updates = this.gridEditor.onGridNavigation(this.puzzle, "absolute", { x: cell.x, y: cell.y});
                        this.activePuzzle.updateAndCommit(...updates);
                    } else {
                        // this is a new edit
                        let updates = this.gridEditor.startEdit(this.puzzle, cell);
                        this.activePuzzle.updateAndCommit(...updates);
                    }

                } else {
                    this.activePuzzle.updateAndCommit(new Clear());
                }
                break;
                
            case "color":
                let color: string = cell.shading && cell.shading === this.form.value.shadingColor ? null : this.form.value.shadingColor;
                if (cell.light) {
                    this.activePuzzle.updateAndCommit(new UpdateCell(cell.id, { shading: color }));
                }
                break;
                        
            case "captions":
                if (!this.numbered) {
                    this.activePuzzle.updateAndCommit(new SelectCellsForEdit([cell]));
                    if (this.captionControl) {
                        this.captionControl.nativeElement.focus();
                    }
                }
                break;
                        
            case "cells":
                let mods: PuzzleModifier[] = [
                    new UpdateCell(cell.id, { 
                        hidden: !cell.hidden,
                        light: cell.hidden,
                        shading: null,
                        content: null,
                        rightBar: false,
                        bottomBar: false,
                    }),
                    new RenumberGid()
                ];

                if (this.puzzle.grid.properties.numbered) {
                    mods.push(new SetGridCaptions());
                }
                
                this.activePuzzle.updateAndCommit(...mods);
                break;

            default:
                // do nothing
                break;
        }
    }

    public onBarClick(event: BarClickEvent) {
        this.appService.clear();
        let updates: PuzzleModifier[] = [];

        if (this.tool === "grid" && this.puzzle.grid.properties.style === "barred") {
            const cell = event.cell;
            let symCell = this.getSymCell(cell);

            if (event.bar === "rightBar") {
                updates.push(new UpdateCell(cell.id, { rightBar: !cell.rightBar }));

                if (symCell && symCell.x > 0) {
                    // sym cell needs to alter the left bar, so use right bar from neighbouring cell
                    symCell = this.puzzle.grid.cellAt(symCell.x - 1, symCell.y);
                    updates.push(new UpdateCell(symCell.id, { rightBar: !cell.rightBar }));
                }
            } else {
                updates.push(new UpdateCell(cell.id, { bottomBar: !cell.bottomBar }));

                if (symCell && symCell.y > 0) {
                    // sym cell needs to alter the top bar, so use bottom bar from cell above
                    symCell = this.puzzle.grid.cellAt(symCell.x, symCell.y - 1);
                    updates.push(new UpdateCell(symCell.id, { bottomBar: !cell.bottomBar }));
                }
            }
            updates.push(new RenumberGid());
            updates.push(new SetGridCaptions());

            this.activePuzzle.updateAndCommit(...updates);
        }
    }

    public onOptionChange() {
        this.appService.clear();

        this.activePuzzle.updateAndCommit(new Clear());
        this.gridEditor = this.gridEditorService.getEditor(this.options.editor);
    }

    public onGridText(event: GridTextEvent) {
        this.appService.clear();

        let updates = this.gridEditor.onGridText(this.puzzle, event.text, event.writingDirection);
        this.activePuzzle.updateAndCommit(...updates);
    }

    public onGridNavigation(event: GridNavigationEvent) {
        this.appService.clear();

        let updates = this.gridEditor.onGridNavigation(this.puzzle, event.navigation);
        this.activePuzzle.updateAndCommit(...updates);
    }

    public onClearAll() {
        this.appService.clear();

        this.activePuzzle.updateAndCommit(new ClearShading());
    }

    public onDownload() {
        this.appService.clear();
        this.activePuzzle.updateAndCommit(new Clear());
        this.navService.navigate("image");
    }

    public onColorUsed(color: string) {
        this.form.patchValue({shadingColor: color});
    }

    private getSymCell(cell: GridCell): GridCell {
        let result: GridCell = null;

        if (this.puzzle.grid.properties.symmetrical) {
            // rotational symmetry

            // TO DO: allow for other types of symmetry
            // use matricies and transformations?

            result = this.puzzle.grid.cellAt(
                this.puzzle.grid.properties.size.across - 1 - cell.x,
                this.puzzle.grid.properties.size.down - 1 - cell.y,
            );
        }

        return result;
    }
}
