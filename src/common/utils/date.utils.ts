import * as moment from 'moment';
import { DurationInputArg2 } from 'moment';

export class DateUtils {
  static readonly today = () => moment().toDate();

  static add(value: number, unit: DurationInputArg2, date?: Date): Date {
    return moment(date).add(value, unit).toDate();
  }
}
