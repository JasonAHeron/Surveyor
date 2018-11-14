import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { Network } from '../models/network';
import { Observable } from 'rxjs';
import { shareReplay, map } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home-page.ng.html',
})
export class HomePageComponent implements OnInit {
  networks: Observable<Network[]> | undefined;

  constructor(
    private readonly afFirestore: AngularFirestore,
  ) { }

  ngOnInit() {
    this.networks = this.afFirestore.collection<Network>('networks')
      .snapshotChanges().pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as Network;
          const id = a.payload.doc.id;
          return { id, ...data };
        })),
        shareReplay(1));
  }
}
