// Simple crypto utilities for MedVault (simulation mode)

/**
 * Generate a random encryption key
 */
export function generateEncryptionKey(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Simulate file encryption
 */
export async function encryptFile(file: File, encryptionKey: string): Promise<{ encryptedData: string; hash: string }> {
  try {
    // In real implementation, this would use AES-256-GCM
    // For now, we'll simulate by converting to base64
    const fileData = await fileToBase64(file);
    
    // Simulate encryption by adding key as prefix (not secure, just for demo)
    const encryptedData = btoa(encryptionKey + ':' + fileData);
    
    // Generate a simple hash
    const hash = await generateFileHash(encryptedData);
    
    return {
      encryptedData,
      hash
    };
  } catch (error) {
    console.error('File encryption failed:', error);
    throw new Error('File encryption failed');
  }
}

/**
 * Simulate file decryption
 */
export async function decryptFile(encryptedData: string, encryptionKey: string): Promise<string> {
  try {
    // Simulate decryption
    const decryptedData = atob(encryptedData);
    const [key, ...dataParts] = decryptedData.split(':');
    
    if (key !== encryptionKey) {
      throw new Error('Invalid encryption key');
    }
    
    return dataParts.join(':');
  } catch (error) {
    console.error('File decryption failed:', error);
    throw new Error('File decryption failed');
  }
}

/**
 * Convert file to base64
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
}

/**
 * Generate a simple hash for the data
 */
async function generateFileHash(data: string): Promise<string> {
  // Simple hash simulation - in real implementation use SHA-256
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * Simulate IPFS upload
 */
export async function simulateIPFSUpload(encryptedData: string): Promise<string> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  // Generate a fake IPFS hash
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  const ipfsHash = `Qm${timestamp}${random}`.substring(0, 46);
  
  // Store in localStorage to simulate IPFS
  localStorage.setItem(`ipfs_${ipfsHash}`, encryptedData);
  
  return ipfsHash;
}

/**
 * Simulate IPFS retrieval
 */
export async function simulateIPFSRetrieve(ipfsHash: string): Promise<string> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
  
  const data = localStorage.getItem(`ipfs_${ipfsHash}`);
  if (!data) {
    throw new Error('File not found on IPFS');
  }
  
  return data;
}
