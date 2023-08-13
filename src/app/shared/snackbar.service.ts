import { Injectable, NgZone } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {

  /**
   * Initializes a new instance of the {@link SnackbarService} class.
   * @param snackBar the injected MatSnackBar service
   * @param zone the injected NgZone service
   */
  constructor(
    private readonly snackBar: MatSnackBar,
    private readonly zone: NgZone
  ) { }

  /**
   * Opens a snackbar with the given message.
   * @param message the message to display
   * @param timeout 'true' if the snackbar should automatically dismiss, otherwise 'false'
   */
  public openSnackBar(message: string, timeout = false): void {
    this.zone.run(() => {
      const duration = timeout ? 5000 : undefined;
      const config: MatSnackBarConfig = {
        duration: duration,
        panelClass: timeout ? 'snackbar-text-center' : ''
      };
      this.snackBar.open(message, timeout ? undefined : 'Close', config);
    });
  }
}
