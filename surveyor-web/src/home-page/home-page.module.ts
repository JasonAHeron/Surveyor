import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AngularFirestoreModule } from 'angularfire2/firestore';

import { MatCardModule, MatButtonModule, MatTableModule, MatIconModule, MatInputModule } from '@angular/material';

import { HomePageComponent } from './home-page.component';

@NgModule({
    declarations: [
        HomePageComponent,
    ],
    imports: [
        AngularFirestoreModule,
        CommonModule,   
        MatButtonModule,
        MatTableModule,
    ],
    exports: [
        HomePageComponent,
    ]
})
export class HomePageModule { }
