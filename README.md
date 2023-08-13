# Scrum-Sustainability-Poker
A web application prototype has been developed that allows members of a Scrum team to estimate the impacts of user stories on different sustainability dimensions.

## Getting Started
> **IMPORTANT:**  This project relies on Firebase for its functionality; therefore, it is essential to have a Firebase project set up and a Google account. Firebase provides the necessary infrastructure and services for features such as Firestore Database and Authentication. See [Setting Up Firebase](#setting-up-firebase).

### Setting Up Project Locally
To set up the project locally, follow these steps:

1. Install [Node.js](https://nodejs.org/).
1. Install the Angular CLI.
   ```bash
   npm install -g @angular/cli
   ```
1. Clone this repository.
1. Switch into the directory of the cloned repository.
1. Run `npm install` to install all necessary dependencies.
1. Run `ng serve` to launch the development server, hosting your application locally and allowing you to view immediate changes in the browser.

For an optimal development experience with this Angular project, using Visual Studio Code (VSCode) as the integrated development environment (IDE) is highly recommend. VSCode together with the extension `Angular Essentials` offers a range of features and extensions specifically tailored for Angular development.

* [VSCode](https://code.visualstudio.com/)
* [Angular Essentials](https://marketplace.visualstudio.com/items?itemName=johnpapa.angular-essentials)


### Setting Up Firebase
1. Create a new Firebase project in the [Firebase Console](https://console.firebase.google.com/).
1. As app type, choose `Web`.
1. Add a new Firestore Database to your Firebase project.
    * As rule mode either choose test or production - the correct rules will be uploaded later from the repository anyway.
1. Add Authentication to your Firebase project.
    * As a Sign-in method, add `Anonymous auth`.
1. Install the Firebase CLI on your local machine.
   ```bash
   npm install -g firebase-tools
   ```
1. Switch to the directory of the cloned repository.
1. Run `firebase login` to login to your Google account, so you can access your Firebase projects on your local machine.
1. Run `firebase use --add` to register your Firebase project in the local settings.
    * When asked *"Which project do you want to add?"*, choose your Firebase project.
    * When asked *"What alias do you want to use for this project?"*, type in `default` to override the existing local settings of the old Firebase project.
1. Run `firebase deploy` to upload and override the default Firestore rules and Firestore indexes in your Firestore Database to existing rules and indexes (which are already defined and stored in [firestore.rules](firestore.rules) and [firestore.indexes.json](firestore.indexes.json)).
1. Finally, go to the project settings of your Firebase project and copy the configuration. Replace the default Firebase configuration in [environment.ts](./src/environments/environment.ts) and [environment.prod.ts](./src/environments/environment.prod.ts) with the configuration of your Firebase project.

### Deployment

To deploy the project, follow these steps:

1. [Setup the project locally](#setting-up-project-locally)
1. [Setup Firebase](#setting-up-firebase)
1. Run `ng build` to build the prototype into `dist` folder. You can put the content of this `dist` folder on a webserver to publish the prototype.

## Implementation Details and Technologies

### Dependencies
The following npm packages were used in the project:

| Dependency Name | Version number | Description |
| ------ | ------ | ------ |
| [**Angular Material**](https://material.angular.io/) | `15.2.8` | A UI component library for Angular applications. |
| [**Angular Flex-Layout**](https://github.com/angular/flex-layout) | `15.0.0-beta.42` | Provides a powerful layout API using Flexbox CSS and media query. |
| [**AngularFire**](https://github.com/angular/angularfire) | `7.5.0` | The official Angular library for Firebase. |
| [**ngx-slider**](https://angular-slider.github.io/ngx-slider/) | `2.0.4` | A customizable slider component for Angular. |

### Angular project
This prototype was generated with [Angular CLI](https://github.com/angular/angular-cli) version 15.2.5.

| Type | Description |
| ------ | ------ |
| Development server | Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files. |
| Code scaffolding | Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive\|pipe\|service\|class\|guard\|interface\|enum\|module`. To create a new component within a specific module, the name of the module must also be specified (e.g. you want to create a new service in the Core module `ng generate service core/service-name`) |
| Build | Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. |
| Lint | To enforce consistent coding styles and identify potential errors or bugs run `ng lint`. This ensures the adherence to best practices, maintain code quality, and enhances the overall code readability. |
| Running unit tests | Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io). |
| Running end-to-end tests | Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities. |
| Further help | To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page. |
