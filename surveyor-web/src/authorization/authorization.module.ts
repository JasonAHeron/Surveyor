import { NgModule } from '@angular/core';
import { AuthorizationService } from './authorization.service';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { NoAccessComponent } from './no_access.component';

@NgModule({
  declarations: [
    NoAccessComponent,
  ],
  imports: [
    AngularFireAuthModule,
    AngularFirestoreModule,
  ],
  providers: [
    AuthorizationService,
  ],
  exports: [
    NoAccessComponent,
  ]
})
export class AuthorizationModule { }
