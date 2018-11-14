import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-network-card',
  templateUrl: './network-card.ng.html',
})
export class NetworkCardComponent {
  @Input() ssid: string | undefined;
  @Input() channel: number | undefined;
  @Input() documentId: string | undefined;
  bssid = '123910238';
  numConnectedDevices = 12;
  numPhonesOnNetwork = 6;
  encryptionType = 'WPA2';
  signalStrength = '-12db';
}
