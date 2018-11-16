from datetime import datetime
from firebase_admin import credentials
from firebase_admin import firestore
from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer
import firebase_admin
import logging
import os
import sys
import time
import yaml


MAX_WRITE_WINDOW  =  300  # default 5 mins
DROPOFF_TIME_LIMIT = 600  # default 10 mins

reads = 0
writes = 0

class Network(object):
    
    changes = False
    new_network = False

    def __init__(self, ssid, firestore_connection):
        self.ssid = ssid
        self.firestore_connection = firestore_connection
        self.network_doc = firestore_connection.collection('networks').document(ssid)

        self.last_written = time.time()
        
        self.network = self.network_doc.get()
        global reads
        reads += 1

        if self.network.exists:
            self.network = self.network.to_dict()
            if not self.network.get('devices'):
                self.network['devices'] = dict()
        else:
            self.changes = True
            self.new_network = True
            self.network = dict()
            self.network['devices'] = dict()
            self.network['ssid'] = self.ssid

    def contains_live_devices(self):
        for mac, device in self.network['devices'].items():
            if 'activity' in device:
                return True
        return False

    def write(self):
        global MAX_WRITE_WINDOW, writes
        # don't write when there are no devices
        if (self.changes or time.time() - self.last_written > MAX_WRITE_WINDOW) \
                and len(self.network['devices']) > 0 and self.contains_live_devices():
            if self.new_network:
                self.network_doc.set(self.network)
                self.new_network = False
            else:
                self.network_doc.update(flatten_dict(self.network))
            
            writes += 1
            self.last_written = time.time()

        self.changes = False

    def add_device(self, device):
        if device['mac'] not in self.network['devices']:
            # only write when necessary
            self.changes = True

        if device['mac'] in self.network['devices']:
            self.network['devices'][device['mac']]['mac'] = device['mac']
            self.network['devices'][device['mac']]['vendor'] = device['vendor']
            self.network['devices'][device['mac']]['last_seen'] = device['last_seen']
            if 'activity' not in self.network['devices'][device['mac']] and 'activity' in device:
                self.changes = True
                self.network['devices'][device['mac']]['activity'] = device['activity']
        else:
            self.network['devices'][device['mac']] = device

        self.network['device_count'] = len(self.network['devices'])

    def refine_history(self, history):
        global DROPOFF_TIME_LIMIT
        changing = True
        while changing:
            changing = False
            for i in range(len(history), 2):
                if i + 3 < len(history) and history[i+2] - history[i+1] <= DROPOFF_TIME_LIMIT or history[i+2] <= history[i+1]:
                    history = history[:i + 1] + history[i + 3:]
                    changing = True
                    break
        return history

    def track_devices(self):
        now = time.time()
        remove = []
        global DROPOFF_TIME_LIMIT
        for mac, device in self.network['devices'].items():
            if now - device['last_seen'] > DROPOFF_TIME_LIMIT:
                if 'activity' in device and device['activity'][1] == -1:
                    self.changes = True
                    device['activity'][1] = now

                    # TODO: text on starred devices

                    # history format is [join, leave, join, leave, ...] janky due to lack of schema options
                    if 'history' not in device:
                        device['history'] = []
                    device['history'] += device['activity']
                    del (device['activity'])

                    # truncate to 10 join/leave pairs, probably want this to be a lot more
                    device['history'] = self.refine_history(device['history'])[-20:]
                elif 'history' not in device:
                    # if no activity tracking or history, just drop
                    remove.append(mac)

        for mac in remove:
            del (self.network['devices'][mac])

    def print_network(self):
        if len(self.network['devices']) > 0:
            # call print before write
            print('Network SSID: {}\nWriting Changes: {}'.format(self.ssid, self.changes))
            for mac, device in self.network['devices'].items():
                print('\tDevice: {}, Vendor: {}'.format(mac, device['vendor']))
                if 'activity' in device:
                    print('\t\tJoined: {}, Last Seen: {} seconds ago'.format(
                        datetime.utcfromtimestamp(device['activity'][0]).strftime('%Y-%m-%d %H:%M:%S'),
                        int((time.time() - device['last_seen']))))
                if 'history' in device:
                    print('\t\tHistory: {}'.format(
                        list(map(lambda ts: datetime.utcfromtimestamp(ts).strftime('%m-%d %H:%M'), device['history']))))
            print()

def ssid_is_dirty(ssid):
    return ssid.startswith('unknown_ssid_') or '[NULL]' in ssid or '~unassociated_devices' == ssid

def flatten_dict(d):
    def expand(key, value):
        if isinstance(value, dict):
            return [(key + '.' + k, v) for k, v in flatten_dict(value).items()]
        else:
            return [(key, value)]

    items = [item for k, v in d.items() for item in expand(k, v)]
    return dict(items)

def parse_wifi_map(map_path, networks):
    with open(map_path, 'r') as f:
        data = f.read()

    wifi_map = yaml.load(data)
    devices = set()

    if not wifi_map:
        return

    os.system('clear')
    global DROPOFF_TIME_LIMIT
    for ssid in wifi_map:
        if ssid_is_dirty(ssid):
            continue

        ssid_node = wifi_map[ssid]

        if ssid not in networks:
            current_network = Network(ssid, db)
        else:
            current_network = networks[ssid]

        for bssid in ssid_node:
            bssid_node = ssid_node[bssid]
            if 'devices' in bssid_node:
                now = time.time()
                for device_mac, device in bssid_node['devices'].items():
                    if not device['vendor']:
                        continue
                    device['mac'] = device_mac
                    if device_mac in current_network.network['devices'] \
                            and 'activity' not in current_network.network['devices'][device_mac] \
                            and now - device['last_seen'] < DROPOFF_TIME_LIMIT:
                        # TODO: still buggy I think, using time.time() for the... time... being :(
                        # device['activity'] = [device['last_seen'], -1]
                        device['activity'] = [now, -1]

                        # TODO: text on starred devices

                    current_network.add_device(device)
                    devices |= {device_mac}

        current_network.track_devices()
        current_network.print_network()
        current_network.write()
        networks[ssid] = current_network

    print('\n\nSSID count: {}, Device count: {}'.format(
        len(wifi_map), len(devices)))
    
    global reads, writes
    print('\nReads: {}, Writes: {}'.format(reads,writes))
    reads = writes = 0


class Event(FileSystemEventHandler):
    def __init__(self, networks):
        self.networks = networks

    def on_modified(self, event):
        if event.src_path.endswith('wifi_map.yaml'):
            parse_wifi_map('wifi_map.yaml', self.networks)


# NOTE: do not run this mode for long periods of time unless you want to get a big bill
def engage_demo_mode():
    global MAX_WRITE_WINDOW, DROPOFF_TIME_LIMIT
    MAX_WRITE_WINDOW = 15    # seconds
    DROPOFF_TIME_LIMIT = 30  # seconds


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == '--demo':
        engage_demo_mode()
        print('DEMO MODE ENGAGED, data usage will be excessive, you have been warned!')

    networks_dict = dict()
    cred = credentials.ApplicationDefault()
    firebase_admin.initialize_app(cred, {
        'projectId': 'surveyor-11d22',
    })
    db = firestore.client()
    event_handler = Event(networks_dict)
    observer = Observer()
    observer.schedule(event_handler, '.', recursive=True)
    observer.start()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
