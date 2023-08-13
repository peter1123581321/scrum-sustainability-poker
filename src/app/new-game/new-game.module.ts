import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { NewGameRoutingModule } from './new-game-routing.module';
import { CreateRoomComponent } from './create-room/create-room.component';
import { CreateUserComponent } from './create-user/create-user.component';

@NgModule({
  declarations: [
    CreateRoomComponent,
    CreateUserComponent
  ],
  imports: [
    CommonModule,
    NewGameRoutingModule,
    SharedModule
  ]
})
export class NewGameModule { }
