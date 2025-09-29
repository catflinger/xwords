import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './ui/general/home/home.component';
import { LoginComponent } from './ui/general/login/login.component';
import { SettingsComponent } from './ui/general/settings/settings.component';
import { ArchiveComponent } from './ui/puzzle-editing/archive/archive.component';
import { CluesEditorComponent } from './ui/puzzle-editing/clues-editor/clues-editor.component';
import { CluesStartComponent } from './ui/puzzle-editing/clues-start/clues-start.component';
import { CreatePuzzleComponent } from './ui/puzzle-editing/create-puzzle/create-puzzle.component';
import { GridEditorComponent } from './ui/puzzle-editing/grid-editor/grid-editor.component';
import { GridImageComponent } from './ui/puzzle-editing/grid-image/grid-image.component';
import { GridStartComponent } from './ui/puzzle-editing/grid-start/grid-start.component';
import { IndyComponent } from './ui/puzzle-editing/indy/indy.component';
import { LinkErrorComponent } from './ui/puzzle-editing/link-error/link-error.component';
import { NavErrorComponent } from './ui/puzzle-editing/nav-error/nav-error.component';
import { OpenPuzzleComponent } from './ui/puzzle-editing/open-puzzle/open-puzzle.component';
import { PuzzleHubComponent } from './ui/puzzle-editing/puzzle-hub/puzzle-hub.component';
import { PuzzleInfoComponent } from './ui/puzzle-editing/puzzle-info/puzzle-info.component';
import { SpecialLoginComponent } from './ui/puzzle-editing/special-login/special-login.component';
import { SpecialPdfComponent } from './ui/puzzle-editing/special-pdf/special-pdf.component';
import { SpecialTextComponent } from './ui/puzzle-editing/special-text/special-text.component';
import { SpecialComponent } from './ui/puzzle-editing/special/special.component';
import { NinaFinderComponent } from './ui/puzzle-publishing/nina-finder/nina-finder.component';
import { PublishCompleteComponent } from './ui/puzzle-publishing/publish-complete/publish-complete.component';
import { PublishGridComponent } from './ui/puzzle-publishing/publish-grid/publish-grid.component';
import { PublishLoginComponent } from './ui/puzzle-publishing/publish-login/publish-login.component';
import { PublishOptionsComponent } from './ui/puzzle-publishing/publish-options/publish-options.component';
import { PublishPreambleComponent } from './ui/puzzle-publishing/publish-preamble/publish-preamble.component';
import { PublishPreviewComponent } from './ui/puzzle-publishing/publish-preview/publish-preview.component';
import { PublishComponent } from './ui/puzzle-publishing/publish/publish.component';
import { BloggerComponent } from './ui/puzzle-solving/blogger/blogger.component';
import { GridFillerComponent } from './ui/puzzle-solving/jigsaw/grid-filler/grid-filler.component';
import { SolverComponent } from './ui/puzzle-solving/solver/solver.component';
import { ScratchpadComponent } from './ui/development/scratchpad/scratchpad.component';
import { GuardianComponent } from './ui/puzzle-editing/guardian/guardian.component';
import { PdfDownloadGuideAzedComponent } from './ui/general/guides/pdf-download-guide-azed/pdf-download-guide-azed.component';
import { PdfDownloadGuideQuipticComponent } from './ui/general/guides/pdf-download-guide-quiptic/pdf-download-guide-quiptic.component';
import { PdfDownloadGuideComponent } from './ui/general/guides/pdf-download-guide/pdf-download-guide.component';
import { SerialNumberWarningComponent } from './ui/puzzle-editing/serial-number-warning/serial-number-warning.component';


const routes: Routes = [

    // landing pages
    { path: "home", component: HomeComponent },
    { path: "login", component: LoginComponent },

    // solving and blogging puzzles
    { path: "solver", component: SolverComponent },
    { path: "blogger", component: BloggerComponent },
    { path: "jigsaw", component: GridFillerComponent },

    // publishing puzzles
    { path: "publish-options", component: PublishOptionsComponent },
    { path: "publish-grid", component: PublishGridComponent },
    { path: "publish-preamble", component: PublishPreambleComponent },
    { path: "publish-preview", component: PublishPreviewComponent },
    { path: "publish-login", component: PublishLoginComponent },
    { path: "publish", component: PublishComponent },
    { path: "publish-complete", component: PublishCompleteComponent },

    // creating and editing puzzles and grids
    { path: "archive/:provider", component: ArchiveComponent },
    { path: "indy", component: IndyComponent },
    { path: "guardian", component: GuardianComponent },
    { path: "special", component: SpecialComponent },
    { path: "special-pdf", component: SpecialPdfComponent },
    { path: "special-login", component: SpecialLoginComponent },
    { path: "puzzle-hub", component: PuzzleHubComponent },
    { path: "open-puzzle", component: OpenPuzzleComponent },
    { path: "serial-number-warning", component: SerialNumberWarningComponent },
    { path: "create-puzzle", component: CreatePuzzleComponent },
    { path: "special-text", component: SpecialTextComponent },
    { path: "grid-start", component: GridStartComponent },
    { path: "grid-editor", component: GridEditorComponent },
    { path: "grid-image", component: GridImageComponent },
    { path: "nina-finder", component: NinaFinderComponent },
    { path: "clues-start", component: CluesStartComponent },
    { path: "clues-editor", component: CluesEditorComponent },
    { path: "puzzle-info", component: PuzzleInfoComponent },
    { path: "nav-error", component: NavErrorComponent },
    { path: "link-error", component: LinkErrorComponent },

    // general
    { path: "settings", component: SettingsComponent },
    { path: "scratchpad", component: ScratchpadComponent },
    { path: "pdf-download-guide-azed", component: PdfDownloadGuideAzedComponent },
    { path: "pdf-download-guide-quiptic", component: PdfDownloadGuideQuipticComponent },
    { path: "pdf-download-guide", component: PdfDownloadGuideComponent },

    // default routes
    { path: "", redirectTo: "/home", pathMatch: "full" },
    { path: "*", redirectTo: "/home", pathMatch: "full" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
