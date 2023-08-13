import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { User, UserCredential, getAuth, signInAnonymously, updateProfile } from '@angular/fire/auth';
import { SnackbarService } from 'src/app/shared/snackbar.service';
import { RoomDataSourceService } from 'src/app/core/data-source/room-data-source.service';
import { UserDataSourceService } from 'src/app/core/data-source/user-data-source.service';
import { CustomUser } from 'src/app/shared/models/custom-user.model';
import { Room } from 'src/app/shared/models/room.model';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss']
})
export class CreateUserComponent implements OnInit {

  private roomId = '';
  private isRoomHostEmpty = false;
  public loading = false;
  public usernameCtrl = new FormControl('', [Validators.required]);

  /**
   * Initializes a new instance of the {@link CreateUserComponent} class.
   * @param router the injected router service
   * @param route the injected activatedRoute service
   * @param snackbarService the injected snackbar service
   * @param userDataSourceService the injected user dataSource service
   * @param roomDataSourceService the injected room dataSource service
   */
  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly snackbarService: SnackbarService,
    private readonly userDataSourceService: UserDataSourceService,
    private readonly roomDataSourceService: RoomDataSourceService,
  ) { }

  /**
   * Implements the init method. See {@link OnInit}.
   */
  ngOnInit(): void {
    this.disableForm();
    this.roomId = this.route.snapshot.paramMap.get('roomId') ?? '';

    // laod the room to check if given roomId is valid
    this.roomDataSourceService.getRoom(this.roomId)
      .then((room: Room | null) => {
        if (room) {
          // room could be loaded - room exists
          // check if the room already has a host and then check if the user is signed in
          this.isRoomHostEmpty = room.host ? false : true;
          this.checkIfSignedIn();
        } else {
          // room does not exist - navigate to create room page
          this.router.navigate(['new-game/room']);
        }
      })
      .catch((error) => {
        this.snackbarService.openSnackBar('Could not join room. Please try again.', false);
        console.error('ERROR in CreateUserComponent - ngOnInit', error);
      });
  }

  /**
   * Called when the 'Join room' button is clicked.
   * Asynchronously signs in to firebase as an anonymous user and then changes
   * the userName to the value the user provided in the input field.
   */
  public joinRoom(): void {
    this.usernameCtrl.markAsTouched();
    if (this.usernameCtrl.invalid) {
      return;
    }
    this.disableForm();

    const auth = getAuth();
    signInAnonymously(auth)
      .then((result: UserCredential) => {
        // signed in anonymously - Firebase created an anonymous user with a unique ID (UID)
        // now change the displayName of the newly created user to the name that the user provided in the form
        updateProfile(result.user, { displayName: this.usernameCtrl.value })
          .then(() => {
            // now add the user to the room, so that the user can be displayed in the room overview
            this.addUserToRoomAndSetHost(result);
          }).catch((error) => {
            this.enableForm();
            this.snackbarService.openSnackBar('Could not join room. Please try again.', false);
            console.error('ERROR in CreateUserComponent - joinRoom (updateProfile)', error);
          });
      })
      .catch((error) => {
        this.enableForm();
        this.snackbarService.openSnackBar('Could not join room. Please try again.', false);
        console.error('ERROR in CreateUserComponent - joinRoom (signInAnonymously)', error);
      });
  }

  /**
   * Adds the given user to the room and sets the user as host of the room, if the host is not set yet.
   * @param userCredentials the user credentials of the user that should be added to the room
   */
  private addUserToRoomAndSetHost(userCredentials: UserCredential): void {
    const customUser: CustomUser = {
      id: userCredentials.user.uid,
      displayName: userCredentials.user.displayName ?? '',
      isActive: true
    };

    this.userDataSourceService.addUserToRoom(this.roomId, customUser)
      .then(() => {
        this.setHostOfRoom(userCredentials.user);
      }).catch((error) => {
        this.enableForm();
        this.snackbarService.openSnackBar('Could not join room. Please try again.', false);
        console.error('ERROR in CreateUserComponent - addUserToRoomAndSetHost', error);
      });
  }

  /**
   * Sets the given user as host of the room, if the host is not set yet.
   * @param user the user that should be set as host of the room
   */
  private setHostOfRoom(user: User): void {
    if (this.isRoomHostEmpty) {
      // host is not set yet - set the host
      this.roomDataSourceService.setHostForRoom(this.roomId, user.uid)
        .then(() => {
          this.redirectToVotingBoard();
        }).catch((error) => {
          this.enableForm();
          this.snackbarService.openSnackBar('Could not join room. Please try again.', false);
          console.error('ERROR in CreateUserComponent - setHostOfRoom', error);
        });
    } else {
      // host is already set
      this.redirectToVotingBoard();
    }
  }

  /**
   * Navigate to the voting board page.
   */
  private redirectToVotingBoard(): void {
    this.router.navigate(['voting', this.roomId]);
  }

  /**
   * Check if the user is already signed in to firebase.
   */
  private checkIfSignedIn(): void {
    const currentUser = getAuth().currentUser;

    if (currentUser) {
      // already anonymously signed in - join room
      this.setHostOfRoom(currentUser);
    } else {
      // not signed in yet - enable form to enter name
      this.enableForm();
    }
  }

  /**
   * Disable all input fields and buttons.
   */
  private disableForm(): void {
    this.loading = true;
    this.usernameCtrl.disable();
  }

  /**
   * Enable all input fields and buttons.
   */
  private enableForm(): void {
    this.loading = false;
    this.usernameCtrl.enable();
  }

}
