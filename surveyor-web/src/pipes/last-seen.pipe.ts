import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({name: 'lastSeen'})
export class LastSeenPipe implements PipeTransform {
  transform(value: number): string {
    return moment.unix(value).fromNow()
  }
}