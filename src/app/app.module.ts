import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

import { AppRoutingModule } from './app-routing.module';
import { NavTrack } from './services/navigation/interfaces';
import { NAV_TRACKS, NAV_PROCESSOR } from './services/navigation/nav.service';
import { createPdfTrack } from './services/navigation/tracks/create-pdf-track';
import { createPuzzleTrack } from './services/navigation/tracks/create-puzzle-track';
import { editPuzzleTrack } from './services/navigation/tracks/edit-puzzle-track';
import { gridToolTrack } from './services/navigation/tracks/grid-tool-track';
import { parseTrack } from './services/navigation/tracks/parse-track';
import { publishGridTrack } from './services/navigation/tracks/publish-grid-track';
import { publishPostTrack } from './services/navigation/tracks/publish-post-track';
import { solveTrack } from './services/navigation/tracks/solve-track';
import { UIProcessService } from './services/navigation/ui-process.service';
import { IActivePuzzle, IPuzzleManager, PuzzleManagementService } from './services/puzzles/puzzle-management.service';
import { AppComponent } from './ui/app/app.component';
import { HomeComponent } from './ui/general/home/home.component';
import { WordpressIdPipe } from './ui/general/wordpress-id.pipe';
import { ClueDialogComponent } from './ui/puzzle-editing/tabbed-dialogs/clue-dialog/clue-dialog.component';
import { SolverComponent } from './ui/puzzle-solving/solver/solver.component';
import { BloggerComponent } from './ui/puzzle-solving/blogger/blogger.component';
import { ClueAnnotatorFormComponent } from './ui/puzzle-editing/tabbed-dialogs/forms/clue-annotator-form/clue-annotator-form.component';
import { EditClueFormComponent } from './ui/puzzle-editing/tabbed-dialogs/forms/edit-clue-form/edit-clue-form.component';
import { ConfirmModalComponent } from './ui/general/confirm-modal/confirm-modal.component';
import { ClueEditorControlComponent } from './ui/puzzle-editing/tabbed-dialogs/editors/clue-editor-control/clue-editor-control.component';
import { ClueTextControlComponent } from './ui/clues/clue-text-control/clue-text-control.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { RemoveClueFormComponent } from './ui/puzzle-editing/tabbed-dialogs/forms/remove-clue-form/remove-clue-form.component';
import { InfoPanelComponent } from './ui/general/guides/info-panel/info-panel.component';
import { ClueTextChunkComponent } from './ui/clues/clue-text-chunk/clue-text-chunk.component';
import { TipComponent } from './ui/general/guides/tip/tip.component';
import { TipInstanceFactory } from './ui/general/guides/tip/tip-instance';
import { SettingsComponent } from './ui/general/settings/settings.component';
import { AlertComponent } from './ui/general/guides/alert/alert.component';
import { PuzzleInfoFormComponent } from './ui/puzzle-editing/tabbed-dialogs/forms/puzzle-info-form/puzzle-info-form.component';
import { AddClueFormComponent } from './ui/puzzle-editing/tabbed-dialogs/forms/add-clue-form/add-clue-form.component';
import { PublishOptionsFormComponent } from './ui/puzzle-editing/tabbed-dialogs/forms/publish-options-form/publish-options-form.component';
import { CheatFormComponent } from './ui/puzzle-editing/tabbed-dialogs/forms/cheat-form/cheat-form.component';
import { ClueTextComponent } from './ui/clues/clue-text/clue-text.component';
import { GridComponent } from './ui/grid/grid/grid.component';
import { ClueListComponent } from './ui/clues/clue-list/clue-list.component';
import { ClueListItemComponent } from './ui/clues/clue-list-item/clue-list-item.component';
import { GridFormComponent } from './ui/puzzle-editing/tabbed-dialogs/forms/grid-form/grid-form.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PuzzleDialogComponent } from './ui/puzzle-editing/tabbed-dialogs/puzzle-dialog/puzzle-dialog.component';
import { JigsawCluesViewComponent } from './ui/puzzle-solving/jigsaw/jigsaw-clues-view/jigsaw-clues-view.component';
import { JigsawGridViewComponent } from './ui/puzzle-solving/jigsaw/jigsaw-grid-view/jigsaw-grid-view.component';
import { PublishComponent } from './ui/puzzle-publishing/publish/publish.component';
import { ContentPreviewComponent } from './ui/puzzle-publishing/content-preview/content-preview.component';
import { HtmlAsIsPipe } from './ui/general/html-as-is.pipe';
import { ProviderPipe } from './ui/general/provider.pipe';
import { PublishOptionsComponent } from './ui/puzzle-publishing/publish-options/publish-options.component';
import { PublishCompleteComponent } from './ui/puzzle-publishing/publish-complete/publish-complete.component';
import { PublishPreambleComponent } from './ui/puzzle-publishing/publish-preamble/publish-preamble.component';
import { TextStyleComponent } from './ui/puzzle-publishing/text-style/text-style.component';
import { ValidationMessageComponent } from './ui/general/validation-message/validation-message.component';
import { LoginComponent } from './ui/general/login/login.component';
import { LoginControlComponent } from './ui/general/login-control/login-control.component';
import { ArchiveComponent } from './ui/puzzle-editing/archive/archive.component';
import { PublishGridComponent } from './ui/puzzle-publishing/publish-grid/publish-grid.component';
import { ColorControlComponent } from './ui/puzzle-publishing/color-control/color-control.component';
import { PublishLoginComponent } from './ui/puzzle-publishing/publish-login/publish-login.component';
import { OpenPuzzleComponent } from './ui/puzzle-editing/open-puzzle/open-puzzle.component';
import { IndyComponent } from './ui/puzzle-editing/indy/indy.component';
import { GridEditorComponent } from './ui/puzzle-editing/grid-editor/grid-editor.component';
import { GridStartComponent } from './ui/puzzle-editing/grid-start/grid-start.component';
import { SpecialComponent } from './ui/puzzle-editing/special/special.component';
import { SpecialPdfComponent } from './ui/puzzle-editing/special-pdf/special-pdf.component';
import { SpecialTextComponent } from './ui/puzzle-editing/special-text/special-text.component';
import { SpecialLoginComponent } from './ui/puzzle-editing/special-login/special-login.component';
import { ParseResultComponent } from './ui/puzzle-editing/parse-result/parse-result.component';
import { ParseErrorHintComponent } from './ui/general/guides/parse-error-hint/parse-error-hint.component';
import { CreatePuzzleComponent } from './ui/puzzle-editing/create-puzzle/create-puzzle.component';
import { CluesEditorComponent } from './ui/puzzle-editing/clues-editor/clues-editor.component';
import { ValidatePuzzleComponent } from './ui/puzzle-editing/validate-puzzle/validate-puzzle.component';
import { CluesStartComponent } from './ui/puzzle-editing/clues-start/clues-start.component';
import { LinkErrorComponent } from './ui/puzzle-editing/link-error/link-error.component';
import { NavErrorComponent } from './ui/puzzle-editing/nav-error/nav-error.component';
import { BackupComponent } from './ui/backup/backup/backup.component';
import { BackupsComponent } from './ui/backup/backups/backups.component';
import { BackupSettingsComponent } from './ui/backup/backup-settings/backup-settings.component';
import { BackupOptionsComponent } from './ui/backup/backup-options/backup-options.component';
import { PuzzleHubComponent } from './ui/puzzle-editing/puzzle-hub/puzzle-hub.component';
import { ClueEditListComponent } from './ui/clues/clue-edit-list/clue-edit-list.component';
import { PuzzleInfoComponent } from './ui/puzzle-editing/puzzle-info/puzzle-info.component';
import { PublishPreviewComponent } from './ui/puzzle-publishing/publish-preview/publish-preview.component';
import { NinaFinderComponent } from './ui/puzzle-publishing/nina-finder/nina-finder.component';
import { GridImageComponent } from './ui/puzzle-editing/grid-image/grid-image.component';
import { ProvisionOptionsControlComponent } from './ui/puzzle-editing/provision-options-control/provision-options-control.component';
import { ProvisionOptionsEditorComponent } from './ui/puzzle-editing/tabbed-dialogs/editors/provision-options-editor/provision-options-editor.component';
import { GridFillerComponent } from './ui/puzzle-solving/jigsaw/grid-filler/grid-filler.component';
import { GridViewComponent } from './ui/grid/grid-view/grid-view.component';
import { CluesViewComponent } from './ui/clues/clues-view/clues-view.component';
import { GridExplorerComponent } from './ui/grid/grid-explorer/grid-explorer.component';
import { ScratchpadComponent } from './ui/development/scratchpad/scratchpad.component';
import { ClueCaptionValidatorComponent } from './ui/puzzle-editing/clue-caption-validator/clue-caption-validator.component';

