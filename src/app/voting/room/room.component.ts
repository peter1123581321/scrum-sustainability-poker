import { Component, OnInit } from '@angular/core';
import { User, getAuth } from '@angular/fire/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth.service';
import { RoomDataSourceService } from 'src/app/core/data-source/room-data-source.service';
import { UserDataSourceService } from 'src/app/core/data-source/user-data-source.service';
import { IssueService } from 'src/app/core/issue.service';
import { RoomService } from 'src/app/core/room.service';
import { CustomUser } from 'src/app/shared/models/custom-user.model';
import { Issue } from 'src/app/shared/models/issue.model';
import { Room } from 'src/app/shared/models/room.model';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit {

  public roomId = '';
  public checkingRoomId = true;
  public currentRoom: Room | undefined;
  public currentIssue: Issue | undefined;

  /**
   * Initializes a new instance of the {@link RoomComponent} class.
   * @param router the injected router service
   * @param route the injected activatedRoute service
   * @param authService the injected auth service
   * @param roomService the injected room service
   * @param issueService the injected issue service
   * @param userDataSourceService the injected user dataSource service
   * @param roomDataSourceService the injected room dataSource service
   */
  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly authService: AuthService,
    private readonly roomService: RoomService,
    private readonly issueService: IssueService,
    private readonly userDataSourceService: UserDataSourceService,
    private readonly roomDataSourceService: RoomDataSourceService,
  ) { }

  /**
   * Implements the init method. See {@link OnInit}.
   */
  ngOnInit(): void {
    this.roomId = this.route.snapshot.paramMap.get('roomId') ?? '';
    this.joinOrCreateRoom();
  }

  /**
   * Joins the room with the roomId from the route or creates a new room if the roomId does not exist.
   */
  private joinOrCreateRoom(): void {
    // check if the provided roomId is valid
    this.roomDataSourceService.getRoom(this.roomId)
      .then((room: Room | null) => {
        if (room) {
          // roomId does exist
          const currentUser = getAuth().currentUser;
          if (currentUser) {
            // already anonymously signed in
            this.roomService.currentRoomId = this.roomId;
            this.addUserToRoom(room, currentUser);
          } else {
            // not signed in - go to 'create user' page
            this.router.navigate(['new-game/user', room.id]);
          }
        } else {
          // roomId does not exist - go to 'create room' page
          this.router.navigate(['new-game/room']);
        }
      })
      .catch((error) => {
        console.error('ERROR in RoomComponent - ngOnInit', error);
      });
  }

  /**
   * Adds the user to the room.
   * @param room the room to add the user to
   * @param user the user to add to the room
   */
  private addUserToRoom(room: Room, user: User): void {
    const customUser: CustomUser = {
      id: user.uid,
      displayName: user.displayName ?? '',
      isActive: true
    };

    this.userDataSourceService.addUserToRoom(room.id ?? '', customUser);

    if (room.host === user.uid) {
      // this user is the host of the room
      this.authService.isHost = true;
    }

    // all checks have been performed - the HTML of the room component can now be rendered
    this.checkingRoomId = false;

    this.roomService.currentRoom$.subscribe(room => {
      this.currentRoom = room;
    });

    this.issueService.currentIssue$.subscribe(issue => {
      this.currentIssue = issue;
    });
  }

}
