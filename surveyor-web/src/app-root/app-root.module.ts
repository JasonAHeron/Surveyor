import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material';
import { CommonModule } from '@angular/common';

import { AngularFireModule } from 'angularfire2';
import { environment } from '../environments/environment';
import { AppRootComponent } from './app-root.component';
import { HomePageModule } from '../home-page/home-page.module';
import { HomePageComponent } from '../home-page/home-page.component';
import { AuthorizationModule } from '../authorization/authorization.module';
import { AuthorizationService } from '../authorization/authorization.service';
import { NoAccessComponent } from '../authorization/no_access.component';
import { NetworkDetailsPageComponent } from 'src/network-details-page/network-details-page.component';
import { NetworkDetailsPageModule } from 'src/network-details-page/network-details-page.module';

const routes: Routes = [
  { path: '', component: HomePageComponent, canActivate: [AuthorizationService] },
  { path: 'network/:ssid', component: NetworkDetailsPageComponent, canActivate: [AuthorizationService] },
  { path: 'no_access', component: NoAccessComponent },
];

@NgModule({
  declarations: [
    AppRootComponent,
  ],
  imports: [
    AngularFireModule.initializeApp(environment.firebase),
    AuthorizationModule,
    BrowserAnimationsModule,
    BrowserModule,
    CommonModule,
    HomePageModule,
    MatToolbarModule,
    NetworkDetailsPageModule,
    RouterModule.forRoot(routes),
  ],
  providers: [],
  bootstrap: [AppRootComponent]
})
export class AppRootModule { }
