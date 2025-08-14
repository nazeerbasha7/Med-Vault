// Cryptographic utilities for MedVault using libsodium
import sodium from 'libsodium-wrappers';

// Initialize libsodium
let sodiumReady = false;

export async function initializeCrypto(): Promise<void> {
  if (!sodiumReady) {
    await sodium.ready;
    sodiumReady = true;
  }
}

/**
 * Generate AES key for symmetric encryption
 */
export async function generateAesKey(): Promise<Uint8Array> {
  await initializeCrypto();
  return sodium.randombytes_buf(sodium.crypto_secretbox_KEYBYTES);
}

/**
 * Generate key pair for asymmetric encryption
 */
export async function generateKeyPair(): Promise<{ publicKey: Uint8Array; privateKey: Uint8Array }> {
  await initializeCrypto();
  const keyPair = sodium.crypto_box_keypair();
  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
  };
}

/**
 * Encrypt blob using AEAD (authenticated encryption)
 */
export async function encryptBlob(aesKey: Uint8Array, arrayBuffer: ArrayBuffer): Promise<{ iv: Uint8Array; cipher: Uint8Array }> {
  await initializeCrypto();
  
  const data = new Uint8Array(arrayBuffer);
  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
  const cipher = sodium.crypto_secretbox_easy(data, nonce, aesKey);
  
  return {
    iv: nonce,
    cipher: cipher
  };
}

/**
 * Decrypt blob using AEAD
 */
export async function decryptBlob(aesKey: Uint8Array, iv: Uint8Array, cipher: Uint8Array): Promise<ArrayBuffer> {
  await initializeCrypto();
  
  const decrypted = sodium.crypto_secretbox_open_easy(cipher, iv, aesKey);
  return decrypted.buffer;
}

/**
 * Wrap AES key for recipient using public key encryption (crypto_box_seal)
 */
export async function wrapKeyForRecipient(aesKey: Uint8Array, recipientPublicKey: Uint8Array): Promise<Uint8Array> {
  await initializeCrypto();
  
  return sodium.crypto_box_seal(aesKey, recipientPublicKey);
}

/**
 * Unwrap AES key using recipient's key pair
 */
export async function unwrapKeyForRecipient(wrappedKey: Uint8Array, recipientKeyPair: { publicKey: Uint8Array; privateKey: Uint8Array }): Promise<Uint8Array> {
  await initializeCrypto();
  
  return sodium.crypto_box_seal_open(wrappedKey, recipientKeyPair.publicKey, recipientKeyPair.privateKey);
}

/**
 * Convert Uint8Array to Array<number> for blockchain
 */
export function uint8ArrayToNumberArray(arr: Uint8Array): number[] {
  return Array.from(arr);
}

/**
 * Convert Array<number> to Uint8Array from blockchain
 */
export function numberArrayToUint8Array(arr: number[]): Uint8Array {
  return new Uint8Array(arr);
}

/**
 * Convert hex string to Uint8Array
 */
export function hexToUint8Array(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

/**
 * Convert Uint8Array to hex string
 */
export function uint8ArrayToHex(arr: Uint8Array): string {
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Store key pair in browser storage (with encryption)
 */
export async function storeKeyPair(keyPair: { publicKey: Uint8Array; privateKey: Uint8Array }, userId: string): Promise<void> {
  const storage = {
    publicKey: uint8ArrayToHex(keyPair.publicKey),
    privateKey: uint8ArrayToHex(keyPair.privateKey),
    createdAt: Date.now()
  };
  
  localStorage.setItem(`medvault_keys_${userId}`, JSON.stringify(storage));
}

/**
 * Retrieve key pair from browser storage
 */
export async function retrieveKeyPair(userId: string): Promise<{ publicKey: Uint8Array; privateKey: Uint8Array } | null> {
  const stored = localStorage.getItem(`medvault_keys_${userId}`);
  if (!stored) return null;
  
  try {
    const storage = JSON.parse(stored);
    return {
      publicKey: hexToUint8Array(storage.publicKey),
      privateKey: hexToUint8Array(storage.privateKey)
    };
  } catch (error) {
    console.error('Failed to retrieve key pair:', error);
    return null;
  }
}

/**
 * Clear stored key pair
 */
export function clearKeyPair(userId: string): void {
  localStorage.removeItem(`medvault_keys_${userId}`);
}

/**
 * Create secure random record ID
 */
export async function generateRecordId(patient: string, doctor: string, timestamp: number): Promise<Uint8Array> {
  await initializeCrypto();
  
  const nonce = sodium.randombytes_buf(16);
  const input = `${patient}|${doctor}|${timestamp}|${uint8ArrayToHex(nonce)}`;
  return sodium.crypto_generichash(32, input);
}
