// IPFS utilities for MedVault
const IPFS_GATEWAY = 'https://dweb.link/ipfs/';

/**
 * Upload a blob to IPFS (simplified for demo)
 */
export async function uploadEncryptedBlob(blob: Blob): Promise<string> {
  // For demo purposes, return a fake CID
  // In production, this would use Web3.Storage or similar
  const fakeHash = Math.random().toString(36).substring(2, 15);
  const fakeCid = `bafy${fakeHash.padEnd(56, '0')}`;
  
  console.log('Uploading to IPFS (demo mode):', blob.size, 'bytes');
  
  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return fakeCid;
}

/**
 * Get a file from IPFS using CID
 */
export async function getFileFromCid(cid: string): Promise<Blob> {
  console.log('Getting file from IPFS (demo mode):', cid);
  
  // For demo purposes, return a fake blob
  const fakeData = new Uint8Array(1024).fill(65); // Array of 'A' characters
  return new Blob([fakeData], { type: 'application/octet-stream' });
}

/**
 * Check if IPFS is configured
 */
export function isIPFSConfigured(): boolean {
  return true; // Always return true for demo
}

/**
 * Get IPFS gateway URL for a CID
 */
export function getIPFSUrl(cid: string, filename?: string): string {
  const baseUrl = `${IPFS_GATEWAY}${cid}`;
  return filename ? `${baseUrl}/${filename}` : baseUrl;
}

/**
 * Validate CID format
 */
export function isValidCID(cid: string): boolean {
  // Basic CID validation - should start with 'Qm' (v0) or 'bafy' (v1)
  return /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|bafy[a-z2-7]{56})$/.test(cid);
}
