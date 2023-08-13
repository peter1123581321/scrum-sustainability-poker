import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: 'new-game', loadChildren: () => import('./new-game/new-game.module').then((m) => m.NewGameModule) },
  { path: 'voting', loadChildren: () => import('./voting/voting.module').then((m) => m.VotingModule) },
  { path: '', redirectTo: 'new-game', pathMatch: 'full' },
  { path: '**', redirectTo: 'new-game', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
