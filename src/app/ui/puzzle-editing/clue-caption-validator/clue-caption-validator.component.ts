import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { Puzzle } from 'src/app/model/puzzle-model/puzzle';
import { FixClue } from 'src/app/modifiers/clue-modifiers/fix-clue';
import { SetGridReferences } from 'src/app/modifiers/clue-modifiers/set-grid-references';
import { PuzzleModifier } from 'src/app/modifiers/puzzle-modifier';
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
    public ignore: EventEmitter<void> = new EventEmitter<void>();

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

    public onSuggestion(item) {
        this.activePuzzle.updateAndCommit(new FixClue([item]), new SetGridReferences());
    }

    public onIgnore() {
        this.ignore.emit();
    }

    public onFixAll() {
        this.activePuzzle.updateAndCommit(new FixClue(this.suggestions), new SetGridReferences());
    }

    private Refresh() {
        if (this.puzzle && this.puzzle.info.provider === "ft") {
            this.suggestions = this.validationService.findSuspiciousClues(this.puzzle);
        } else {
            this.suggestions = [];
        }

        this.detRef.detectChanges();
}
}
