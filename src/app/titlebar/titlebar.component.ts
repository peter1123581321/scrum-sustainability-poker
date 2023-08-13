import { Component } from '@angular/core';
import { Observable, map } from 'rxjs';
import { User } from '@angular/fire/auth';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-titlebar',
  templateUrl: './titlebar.component.html',
  styleUrls: ['./titlebar.component.scss']
})
export class TitlebarComponent {

  public get isLoggedIn$(): Observable<boolean> {
    return this.authService.isLoggedIn$;
  }

  public get user$(): Observable<string | null> {
    return this.authService.user$.pipe(
      map((user: User | undefined) => {
        if (!user) {
          return '';
        }

        return user.displayName;
      })
    );
  }

  /**
   * Initializes a new instance of the {@link TitlebarComponent} class.
   * @param authService the injected auth service
   */
  constructor(private readonly authService: AuthService) { }

}
