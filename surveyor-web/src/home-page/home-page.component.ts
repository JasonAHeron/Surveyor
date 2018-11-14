import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { Network } from '../models/network';
import { Observable } from 'rxjs';
import { shareReplay, map, tap } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home-page.ng.html',
})
export class HomePageComponent implements OnInit {
  networks: Observable<Network[]> | undefined;
  values = Object.values;

  constructor(
    private readonly afFirestore: AngularFirestore,
  ) { }

  ngOnInit() {
    this.networks = this.afFirestore.collection<Network>('networks')
      .snapshotChanges().pipe(
        map(actions => actions.map(a => a.payload.doc.data()).filter(network => Object.values(network.devices).length !== 0)),
        tap(payload => console.log(payload)),
        shareReplay(1));
  }
}
