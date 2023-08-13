import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, DocumentReference, DocumentData, getDoc, doc, updateDoc, Timestamp } from '@angular/fire/firestore';
import { Room, RoomState } from 'src/app/shared/models/room.model';

@Injectable({
  providedIn: 'root'
})
export class RoomDataSourceService {

  /**
   * Initializes a new instance of the {@link RoomDataSourceService} class.
   * @param firestore the injected firestore service
   */
  constructor(private readonly firestore: Firestore) { }

  /**
   * Add new room document.
   * @param room the room to add
   * @returns information about the newly created room (e.g. the new id) as DocumentReference<DocumentData> object
   */
  public async createRoom(room: Room): Promise<DocumentReference<DocumentData>> {
    const db = collection(this.firestore, 'rooms');
    return await addDoc(db, room);
  }

  /**
   * Returns a room object as Promise for the given id.
   * @param roomId the id of the room to load
   * @returns room object or NULL when no room could be found
   */
  public async getRoom(roomId: string): Promise<Room | null> {
    const db = collection(this.firestore, 'rooms');
    const room = await getDoc(doc(db, roomId));
    if (room.exists()) {
      return {
        id: room.id,
        ...room.data()
      } as Room;
    } else {
      return null;
    }
  }

  /**
   * Sets the host of the given room.
   * @param roomId the id of the room
   * @param userId the host of the room to set
   */
  public async setHostForRoom(roomId: string, userId: string): Promise<void> {
    const roomRef = doc(this.firestore, 'rooms', roomId);

    return await updateDoc(roomRef, {
      host: userId
    });
  }

  /**
   * Sets the state of the given room.
   * @param roomId the roomId where the state has to be changed
   * @param state the new state of the room
   * @param issueId the id of the issue to be voted for
   */
  public async setStateForRoom(roomId: string, state: RoomState, issueId: string): Promise<void> {
    const roomRef = doc(this.firestore, 'rooms', roomId);

    return await updateDoc(roomRef, {
      currentState: state,
      currentIssue: issueId
    });
  }

  /**
   * Sets the timer values for the given room.
   * @param roomId the id of the room
   * @param seconds the number in seconds how long the timer should run
   */
  public async setTimerValues(roomId: string, seconds: number): Promise<void> {
    const roomRef = doc(this.firestore, 'rooms', roomId);

    return await updateDoc(roomRef, {
      timerStartAt: Timestamp.now(),
      timerSeconds: seconds
    });
  }

  /**
   * Resets the timer values for the given room.
   * @param roomId the id of the room
   */
  public async resetTimerValues(roomId: string): Promise<void> {
    const roomRef = doc(this.firestore, 'rooms', roomId);

    return await updateDoc(roomRef, {
      timerStartAt: null,
      timerSeconds: null
    });
  }
}
