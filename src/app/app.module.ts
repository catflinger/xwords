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
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgbModule,
  ],
  providers: [
    HttpClient,
    PuzzleManagementService,
    {provide: IPuzzleManager, useExisting: PuzzleManagementService},
    {provide: IActivePuzzle, useExisting: PuzzleManagementService},
    {provide: NAV_TRACKS, useValue: tracks},
    {provide: NAV_PROCESSOR, useClass: UIProcessService},
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
