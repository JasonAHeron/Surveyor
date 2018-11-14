

class Network(object):
    devices = {}

    def __init__(self, ssid, firestore_connection):
        self.ssid = ssid
        self.firestore_connection = firestore_connection
        self.network_doc = firestore_connection.collection('networks').document(ssid)
        self.network = self.network_doc.get()
        if self.network.exists:
            self.network = self.network.to_dict()
            self.devices = self.network.get('devices')
            print(self.devices)
        else:
            self.network = dict()
            self.network['ssid'] = self.ssid

    def write(self):
        print('writing network', self.network)
        self.network_doc.set(self.network)

    def add_device(self, device):
        print('adding device', device)
        self.network['devices'][device['mac']] = device
        self.network['device_count'] = len(self.network['devices'])
