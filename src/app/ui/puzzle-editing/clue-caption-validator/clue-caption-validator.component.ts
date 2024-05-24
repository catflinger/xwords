import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { Puzzle } from 'src/app/model/puzzle-model/puzzle';
import { FixClue } from 'src/app/modifiers/clue-modifiers/fix-clue';
import { SetGridReferences } from 'src/app/modifiers/clue-modifiers/set-grid-references';
import { SortClues } from 'src/app/modifiers/clue-modifiers/sort-clues';
import { PuzzleModifier } from 'src/app/modifiers/puzzle-modifier';
import { Clear } from 'src/app/modifiers/puzzle-modifiers/clear';
import { ClueEditSugestion, ClueNumberValidationService } from 'src/app/services/parsing/validation/clue-number-validation';
import { IActivePuzzle } from 'src/app/services/puzzles/puzzle-management.service';

@Component({
    selector: 'app-clue-caption-validator',
    templateUrl: './clue-caption-validator.component.html',
    styleUrls: ['./clue-caption-validator.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClueCaptionValidatorComponent implements OnInit, OnDestroy {
    private subs: Subscription[] = [];

    @Output()
    public ignore = new EventEmitter<void>();

    @Output()
    public edit = new EventEmitter<ClueEditSugestion>();

    public puzzle: Puzzle = null;
    public suggestions: ReadonlyArray<ClueEditSugestion> = [];

    constructor(
        private activePuzzle: IActivePuzzle,
        private detRef: ChangeDetectorRef,
        private validationService: ClueNumberValidationService
    ) { }

    ngOnInit() {
        if (this.activePuzzle.hasPuzzle) {

            this.subs.push(
                this.activePuzzle.observe().subscribe(
                    (puzzle) => {
                        this.puzzle = puzzle;
                        this.Refresh();
                    }
                ));
        }
    }

    ngOnDestroy() {
        this.subs.forEach(s => s.unsubscribe())
    }

    public onRefresh() {
        this.Refresh();
    }

    public onAccept(item: ClueEditSugestion) {
        this.commitFix([item]);
    }

    public onEdit(item: ClueEditSugestion) {
        this.edit.emit(item);
    }

    public onIgnore() {
        this.ignore.emit();
    }

    public onFixAll() {
        this.commitFix(this.suggestions);
    }

    private Refresh() {
        if (this.puzzle && this.puzzle.info.provider === "ft") {
            this.suggestions = this.validationService.findSuspiciousClues(this.puzzle);
        } else {
            this.suggestions = [];
        }

        this.detRef.detectChanges();
    }

    private commitFix(suggestions: readonly ClueEditSugestion[]) {
        this.activePuzzle.updateAndCommit(
            new FixClue(suggestions),
            new Clear(),
            new SortClues(),
            new SetGridReferences());
    }
}
