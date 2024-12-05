import * as bcrypt from 'bcrypt';

export class HashUtils {
  static async compareHash(nonHashed: string, hashed: string) {
    return await bcrypt.compare(nonHashed, hashed);
  }

  static async hash(plainText: string, saltRounds = 10) {
    return await bcrypt.hash(plainText, saltRounds);
  }
}
