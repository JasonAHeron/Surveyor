import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AngularFirestore } from 'angularfire2/firestore';
import { Network } from 'src/models/network';
import * as moment from 'moment';
import * as d3shape from 'd3-shape';

class ActivityRange {
  range: number[]
  constructor(range: number[], currentActivity?: number[]) {
    if(currentActivity){
      range.push(currentActivity[0], (Date.now() / 1000));
    }
    this.range = range.map(Math.floor);
  }

  inRange(time: moment.Moment): number {
    for (let index = 0; index < this.range.length; index += 2) {
      const frameStart = this.range[index];
      const frameEnd = this.range[index + 1];
      if (time.isBetween(moment.unix(frameStart), moment.unix(frameEnd))) {
        return 1
      }
    }
    return 0;
  }
}

@Component({
  selector: 'app-network-details-page',
  templateUrl: './network-details-page.component.html',
  styleUrls: ['./network-details-page.component.css']
})
export class NetworkDetailsPageComponent implements OnInit {
  ssid: Observable<string>
  network: Observable<Network>
  activityGraph: any = []
  values = Object.values;
  shape = d3shape.curveStep;

  constructor(
    private readonly aFirestore: AngularFirestore,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) { }

  ngOnInit() {
    this.ssid = this.route.paramMap.pipe(map(paramMap => paramMap['params']['ssid']), shareReplay(1));
    this.network = this.ssid.pipe(
      switchMap(ssid => this.aFirestore.collection<Network>('networks').doc(ssid).valueChanges()),
      map(network => network as Network),
      tap(network => {
        let deviceNum = 0
        for (let device of Object.values(network.devices)) {
          if (device.history) {
            const deviceGraph = { 'name': device.name ? device.name : 'unnamed_device' + deviceNum, 'series': [] };
            const deviceHistoryRange = new ActivityRange(device.history, device.activity);
            for (let time = 0; time < 144; time++) {
              const timeToCheck = moment().subtract(1440 - (time * 10), 'minutes');
              deviceGraph['series'].push({ 'name': timeToCheck.fromNow(), 'value': deviceHistoryRange.inRange(timeToCheck)});
            }
            this.activityGraph.push(deviceGraph);
          }
          deviceNum++;
        }
        this.activityGraph = JSON.parse(JSON.stringify(this.activityGraph));        
      }),
      shareReplay(1)
    );
  }

  navigateBack(){
    this.router.navigate(['/']);
  }

}
