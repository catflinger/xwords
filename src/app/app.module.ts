import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

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
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
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
    AppComponent,
    HomeComponent,
    WordpressIdPipe,
    ClueDialogComponent,
    SolverComponent,
    BloggerComponent,
    ClueEditorControlComponent,
    ClueTextControlComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    QuillModule.forRoot(quillGlobalConfig),

  ],
  providers: [
    HttpClient,
    PuzzleManagementService,
    {provide: IPuzzleManager, useExisting: PuzzleManagementService},
    {provide: IActivePuzzle, useExisting: PuzzleManagementService},
    {provide: NAV_TRACKS, useValue: tracks},
    {provide: NAV_PROCESSOR, useClass: UIProcessService},
  ],
  entryComponents: [
    ClueAnnotatorFormComponent,
    ConfirmModalComponent,
    EditClueFormComponent,
],
  bootstrap: [AppComponent]
})
export class AppModule { }
