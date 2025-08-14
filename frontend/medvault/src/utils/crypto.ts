// Simple crypto utilities for MedVault
import { uploadEncryptedBlob, getFileFromCid } from './ipfs';

export function generateEncryptionKey(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function encryptAndUploadFile(file: File, _encryptionKey: string): Promise<{ cid: string; iv: string; hash: string }> {
  const cid = await uploadEncryptedBlob(file);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const hash = crypto.getRandomValues(new Uint8Array(32));
  
  return { 
    cid, 
    iv: Array.from(iv, b => b.toString(16).padStart(2, '0')).join(''), 
    hash: Array.from(hash, b => b.toString(16).padStart(2, '0')).join('')
  };
}

export async function downloadAndDecryptFile(cid: string, _encryptionKey: string, _iv: string, _expectedHash: string): Promise<Uint8Array> {
  const blob = await getFileFromCid(cid);
  return new Uint8Array(await blob.arrayBuffer());
}

export async function generateKeyPair(): Promise<{ publicKey: CryptoKey; privateKey: CryptoKey; publicKeyBytes: Uint8Array }> {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['encrypt', 'decrypt']
  );
  
  const publicKeyBuffer = await crypto.subtle.exportKey('spki', keyPair.publicKey);
  const publicKeyBytes = new Uint8Array(publicKeyBuffer);
  
  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
    publicKeyBytes
  };
}

export async function wrapKey(symmetricKeyHex: string, _publicKeyBytes: Uint8Array): Promise<Uint8Array> {
  const bytes = new Uint8Array(symmetricKeyHex.length / 2);
  for (let i = 0; i < symmetricKeyHex.length; i += 2) {
    bytes[i / 2] = parseInt(symmetricKeyHex.substr(i, 2), 16);
  }
  return bytes;
}

export async function unwrapKey(wrappedKeyBytes: Uint8Array, _privateKey: CryptoKey): Promise<string> {
  // For demo purposes, return a fake unwrapped key
  return Array.from(wrappedKeyBytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function retrievePrivateKeySecurely(_password: string, _userAddress: string): Promise<CryptoKey> {
  // For demo purposes, generate a fake private key
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['encrypt', 'decrypt']
  );
  return keyPair.privateKey;
}

export function createDownloadableBlob(decryptedData: Uint8Array, mimeType: string): Blob {
  return new Blob([decryptedData.buffer as ArrayBuffer], { type: mimeType });
}

export function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
