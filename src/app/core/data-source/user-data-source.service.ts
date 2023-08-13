import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { CustomUser } from 'src/app/shared/models/custom-user.model';

@Injectable({
  providedIn: 'root'
})
export class UserDataSourceService {

  /**
   * Initializes a new instance of the {@link UserDataSourceService} class.
   * @param firestore the injected firestore service
   */
  constructor(private readonly firestore: Firestore) { }

  /**
   * Add new user document to the given room.
   * @param roomId the roomId where the user should be stored
   * @param user the user to add
   */
  public async addUserToRoom(roomId: string, user: CustomUser): Promise<void> {
    const userRef = doc(this.firestore, `rooms/${roomId}/users/${user.id}`);
    return setDoc(userRef, user, { merge: true });
  }

}
