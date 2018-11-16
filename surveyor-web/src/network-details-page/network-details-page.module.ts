import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule} from '@angular/router';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { NetworkDetailsPageComponent } from './network-details-page.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { FormsModule } from '@angular/forms';
import { NetworkCardComponent } from './components/network-card.component';
import {LastSeenPipe} from '../pipes/last-seen.pipe'
import { MatCardModule, MatButtonModule, MatTableModule, MatIconModule, MatInputModule } from '@angular/material';


@NgModule({
  imports: [
    AngularFirestoreModule,
    CommonModule,
    RouterModule,
    NgxChartsModule,
    AngularFirestoreModule,
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatInputModule,
    FormsModule,
    MatCardModule,
  ],
  declarations: [NetworkDetailsPageComponent, NetworkCardComponent, LastSeenPipe],
  exports: [NetworkDetailsPageComponent]
})
export class NetworkDetailsPageModule { }
