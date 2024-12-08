import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import { DecryptedPayload } from './DecryptedPayload';
import { Json } from '../../common/interfaces/json';
import { HashUtils } from '../../common/utils/hash.utils';

@Injectable()
export class EncryptionService {
  private readonly publicKey: string;
  private readonly privateKey: string;

  private static readonly AES_ALGORITHM = 'aes-256-ecb';
  private static readonly ENCODING_BASE64 = 'base64';
  private static readonly ENCODING_UTF8 = 'utf8';

  constructor(private readonly configService: ConfigService) {
    // Load public and private keys from files
    this.publicKey = fs.readFileSync(this.configService.get<string>('PUBLIC_KEY'), EncryptionService.ENCODING_UTF8);
    this.privateKey = fs.readFileSync(this.configService.get<string>('PRIVATE_KEY'), EncryptionService.ENCODING_UTF8);
  }

  // AES-ECB Encryption
  aesEncrypt(data: string, aesKey: string): string {
    const cipher = crypto.createCipheriv(EncryptionService.AES_ALGORITHM, HashUtils.sha256Hash(aesKey), null);
    cipher.setAutoPadding(true);
    const encrypted = Buffer.concat([cipher.update(Buffer.from(data, EncryptionService.ENCODING_UTF8)), cipher.final()]);
    return encrypted.toString(EncryptionService.ENCODING_BASE64); // Match Java's output format
  }

  // AES-ECB Decryption
  aesDecrypt(data: string, aesKey: string): string {
    const hashedKey = HashUtils.sha256Hash(aesKey);
    const decipher = crypto.createDecipheriv(EncryptionService.AES_ALGORITHM, hashedKey, null);
    decipher.setAutoPadding(true); // Ensure padding matches Java's PKCS5Padding
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(data, EncryptionService.ENCODING_BASE64)), // Input is Base64-encoded
      decipher.final()
    ]);
    return decrypted.toString(EncryptionService.ENCODING_UTF8); // Convert decrypted bytes to a UTF-8 string
  }

  // RSA Encryption
  rsaEncrypt(key: string): string {
    const bufferData = Buffer.from(key, EncryptionService.ENCODING_UTF8);
    const encrypted = crypto.publicEncrypt(
      {
        key: this.publicKey,
        padding: crypto.constants.RSA_PKCS1_PADDING // Matches Java's PKCS1Padding
      },
      bufferData
    );

    // Return the encrypted data as a Base64 string
    return encrypted.toString(EncryptionService.ENCODING_BASE64);
  }

  // RSA Decryption
  rsaDecrypt(data: string): string {
    return crypto
      .privateDecrypt(
        {
          key: this.privateKey,
          padding: crypto.constants.RSA_PKCS1_PADDING
        },
        Buffer.from(data, EncryptionService.ENCODING_BASE64)
      )
      .toString(EncryptionService.ENCODING_UTF8);
  }

  /**
   * Decrypt a payload where:
   * - The first portion contains the RSA-encrypted AES key in base64
   * - The rest is the AES-encrypted data
   * @param encryptedPayload The full encrypted payload (RSA-encrypted AES key + AES-encrypted data)
   */
  hybridDecrypt(encryptedPayload: string): DecryptedPayload {
    // Split the payload into two parts
    const rsaEncryptedKeyLength = 344; // RSA-2048 encrypted key length in base64
    const rsaEncryptedKey = encryptedPayload.substring(0, rsaEncryptedKeyLength);
    console.log({ rsaEncryptedKey });
    const aesEncryptedData = encryptedPayload.substring(rsaEncryptedKeyLength);
    console.log({ aesEncryptedData });
    const decryptedAesKey = this.rsaDecrypt(rsaEncryptedKey);
    console.log({ decryptedAesKey });
    return { payload: JSON.parse(this.aesDecrypt(aesEncryptedData, decryptedAesKey)) as Json, aesKey: decryptedAesKey };
  }
}
