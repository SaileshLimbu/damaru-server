export class StringUtils {
  static generateRandomAlphaNumeric(length: number = 5) {
    return StringUtils.generate('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', length);
  }

  private static generate(charSet: string, length) {
    let result = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charSet.length);
      result += charSet.charAt(randomIndex);
    }
    return result;
  }

  static generateRandomNumeric(length: number = 5) {
    return StringUtils.generate('0123456789', length);
  }
}
