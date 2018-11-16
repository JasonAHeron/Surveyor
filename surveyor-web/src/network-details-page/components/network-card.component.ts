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

  displayedColumns = ['name', 'currentlyActive', 'lastSeen', 'mac', 'vendor', 'delete'];

  constructor(
    private readonly afFirestore: AngularFirestore,
  ) { }

  update(device: Device) {
    const devicesPartial: { [key: string]: Device } = { ['devices.' + device.mac]: device }
    this.afFirestore.doc('networks/' + this.ssid).update(devicesPartial);
  }

  delete(device: Device) {
    this.afFirestore.doc<Network>('networks/' + this.ssid).get().subscribe(snapshot => {
      const network = snapshot.data() as Network
      delete network.devices[device.mac];
      this.afFirestore.doc('networks/' + this.ssid).update({ devices: network.devices });
    });
  }
}
