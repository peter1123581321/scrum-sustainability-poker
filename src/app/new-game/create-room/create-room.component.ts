import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';
import { User, getAuth } from '@angular/fire/auth';
import { Room, RoomState } from 'src/app/shared/models/room.model';
import { RoomDataSourceService } from 'src/app/core/data-source/room-data-source.service';
import { SnackbarService } from 'src/app/shared/snackbar.service';
import { DocumentData, DocumentReference, Timestamp } from '@angular/fire/firestore';
import { CustomUser } from 'src/app/shared/models/custom-user.model';
import { UserDataSourceService } from 'src/app/core/data-source/user-data-source.service';

@Component({
  selector: 'app-create-room',
  templateUrl: './create-room.component.html',
  styleUrls: ['./create-room.component.scss']
})
export class CreateRoomComponent {

  public loading = false;
  public roomNameCtrl = new FormControl('', [Validators.required]);

  /**
   * Initializes a new instance of the {@link CreateRoomComponent} class.
   * @param router the injected router service
   * @param snackbarService the injected snackbar service
   * @param userDataSourceService the injected user dataSource service
   * @param roomDataSourceService the injected room dataSource service
   */
  constructor(
    private readonly router: Router,
    private readonly snackbarService: SnackbarService,
    private readonly userDataSourceService: UserDataSourceService,
    private readonly roomDataSourceService: RoomDataSourceService,
  ) { }

  /**
   * Create a new room and navigate to the voting board page or create user page.
   */
  public createNewRoom(): void {
    this.roomNameCtrl.markAsTouched();
    if (this.roomNameCtrl.invalid || !this.roomNameCtrl.value) {
      return;
    }
    this.disableForm();

    const room: Room = {
      name: this.roomNameCtrl.value,
      createdAt: Timestamp.now(),
      currentState: RoomState.Idle
    };

    this.roomDataSourceService.createRoom(room)
      .then((newRoom: DocumentReference<DocumentData>) => {
        const currentUser = getAuth().currentUser;
        if (currentUser) {
          // already anonymously signed in
          // creator is the host of the room
          // join room
          this.roomDataSourceService.setHostForRoom(newRoom.id, currentUser.uid);
          this.redirectToVotingBoard(newRoom.id, currentUser);
        } else {
          // user not signed in yet
          // go to 'create user' page
          this.router.navigate(['new-game/user', newRoom.id]);
        }
      })
      .catch((error) => {
        this.enableForm();
        this.snackbarService.openSnackBar('Room could not be created. Please try again.', false);
        console.error('ERROR in CreateRoomComponent - createNewRoom', error);
      });
  }

  /**
   * Add user to room and navigate to the voting board page.
   */
  private redirectToVotingBoard(roomId: string, user: User): void {
    const customUser: CustomUser = {
      id: user.uid,
      displayName: user.displayName ?? '',
      isActive: true
    };

    this.userDataSourceService.addUserToRoom(roomId, customUser);
    this.router.navigate(['voting', roomId]);
  }

  /**
   * Disable all input fields and buttons.
   */
  private disableForm(): void {
    this.loading = true;
    this.roomNameCtrl.disable();
  }

  /**
   * Enable all input fields and buttons.
   */
  private enableForm(): void {
    this.loading = false;
    this.roomNameCtrl.enable();
  }

}
