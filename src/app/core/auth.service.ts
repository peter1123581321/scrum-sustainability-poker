import { Injectable } from '@angular/core';
import { Auth, User, getAuth, onAuthStateChanged } from '@angular/fire/auth';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  private isHostSubject = new BehaviorSubject<boolean>(false);
  private userValSubject = new BehaviorSubject<User | undefined>(undefined);

  public get isLoggedIn$(): Observable<boolean> {
    return this.isLoggedInSubject.asObservable();
  }

  public get isHost(): boolean {
    return this.isHostSubject.value;
  }

  public set isHost(isHost: boolean) {
    this.isHostSubject.next(isHost);
  }

  public get user$(): Observable<User | undefined> {
    return this.userValSubject.asObservable();
  }

  public get user(): User | undefined {
    return this.userValSubject.value;
  }

  /**
   * Initializes a new instance of the {@link AuthService} class.
   * @param auth the injected firestore auth service
   */
  constructor(
    private readonly auth: Auth // needed here, otherwise you get an error that the AngularFireModule has not been provided
  ) {
    this.setupSubscriptions();
  }

  /**
   * Sets up and manages all subscriptions needed for the authentication.
   */
  private setupSubscriptions(): void {
    const auth = getAuth();
    onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        // User is signed in
        this.isLoggedInSubject.next(true);
        this.userValSubject.next(user);
      } else {
        // User is signed out
        this.isLoggedInSubject.next(false);
        this.isHostSubject.next(false);
        this.userValSubject.next(undefined);
      }
    });
  }

}
