import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';

@Injectable()
export class EncryptionService {
  private readonly publicKey: string;
  private readonly privateKey: string;

  constructor(private readonly configService: ConfigService) {
    // Load public and private keys from files
    this.publicKey = fs.readFileSync(this.configService.get<string>('PUBLIC_KEY'), 'utf8');
    this.privateKey = fs.readFileSync(this.configService.get<string>('PRIVATE_KEY'), 'utf8');
  }

  private static readonly AES_ALGORITHM = 'aes-256-ecb';

  // AES-ECB Encryption
  aesEncrypt(data: string, aesKey: string): string {
    const cipher = crypto.createCipheriv(EncryptionService.AES_ALGORITHM, aesKey, null);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  // AES-ECB Decryption
  aesDecrypt(data: string, aesKey: string): string {
    const decipher = crypto.createDecipheriv('aes-256-ecb', aesKey, null);
    let decrypted = decipher.update(data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  // RSA Encryption
  rsaEncrypt(data: string): string {
    return crypto.publicEncrypt(this.publicKey, Buffer.from(data)).toString('base64');
  }

  // RSA Decryption
  rsaDecrypt(data: string): string {
    return crypto.privateDecrypt(this.privateKey, Buffer.from(data, 'base64')).toString('utf8');
  }

  /**
   * Decrypt a payload where:
   * - The first portion contains the RSA-encrypted AES key in base64
   * - The rest is the AES-encrypted data
   * @param encryptedPayload The full encrypted payload (RSA-encrypted AES key + AES-encrypted data)
   */
  hybridDecrypt(encryptedPayload: string): string {
    // Split the payload into two parts
    const rsaEncryptedKeyLength = 344; // RSA-2048 encrypted key length in base64
    const rsaEncryptedKey = encryptedPayload.substring(0, rsaEncryptedKeyLength);
    const aesEncryptedData = encryptedPayload.substring(rsaEncryptedKeyLength);

    // Step 1: Decrypt the AES key with RSA
    const decryptedAesKey = this.rsaDecrypt(rsaEncryptedKey);

    // Step 2: Decrypt the data with the decrypted AES key
    return this.aesDecrypt(aesEncryptedData, decryptedAesKey);
  }
}
