import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  /**
   * Initializes a new instance of the {@link AppComponent} class.
   * @param titleService the injected title service
   */
  constructor(titleService: Title) {
    titleService.setTitle(environment.htmlDocumentTitle);
  }

}
