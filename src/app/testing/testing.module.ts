import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { SharedModule } from './../shared/shared.module';
import { environment } from 'src/environments/environment';

@NgModule({
  declarations: [],
  imports: [
    HttpClientTestingModule,
    CommonModule,
    SharedModule,
    NoopAnimationsModule,
    RouterTestingModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore())
  ],
  exports: [SharedModule],
  providers: [
    {
      provide: ActivatedRoute, useValue: {
        snapshot: {
          paramMap: {
            get: () => '1234', // represents a dummy roomId
          },
        },
      }
    }
  ],
})
export class TestingModule { }
