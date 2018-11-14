import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { MatCardModule, MatButtonModule } from '@angular/material';

import { HomePageComponent } from './home-page.component';
import { NetworkCardComponent } from './components/network-card.component';

@NgModule({
    declarations: [
        HomePageComponent,
        NetworkCardComponent,
    ],
    imports: [
        AngularFirestoreModule,
        CommonModule,
        MatButtonModule,
        MatCardModule,
        MatProgressBarModule,
    ],
    exports: [
        HomePageComponent,
    ]
})
export class HomePageModule { }
