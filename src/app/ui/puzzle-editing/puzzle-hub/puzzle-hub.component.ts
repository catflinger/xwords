import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { NavService } from 'src/app/services/navigation/nav.service';
import { AppTrackData } from 'src/app/services/navigation/tracks/app-track-data';
import { IActivePuzzle } from 'src/app/services/puzzles/puzzle-management.service';
import { Puzzle } from 'src/app/model/puzzle-model/puzzle';
import { UpdateInfo } from 'src/app/modifiers/puzzle-modifiers/update-info';
import { Clue } from 'src/app/model/puzzle-model/clue';
import { DeleteGrid } from 'src/app/modifiers/grid-modifiers/delete-grid';
import { DeleteClues } from 'src/app/modifiers/clue-modifiers/delete-clues';
import { SelectClue } from 'src/app/modifiers/clue-modifiers/select-clue';
import { GridCell } from 'src/app/model/puzzle-model/grid-cell';
import { SelectClueByCell } from 'src/app/modifiers/clue-modifiers/select-clue-by-cell';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent } from '../../general/confirm-modal/confirm-modal.component';
import { AppService } from '../../general/app.service';

@Component({
    selector: 'app-puzzle-hub',
    templateUrl: './puzzle-hub.component.html',
    styleUrls: ['./puzzle-hub.component.css'],
    changeDetection:ChangeDetectionStrategy.OnPush,
})
export class PuzzleHubComponent implements OnInit, OnDestroy {
    private subs: Subscription[] = [];

    public puzzle: Puzzle = null;

    constructor(
        private appService: AppService,
        private modalService: NgbModal,
        private navService: NavService<AppTrackData>,
        private activePuzzle: IActivePuzzle,
        private detRef: ChangeDetectorRef,
    ) { }

    public ngOnInit() {

        if (!this.activePuzzle.hasPuzzle) {
            this.navService.goHome();
        } else {
            this.subs.push(
                this.activePuzzle.observe().subscribe(
                    (puzzle) => {
                        if (puzzle) {
                            this.puzzle = puzzle;
                        }
                        this.detRef.detectChanges();
                    }
                ));
        }
    }

    public ngOnDestroy() {
        this.subs.forEach(sub => sub.unsubscribe());
    }

    public get acrossClues(): Clue[] {
        return this.puzzle.clues.filter(c => c.group === "across");
    }
    public get downClues(): Clue[] {
        return this.puzzle.clues.filter(c => c.group === "down");
    }

    public onRowClick(clueId: string) {
        this.appService.clear();
        this.activePuzzle.update(new SelectClue(clueId));
    }

    public onCellClick(cell: GridCell) {
        this.appService.clear();
        if (cell) {
            this.activePuzzle.update(new SelectClueByCell(cell.id));
        }
    }

    public onEditInfo() {
        this.appService.clear();
        this.navService.navigate("edit-info");
    }

    public onEditClues() {
        this.appService.clear();
        this.navService.navigate("edit-clues");
    }

    public onDeleteClues() {
        this.appService.clear();
        this.activePuzzle.updateAndCommit(new DeleteClues());
    }

    public onReloadClues() {
        this.appService.clear();
        let lengthDialog = this.modalService.open(ConfirmModalComponent);
        lengthDialog.componentInstance.message = "Warning: the current answers and annotations will be lost. Do you wish to Continue?";
        lengthDialog.result.then(cancel => {
            if (!cancel) {
                this.navService.navigate("reload-clues");
            }
        });

    }

    public onDeleteGrid() {
        this.appService.clear();
        this.activePuzzle.updateAndCommit(new DeleteGrid());
    }

    public onEditGrid() {
        this.appService.clear();
        this.navService.navigate("edit-grid");
    }

    public onAddGrid() {
        this.appService.clear();
        this.navService.navigate("add-grid");
    }

    public onAddCluesGrid() {
        this.appService.clear();
        this.navService.navigate("add-clues-grid");
    }

    public onAddCluesText() {
        this.appService.clear();
        this.navService.navigate("add-clues-text");
    }

    public onAddCluesManual() {
        this.appService.clear();
        this.navService.navigate("add-clues-manual");
    }

    public onMarkFinished() {
        this.appService.clear();
        this.activePuzzle.updateAndCommit(new UpdateInfo({
            ready: true,
        }));
        this.navService.goHome();
    }

    public onClose() {
        this.appService.clear();
        this.navService.goHome();
    }
}
