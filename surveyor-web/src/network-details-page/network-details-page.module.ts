import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule} from '@angular/router';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { NetworkDetailsPageComponent } from './network-details-page.component';

@NgModule({
  imports: [
    AngularFirestoreModule,
    CommonModule,
    RouterModule
  ],
  declarations: [NetworkDetailsPageComponent],
  exports: [NetworkDetailsPageComponent]
})
export class NetworkDetailsPageModule { }
