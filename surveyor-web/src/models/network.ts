export interface Network {
  ssid: string;
  devices: {[key: string]: Device};
}

export interface Device {
  mac: string;
  vendor: string;
  activity?: number[];
  bytes: number;
  signal: number;
  history? : number[];
  last_seen: Number;
  name?: string;
  starred?: boolean;
}