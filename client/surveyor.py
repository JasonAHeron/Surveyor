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


class Network(object):
    changes = False

    def __init__(self, ssid, firestore_connection):
        self.ssid = ssid
        self.firestore_connection = firestore_connection
        self.network_doc = firestore_connection.collection('networks').document(ssid)
        self.network = self.network_doc.get()

        if self.network.exists:
            self.network = self.network.to_dict()
            if not self.network.get('devices'):
                self.network['devices'] = dict()
        else:
            self.changes = True
            self.network = dict()
            self.network['devices'] = dict()
            self.network['ssid'] = self.ssid

    def write(self):
        # don't write when there are no devices
        if self.changes and len(self.network['devices']) > 0:
            self.network_doc.set(self.network)
        self.changes = False

    def add_device(self, device):
        # todo: track join and drop timestamps
        if device['mac'] not in self.network['devices']:
            # only write when necessary
            self.changes = True

        self.network['devices'][device['mac']] = device
        self.network['device_count'] = len(self.network['devices'])

    def track_devices(self):
        now = time.time()
        remove = []
        for mac, device in self.network['devices'].items():
            if now - device['last_seen'] > 600:  # 10 mins
                if 'activity' in device and device['activity'][1] == -1:
                    device['activity'][1] = now

                    # history format is [join, leave, join, leave, ...] janky due to lack of schema options
                    if 'history' not in device:
                        device['history'] = []
                    device['history'] += device['activity']
                    # truncate to 5 join/leave pairs  todo: probably want this to be a lot more
                    device['history'] = device['history'][-10:]

                    del(device['activity'])
                else:
                    # if no activity tracking, just drop
                    remove.append(mac)

        for mac in remove:
            del(self.network['devices'][mac])

    def print_network(self):
        if len(self.network['devices']) > 0:
            # call print before write
            print('Network SSID: {}\nWriting Changes: {}'.format(self.ssid, self.changes))
            for mac, device in self.network['devices'].items():
                print('\tDevice: {}, Vendor: {}'.format(mac, device['vendor']))
                if 'activity' in device:
                    print('\t\tJoined: {}, Last Seen: {} seconds ago'.format(
                        device['activity'][0] // 1, (time.time() - device['last_seen']) // 1))
                if 'history' in device:
                    print('\t\tHistory: {}'.format(device['history']))
            print()


def ssid_is_dirty(ssid):
    return ssid.startswith('unknown_ssid_') or '[NULL]' in ssid or '~unassociated_devices' == ssid


def parse_wifi_map(map_path, networks):
    with open(map_path, 'r') as f:
        data = f.read()

    wifi_map = yaml.load(data)
    devices = set()

    if not wifi_map:
        return

    os.system('clear')
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
                    if 'activity' not in device:
                        device['activity'] = [now, -1]
                    current_network.add_device(device)
                    devices |= {device_mac}

        current_network.track_devices()
        current_network.print_network()
        current_network.write()
        networks[ssid] = current_network

    print('\n\nSSID count: {}, Device count: {}'.format(
        len(wifi_map), len(devices)))


class Event(FileSystemEventHandler):
    def __init__(self, networks):
        self.networks = networks

    def on_modified(self, event):
        if event.src_path.endswith('wifi_map.yaml'):
            parse_wifi_map('wifi_map.yaml', self.networks)


if __name__ == "__main__":
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
