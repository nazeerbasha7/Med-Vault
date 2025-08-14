// Hash utilities for MedVault
import CryptoJS from 'crypto-js';

// Create SHA-256 hash of a string
export function hashString(input: string): string {
  return CryptoJS.SHA256(input).toString(CryptoJS.enc.Hex);
}

// Create SHA-256 hash of bytes
export function hashBytes(input: Uint8Array): Uint8Array {
  const wordArray = CryptoJS.lib.WordArray.create(input as any);
  const hash = CryptoJS.SHA256(wordArray);
  const hashBytes = new Uint8Array(32);
  
  for (let i = 0; i < 8; i++) {
    const word = hash.words[i];
    hashBytes[i * 4] = (word >>> 24) & 0xff;
    hashBytes[i * 4 + 1] = (word >>> 16) & 0xff;
    hashBytes[i * 4 + 2] = (word >>> 8) & 0xff;
    hashBytes[i * 4 + 3] = word & 0xff;
  }
  
  return hashBytes;
}

// Create deterministic record ID
export function createRecordId(
  patientAddr: string,
  doctorAddr: string,
  timestamp: number,
  nonce: string
): Uint8Array {
  const input = `${patientAddr}|${doctorAddr}|${timestamp}|${nonce}`;
  return hashBytes(new TextEncoder().encode(input));
}

// Create license hash for doctors
export function createLicenseHash(licenseNumber: string, doctorName: string): string {
  const input = `${licenseNumber}|${doctorName}|${Date.now()}`;
  return hashString(input);
}

// Create organization ID hash
export function createOrgId(orgName: string, adminAddr: string): string {
  const input = `${orgName}|${adminAddr}|${Date.now()}`;
  return hashString(input).substring(0, 16); // Shorter org ID
}

// Utility to convert Uint8Array to hex string
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Utility to convert hex string to Uint8Array
export function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

// Convert Uint8Array to number array for Move calls
export function bytesToArray(bytes: Uint8Array): number[] {
  return Array.from(bytes);
}

// Convert number array to Uint8Array
export function arrayToBytes(array: number[]): Uint8Array {
  return new Uint8Array(array);
}

// Generate a random nonce
export function generateNonce(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Validate Aptos address format
export function isValidAptosAddress(address: string): boolean {
  const aptosAddressRegex = /^0x[a-fA-F0-9]{1,64}$/;
  return aptosAddressRegex.test(address);
}

// Normalize Aptos address (ensure proper format)
export function normalizeAptosAddress(address: string): string {
  if (!address.startsWith('0x')) {
    address = '0x' + address;
  }
  return address.toLowerCase();
}

// Create a deterministic seed for key generation (not recommended for production)
export function createDeterministicSeed(input: string): Uint8Array {
  const hash = hashString(input);
  return hexToBytes(hash);
}

// Validate record ID format
export function isValidRecordId(recordId: Uint8Array): boolean {
  return recordId.length === 32; // SHA-256 hash length
}

// Create a short display ID for UI (first 8 chars of hex)
export function createDisplayId(bytes: Uint8Array): string {
  return bytesToHex(bytes).substring(0, 8);
}
