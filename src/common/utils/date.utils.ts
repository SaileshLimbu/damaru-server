import * as moment from 'moment';
import { DurationInputArg2, unitOfTime } from 'moment';

export class DateUtils {
  static readonly today = () => moment().toDate();

  static add(value: number, unit: DurationInputArg2, date?: Date): Date {
    return moment(date).add(value, unit).toDate();
  }

  static diffInDays(date1: Date, date2?: Date, units: unitOfTime.Diff ='days'): number {
    return moment(date1).diff(moment(date2), units);
  }

  static format(format: string, date?: Date){
    return moment(date).format(format)
  }
}
