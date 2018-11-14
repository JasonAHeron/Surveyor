export interface Network {
  ssid: string;
  devices: {[key: string]: Device};
}

export interface Device {
  mac: string;
  vendor: string;
  last_seen: Number;
  name?: string;
}