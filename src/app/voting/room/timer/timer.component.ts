import { Component, ElementRef, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { RoomDataSourceService } from 'src/app/core/data-source/room-data-source.service';
import { RoomService } from 'src/app/core/room.service';
import { RoomTimer } from 'src/app/shared/models/room.model';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss']
})
export class TimerComponent implements OnInit {

  private timerSeconds = 0; // Initially set to 0 and then to the respective value when the timer starts
  private timerStartAt = Timestamp.now(); // Initially set to noew and then to the respective value when the timer starts
  private timerInterval: ReturnType<typeof setInterval> | undefined;

  private warningThreshold = 0; // Initially set to 0 and then to the respective value - warning occurs when 25% of the time has passed
  private alertThreshold = 10; // Alert occurs with 10 seconds left

  private colorCodes = {
    info: {
      color: "green"
    },
    warning: {
      color: "orange",
      threshold: this.warningThreshold
    },
    alert: {
      color: "red",
      threshold: this.alertThreshold
    }
  };

  private timeLeft = this.timerSeconds;
  public timeLeftFormatted = '';

  public remainingPathColor = this.colorCodes.info.color;
  public roomTimer: RoomTimer | undefined;

  @Input()
  public roomId = '';

  @ViewChild('timerPath', { static: false })
  private timerPathElement: ElementRef | undefined;

  /**
   * Initializes a new instance of the {@link TimerComponent} class.
   * @param render the injected renderer service
   * @param roomService the injected room service
   * @param roomDataSourceService the injected room dataSource service
   */
  constructor(
    private readonly render: Renderer2,
    private readonly roomService: RoomService,
    private readonly roomDataSourceService: RoomDataSourceService
  ) { }

  /**
   * Implements the init method. See {@link OnInit}.
   */
  ngOnInit(): void {
    this.setupSubscriptions();
  }

  /**
   * Setup the subscriptions for the component.
   */
  private setupSubscriptions(): void {
    this.roomService.timer$.subscribe((timer: RoomTimer | undefined) => {
      this.roomTimer = timer;
      if (timer) {
        this.timerSeconds = timer.timerSeconds + 1; // add 1 second so that the timer shows the full time at the very beginning
        this.timerStartAt = timer.timerStartAt;

        const threshold = Math.round(timer.timerSeconds * 0.25); // the warning should appear when only 25% of the time is left
        this.warningThreshold = threshold;
        this.colorCodes.warning.threshold = threshold;

        this.startTimer();
      }
    });
  }

  /**
   * Returns the time left formatted as mm:ss.
   * @returns the formatted time
   */
  private formatTimeLeft(): string {
    const minutesVal: number = Math.floor(this.timeLeft / 60);
    let minutes = '';

    // if the value of minutesVal is less than 10, display minutes with a leading zero
    if (minutesVal < 10) {
      minutes = `0${minutesVal}`;
    } else {
      minutes = `${minutesVal}`;
    }

    const secondsVal: number = this.timeLeft % 60;
    let seconds = '';

    // if the value of secondsVal is less than 10, display seconds with a leading zero
    if (secondsVal < 10) {
      seconds = `0${secondsVal}`;
    } else {
      seconds = `${secondsVal}`;
    }

    return `${minutes}:${seconds}`;
  }

  /**
   * Start the timer.
   */
  private startTimer(): void {
    this.calcTimeLeft(); // before the interval starts to avoid the 1 second dealy that occurs when starting the interval - otherwise the user does not see the timer for 1 second

    this.timerInterval = setInterval(() => {
      this.calcTimeLeft();

      if (this.timeLeft <= 0) {
        this.timeLeft = 0; // if there is a condition that the number is negative - set the timeLeft to 0 so that the user does not see a negative number
        this.timeLeftFormatted = this.formatTimeLeft();
        this.onTimesUp();
      }
    }, 1000);
  }

  /**
   * Calculate the time left.
   */
  private calcTimeLeft(): void {
    const timeLeft = (this.timerSeconds * 1000) - (Timestamp.now().toMillis() - this.timerStartAt.toMillis());
    this.timeLeft = Math.floor(timeLeft / 1000);
    this.timeLeftFormatted = this.formatTimeLeft();

    this.setCircleDasharray();
    this.setRemainingPathColor(this.timeLeft);
  }

  /**
   * Cleans up the timer.
   */
  private onTimesUp(): void {
    clearInterval(this.timerInterval);

    // wait a few seconds until the timer disappears
    setTimeout(() => {
      this.roomDataSourceService.resetTimerValues(this.roomId);
    }, 3000);
  }

  /**
   * Sets the remaining path color.
   * @param timeLeft the time left
   */
  private setRemainingPathColor(timeLeft: number): void {
    const { alert, warning, info } = this.colorCodes;

    // if the remaining time is less than or equal to alert threshold - remove "warning" class and apply "alert" class
    if (timeLeft <= alert.threshold && this.timerPathElement) {
      this.render.removeClass(this.timerPathElement.nativeElement, warning.color);
      this.render.addClass(this.timerPathElement.nativeElement, alert.color);

      // if the remaining time is less than or equal to warning threshold, remove base color and apply "warning" class
    } else if (timeLeft <= warning.threshold && this.timerPathElement) {
      this.render.removeClass(this.timerPathElement.nativeElement, info.color);
      this.render.addClass(this.timerPathElement.nativeElement, warning.color);
    }
  }

  /**
   * Calculate the time fraction.
   * @returns the calculated time fraction
   */
  private calculateTimeFraction(): number {
    const rawTimeFraction = this.timeLeft / this.timerSeconds;
    return rawTimeFraction - (1 / this.timerSeconds) * (1 - rawTimeFraction);
  }

  /**
   * Update the dasharray value as time passes.
   */
  private setCircleDasharray(): void {
    const circleDasharray = `${(this.calculateTimeFraction() * 283).toFixed(0)} 283`;

    if (this.timerPathElement) {
      this.render.setAttribute(this.timerPathElement.nativeElement, 'stroke-dasharray', circleDasharray);
    }
  }

}
