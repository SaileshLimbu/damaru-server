import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

// Generate RSA key pair
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

console.log('Pubic key');
console.log(publicKey);
console.log('Private key');
console.log(privateKey);
const directory = '/home/dpesmdr/Projects/damaru/damaru-node';
fs.writeFileSync(path.join(directory, 'public.pem'), publicKey);
fs.writeFileSync(path.join(directory, 'private.pem'), privateKey);
console.log('RSA Key pair generated and saved as public.pem and private.pem');