const quillGlobalConfig = {
    modules: {
        toolbar: [
            ['bold', 'italic', 'underline'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'font': [] }],
            ['link']
        ]
    }
};

const tracks: ReadonlyArray<NavTrack> = [
    createPuzzleTrack,
    createPdfTrack,
    parseTrack,
    gridToolTrack,
    solveTrack,
    editPuzzleTrack,
    publishPostTrack,
    publishGridTrack,
];

@NgModule({
  declarations: [
    AddClueFormComponent,
    AddClueFormComponent,
    AppComponent,
    AlertComponent,
    AddClueFormComponent,
    ArchiveComponent,

    BloggerComponent,
    BackupComponent,
    BackupsComponent,
    BackupSettingsComponent,
    BackupOptionsComponent,

    ClueDialogComponent,
    ClueEditorControlComponent,
    ClueTextControlComponent,
    ClueTextChunkComponent,
    ClueAnnotatorFormComponent,
    ClueTextComponent,
    ClueListComponent,
    ClueListItemComponent,
    CluesEditorComponent,
    CluesStartComponent,
    ClueEditListComponent,
    CluesViewComponent,

    CheatFormComponent,
    ContentPreviewComponent,
    ColorControlComponent,
    ConfirmModalComponent,
    CreatePuzzleComponent,

    EditClueFormComponent,

    GridComponent,
    GridFormComponent,
    GridEditorComponent,
    GridStartComponent,
    GridImageComponent,
    GridFillerComponent,
    GridViewComponent,

    HomeComponent,
    HtmlAsIsPipe,

    InfoPanelComponent,
    IndyComponent,

    JigsawCluesViewComponent,
    JigsawGridViewComponent,

    LoginComponent,
    LoginControlComponent,
    LinkErrorComponent,

    NavErrorComponent,
    NinaFinderComponent,

    OpenPuzzleComponent,

    ParseResultComponent,
    ParseErrorHintComponent,

    PublishComponent,
    PublishOptionsComponent,
    PublishOptionsFormComponent,
    PublishCompleteComponent,
    PublishPreambleComponent,
    PublishGridComponent,
    PublishLoginComponent,
    PublishPreviewComponent,
    
    PuzzleInfoComponent,
    PuzzleInfoFormComponent,
    PuzzleHubComponent,
    PuzzleDialogComponent,
    PuzzleInfoFormComponent,

    ProviderPipe,
    ProvisionOptionsControlComponent,
    ProvisionOptionsEditorComponent,

    RemoveClueFormComponent,

    SettingsComponent,
    SolverComponent,
    SpecialComponent,
    SpecialPdfComponent,
    SpecialTextComponent,
    SpecialLoginComponent,

    TipComponent,
    TextStyleComponent,

    ValidationMessageComponent,
    ValidatePuzzleComponent,

    WordpressIdPipe,
    GridExplorerComponent,

     ScratchpadComponent,
       ClueCaptionValidatorComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    QuillModule.forRoot(quillGlobalConfig),
    BrowserAnimationsModule,
    BsDatepickerModule,
  ],
  providers: [
    HttpClient,
    PuzzleManagementService,
    {provide: IPuzzleManager, useExisting: PuzzleManagementService},
    {provide: IActivePuzzle, useExisting: PuzzleManagementService},
    {provide: NAV_TRACKS, useValue: tracks},
    {provide: NAV_PROCESSOR, useClass: UIProcessService},
    TipInstanceFactory,
  ],
  entryComponents: [
    ClueAnnotatorFormComponent,
    ConfirmModalComponent,
    EditClueFormComponent,
],
  bootstrap: [AppComponent]
})
export class AppModule { }
