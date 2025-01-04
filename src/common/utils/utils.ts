export class Utils {
  static getDefaultScreenShot(screenShotUrl: string, name: string = 'default.png') {
    return `${screenShotUrl}/${name}`;
  }
}
