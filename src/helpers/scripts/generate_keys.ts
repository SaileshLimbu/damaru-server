import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

// Generate RSA key pair (PKCS#1 format)
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048, // Key size in bits
  publicKeyEncoding: {
    type: 'pkcs1',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs1',
    format: 'pem'
  }
});

// Convert PKCS#1 public key to X.509 format
const x509PublicKey = crypto.createPublicKey(publicKey).export({
  type: 'spki', // X.509 format
  format: 'pem'
});

console.log('X.509 Public Key:', x509PublicKey);
const directory = '/home/dpesmdr/Projects/damaru/damaru-node';
fs.writeFileSync(path.join(directory, 'public.pem'), x509PublicKey);
fs.writeFileSync(path.join(directory, 'private.pem'), privateKey);

console.log('Pubic key');
console.log(publicKey);
console.log('Private key');
console.log(privateKey);

console.log('RSA Key pair generated and saved as public.pem and private.pem');
