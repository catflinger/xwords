import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './ui/general/home/home.component';
import { SettingsComponent } from './ui/general/settings/settings.component';
import { BloggerComponent } from './ui/puzzle-solving/blogger/blogger.component';
import { SolverComponent } from './ui/puzzle-solving/solver/solver.component';

const routes: Routes = [
    // landing pages
    { path: "home", component: HomeComponent },

    // solving and blogging puzzles
    { path: "solver", component: SolverComponent },
    { path: "blogger", component: BloggerComponent },

    // general
    { path: "settings", component: SettingsComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
