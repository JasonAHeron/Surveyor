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

  displayedColumns = ['starred', 'name', 'lastSeen', 'mac', 'vendor', 'actions'];

  constructor(
    private readonly afFirestore: AngularFirestore,
  ) { }

  update(device: Device) {
    const devicesPartial: { [key: string]: Partial<Device> } = { ['devices.' + device.mac]: device }
    this.afFirestore.doc('networks/' + this.ssid).update(devicesPartial);
  }

  delete(device: Device) {
    this.afFirestore.doc<Network>(`networks/${this.ssid}`).get().subscribe(snapshot => {
      const network = snapshot.data() as Network
      delete network.devices[device.mac];
      this.afFirestore.doc('networks/' + this.ssid).update({ devices: network.devices });
    });
  }

  stop(device: Device) {
    const blacklistPartial: { [key: string]: string } = { [device.mac]: 'BLACKLISTED' }
    this.afFirestore.doc(`blacklisted_devices/${this.ssid}`).set(blacklistPartial, { merge: true });
    this.delete(device);
  }

  star(device: Device) {
    const devicePartial: { [key: string]: boolean } = { ['devices.' + device.mac + '.starred']: !device.starred };
    this.afFirestore.doc('networks/' + this.ssid).update(devicePartial);
  }
}
