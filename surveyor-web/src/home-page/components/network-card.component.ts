import { Component, Input } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { Device, Network } from '../../models/network';

@Component({
  selector: 'app-network-card',
  templateUrl: './network-card.ng.html',
  styleUrls: ['./network-card.css']
})
export class NetworkCardComponent {
  @Input() ssid: string;
  @Input() devices: Device[];

  displayedColumns = ['name', 'last_seen', 'mac', 'vendor'];

  constructor(
    private readonly afFirestore: AngularFirestore,
  ) { }

  update(device: Device) {
    const devicesPartial: { [key: string]: Device } = { ['devices.' + device.mac]: device }
    this.afFirestore.doc('networks/' + this.ssid).update(devicesPartial);
  }
}
