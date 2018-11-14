import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import {LastSeenPipe} from '../pipes/last-seen.pipe'
import { MatCardModule, MatButtonModule, MatTableModule, MatIconModule, MatInputModule } from '@angular/material';

import { HomePageComponent } from './home-page.component';
import { NetworkCardComponent } from './components/network-card.component';

@NgModule({
    declarations: [
        HomePageComponent,
        NetworkCardComponent,
        LastSeenPipe,
    ],
    imports: [
        AngularFirestoreModule,
        CommonModule,
        MatIconModule,
        MatButtonModule,
        MatTableModule,
        MatInputModule,
        FormsModule,
        MatCardModule,
        MatProgressBarModule,
    ],
    exports: [
        HomePageComponent,
    ]
})
export class HomePageModule { }
