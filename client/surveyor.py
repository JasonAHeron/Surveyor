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


def ssid_is_dirty(ssid):
    return ssid.startswith('unknown_ssid_') or '[NULL]' in ssid or '~unassociated_devices' == ssid

def parse_wifi_map(map_path, ssids):
    with open(map_path, 'r') as f:
        data = f.read()

    wifi_map = yaml.load(data)
    devices = set()

    if not wifi_map:
        return

    os.system('clear')
    print('*' * 40)
    for ssid in wifi_map:
        if ssid_is_dirty(ssid):
            continue
        print('Clean SSID Found = {}'.format(ssid))
        ssid_node = wifi_map[ssid]
        network_doc_ref = db.collection('networks').document(ssid)

        if ssid not in ssids:
            if not network_doc_ref.get().exists:
                network_doc_ref.set({
                    'ssid': ssid,
                })
            ssids |= {ssid}

        for bssid in ssid_node:
            bssid_node = ssid_node[bssid]
            if 'devices' in bssid_node:
                for device_mac, device in bssid_node['devices'].items():
                    if not device['vendor']:
                        continue
                    dev_ref = network_doc_ref.collection('devices').document(device_mac)
                    dev_ref.set({
                        'mac': device_mac,
                        'vendor': device['vendor'],
                        'last_seen': device['last_seen']
                    })
                    devices |= {device_mac}
                    print('\tdevice = {}, vendor = {}, last_seen = {} seconds ago'.format(
                        device_mac, device['vendor'], time.time() - device['last_seen']))

    print('\n\nSSID count: {}, Device count: {}'.format(
        len(wifi_map), len(devices)))


class Event(FileSystemEventHandler):
    def __init__(self, ssids):
        self.ssids = ssids

    def on_modified(self, event):
        if event.src_path.endswith('wifi_map.yaml'):
            parse_wifi_map('wifi_map.yaml', self.ssids)


if __name__ == "__main__":
    ssids = set()
    cred = credentials.ApplicationDefault()
    firebase_admin.initialize_app(cred, {
        'projectId': 'surveyor-11d22',
    })
    db = firestore.client()
    event_handler = Event(ssids)
    observer = Observer()
    observer.schedule(event_handler, '.', recursive=True)
    observer.start()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
