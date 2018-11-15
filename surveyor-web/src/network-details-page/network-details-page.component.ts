import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import { map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AngularFirestore, DocumentData } from 'angularfire2/firestore';
import { Network } from 'src/models/network';

@Component({
  selector: 'app-network-details-page',
  templateUrl: './network-details-page.component.html',
  styleUrls: ['./network-details-page.component.css']
})
export class NetworkDetailsPageComponent implements OnInit {
  ssid: Observable<string>
  network: Observable<Network>

  constructor(
    private readonly aFirestore: AngularFirestore,
    private readonly route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.ssid = this.route.paramMap.pipe(map(paramMap => paramMap['params']['ssid']), shareReplay(1));
    this.network = this.ssid.pipe(
      switchMap(ssid => this.aFirestore.collection<Network>('networks').doc(ssid).valueChanges()),
      map(network => network as Network),
    );
  }

}
