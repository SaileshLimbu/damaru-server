import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

export class HashUtils {
  private static readonly SHA256_HASHING = 'sha256';

  static async compareHash(nonHashed: string, hashed: string) {
    return await bcrypt.compare(nonHashed, hashed);
  }

  static async hash(plainText: string, saltRounds = 10) {
    return await bcrypt.hash(plainText, saltRounds);
  }

  static sha256Hash(input: string) {
    return crypto.createHash(HashUtils.SHA256_HASHING).update(input).digest();
  }
}
