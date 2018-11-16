import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { Network } from '../models/network';
import { Observable } from 'rxjs';
import { shareReplay, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home-page.ng.html',
})
export class HomePageComponent implements OnInit {
  networks: Observable<{ ssid: string, activeDeviceCount: number }[]> | undefined;
  displayedColumns = ['ssid', 'activeDeviceCount'];

  constructor(
    private readonly afFirestore: AngularFirestore,
    private readonly router: Router,
  ) { }

  ngOnInit() {
    this.networks = this.afFirestore.collection<Network>('networks')
      .valueChanges().pipe(
        map(networks => networks.map(network => {
          return {
            'ssid': network.ssid,
            'activeDeviceCount': Object.values(network.devices).filter(device => device.activity).length,
          }
        }).sort()),
        shareReplay(1));
  }

  navigateTo(ssid: string) {
    this.router.navigate(['network', ssid]);
  }
}
