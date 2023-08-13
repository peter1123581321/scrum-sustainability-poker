import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateRoomComponent } from './create-room/create-room.component';
import { CreateUserComponent } from './create-user/create-user.component';

const routes: Routes = [
  { path: 'room', component: CreateRoomComponent },
  { path: 'user/:roomId', component: CreateUserComponent },
  { path: '', redirectTo: 'room', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NewGameRoutingModule { }
