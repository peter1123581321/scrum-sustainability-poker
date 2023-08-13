import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { onSnapshot, Firestore, doc, Unsubscribe } from '@angular/fire/firestore';
import { Room, RoomTimer } from '../shared/models/room.model';

@Injectable({
  providedIn: 'root'
})
export class RoomService {

  private roomSubscription: Unsubscribe | undefined;
  private currentRoomIdVal = new BehaviorSubject<string | undefined>(undefined);
  private currentRoomVal = new BehaviorSubject<Room | undefined>(undefined);
  private timerVal = new BehaviorSubject<RoomTimer | undefined>(undefined);

  public get currentRoomId$(): Observable<string | undefined> {
    return this.currentRoomIdVal.asObservable();
  }

  public set currentRoomId(val: string) {
    this.currentRoomIdVal.next(val);
  }

  public get currentRoom$(): Observable<Room | undefined> {
    return this.currentRoomVal.asObservable();
  }

  public get timer$(): Observable<RoomTimer | undefined> {
    return this.timerVal.asObservable();
  }

  /**
   * Initializes a new instance of the {@link RoomService} class.
   * @param firestore the injected firestore service
   */
  constructor(private readonly firestore: Firestore) {
    this.currentRoomId$.subscribe((roomId) => {
      if (roomId) {
        this.setupRoomSubscription(roomId);
      }
    });
  }

  /**
   * Sets up and manages all subscriptions needed for the management of the room.
   * @param roomId the id of the room to manage
   */
  private setupRoomSubscription(roomId: string): void {
    if (this.roomSubscription) {
      this.roomSubscription(); // unsubscribe from existing subscription
    }

    this.roomSubscription = onSnapshot(doc(this.firestore, 'rooms', roomId), (doc) => {
      const room = {
        id: doc.id,
        ...doc.data()
      } as Room;

      this.currentRoomVal.next(room);

      if (room.timerSeconds && room.timerStartAt) {
        this.timerVal.next({
          timerSeconds: room.timerSeconds,
          timerStartAt: room.timerStartAt
        } as RoomTimer);
      } else {
        this.timerVal.next(undefined);
      }
    });
  }
}
