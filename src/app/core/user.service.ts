import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { onSnapshot, Firestore, query, collection, where, Unsubscribe } from '@angular/fire/firestore';
import { RoomService } from './room.service';
import { CustomUser } from '../shared/models/custom-user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private userSubscription: Unsubscribe | undefined;
  private usersVal = new BehaviorSubject<Array<CustomUser>>([]);

  public get users$(): Observable<CustomUser[]> {
    return this.usersVal.asObservable();
  }

  /**
   * Initializes a new instance of the {@link UserService} class.
   * @param firestore the injected firestore service
   * @param roomService the injected room service
   */
  constructor(
    private readonly firestore: Firestore,
    private readonly roomService: RoomService
  ) {
    this.roomService.currentRoomId$.subscribe((roomId) => {
      if (roomId) {
        this.setupUserSubscription(roomId);
      }
    });
  }

  /**
   * Sets up and manages all subscriptions needed for the management of users.
   * @param roomId the id of the room for which the users are managed
   */
  private setupUserSubscription(roomId: string): void {
    if (this.userSubscription) {
      this.userSubscription(); // unsubscribe from existing subscription
    }

    const q = query(
      collection(this.firestore, 'rooms', roomId, 'users'),
      where('isActive', '==', true)
    );

    this.userSubscription = onSnapshot(q, (querySnapshot) => {
      const users: CustomUser[] = [];
      querySnapshot.forEach((doc) => {
        users.push({
          id: doc.id,
          ...doc.data()
        } as CustomUser);
      });

      // order users by displayName
      users.sort((a: CustomUser, b: CustomUser) => {
        if (a.displayName < b.displayName)
          return -1;
        if (a.displayName > b.displayName)
          return 1;
        return 0;
      });

      this.usersVal.next(users);
    });
  }
}
