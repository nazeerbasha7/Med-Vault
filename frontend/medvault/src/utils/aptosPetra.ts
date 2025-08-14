import { 
  Aptos, 
  AptosConfig, 
  Network, 
  Account,
  Ed25519PrivateKey,
  InputEntryFunctionData,
  InputViewFunctionData,
  MoveValue
} from '@aptos-labs/ts-sdk';

// Initialize Aptos client
const aptosConfig = new AptosConfig({ 
  network: import.meta.env.VITE_NETWORK as Network || Network.TESTNET,
  fullnode: import.meta.env.VITE_NODE_URL
});

export const aptos = new Aptos(aptosConfig);

// Module configuration
export const MODULE_ADDRESS = import.meta.env.VITE_MODULE_ADDR || "0x1";
export const MODULE_NAME = "medvault";

// Petra wallet integration
declare global {
  interface Window {
    aptos?: {
      connect(): Promise<{ address: string; publicKey: string }>;
      disconnect(): Promise<void>;
      signAndSubmitTransaction(transaction: any): Promise<{ hash: string }>;
      signMessage(message: any): Promise<{ signature: string }>;
      account(): Promise<{ address: string; publicKey: string }>;
      isConnected(): Promise<boolean>;
      network(): Promise<string>;
    };
  }
}

export interface WalletInfo {
  address: string;
  publicKey: string;
}

/**
 * Connect to Petra wallet
 */
export async function connectPetra(): Promise<WalletInfo> {
  try {
    if (!window.aptos) {
      throw new Error('Petra wallet not found. Please install Petra wallet extension.');
    }

    const response = await window.aptos.connect();
    return {
      address: response.address,
      publicKey: response.publicKey
    };
  } catch (error) {
    console.error('Failed to connect to Petra:', error);
    throw error;
  }
}

/**
 * Disconnect from Petra wallet
 */
export async function disconnectPetra(): Promise<void> {
  try {
    if (window.aptos) {
      await window.aptos.disconnect();
    }
  } catch (error) {
    console.error('Failed to disconnect from Petra:', error);
    throw error;
  }
}

/**
 * Check if Petra is connected
 */
export async function isPetraConnected(): Promise<boolean> {
  try {
    if (!window.aptos) return false;
    return await window.aptos.isConnected();
  } catch {
    return false;
  }
}

/**
 * Get current account info
 */
export async function getCurrentAccount(): Promise<WalletInfo | null> {
  try {
    if (!window.aptos) return null;
    const isConnected = await window.aptos.isConnected();
    if (!isConnected) return null;
    
    const account = await window.aptos.account();
    return {
      address: account.address,
      publicKey: account.publicKey
    };
  } catch {
    return null;
  }
}

/**
 * Sign and submit entry function transaction
 */
export async function signAndSubmitEntryFunction(
  functionName: string,
  args: Array<MoveValue>,
  typeArgs: string[] = []
): Promise<string> {
  try {
    if (!window.aptos) {
      throw new Error('Petra wallet not connected');
    }

    const functionFullName = `${MODULE_ADDRESS}::${MODULE_NAME}::${functionName}`;
    
    const payload: InputEntryFunctionData = {
      function: functionFullName,
      functionArguments: args,
      typeArguments: typeArgs,
    };

    const response = await window.aptos.signAndSubmitTransaction({
      type: "entry_function_payload",
      ...payload
    });

    return response.hash;
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
}

/**
 * Call view function
 */
export async function viewFunction(
  functionName: string,
  args: Array<MoveValue> = [],
  typeArgs: string[] = []
): Promise<any> {
  try {
    const functionFullName = `${MODULE_ADDRESS}::${MODULE_NAME}::${functionName}`;
    
    const payload: InputViewFunctionData = {
      function: functionFullName,
      functionArguments: args,
      typeArguments: typeArgs,
    };

    const result = await aptos.view({ payload });
    return result;
  } catch (error) {
    console.error('View function call failed:', error);
    throw error;
  }
}

/**
 * Wait for transaction confirmation
 */
export async function waitForTransaction(txHash: string): Promise<any> {
  try {
    const txResult = await aptos.waitForTransaction({ 
      transactionHash: txHash,
      options: {
        checkSuccess: true
      }
    });
    return txResult;
  } catch (error) {
    console.error('Transaction wait failed:', error);
    throw error;
  }
}

/**
 * Get transaction details
 */
export async function getTransaction(txHash: string): Promise<any> {
  try {
    return await aptos.getTransactionByHash({ transactionHash: txHash });
  } catch (error) {
    console.error('Failed to get transaction:', error);
    throw error;
  }
}

/**
 * Helper to convert strings to byte arrays for Move
 */
export function stringToBytes(str: string): number[] {
  return Array.from(new TextEncoder().encode(str));
}

/**
 * Helper to convert byte arrays to strings
 */
export function bytesToString(bytes: number[]): string {
  return new TextDecoder().decode(new Uint8Array(bytes));
}

/**
 * Helper to convert hex string to byte array
 */
export function hexToBytes(hex: string): number[] {
  const bytes = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substr(i, 2), 16));
  }
  return bytes;
}

/**
 * Helper to convert byte array to hex string
 */
export function bytesToHex(bytes: number[]): string {
  return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Get explorer URL for transaction
 */
export function getExplorerUrl(txHash: string): string {
  const baseUrl = import.meta.env.VITE_APTOS_EXPLORER_URL || 'https://explorer.aptoslabs.com';
  return `${baseUrl}/txn/${txHash}?network=${import.meta.env.VITE_NETWORK || 'testnet'}`;
}

/**
 * Get account balance
 */
export async function getAccountBalance(address: string): Promise<number> {
  try {
    const resources = await aptos.getAccountResources({ accountAddress: address });
    const coinResource = resources.find(r => r.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>');
    if (coinResource && 'coin' in coinResource.data) {
      return parseInt((coinResource.data as any).coin.value);
    }
    return 0;
  } catch (error) {
    console.error('Failed to get account balance:', error);
    return 0;
  }
}
    orgId: string
  ): AptosTransaction {
    return this.createTransactionPayload('register_doctor', [
      doctorAddr,
      doctorHandle,
      licenseHash,
      orgId,
    ]);
  }

  activateDoctorPayload(doctorAddr: string): AptosTransaction {
    return this.createTransactionPayload('activate_doctor', [doctorAddr]);
  }

  deactivateDoctorPayload(doctorAddr: string): AptosTransaction {
    return this.createTransactionPayload('deactivate_doctor', [doctorAddr]);
  }

  registerUserKeyPayload(publicKeyBytes: number[]): AptosTransaction {
    return this.createTransactionPayload('register_user_key', [publicKeyBytes]);
  }

  createRecordPayload(
    recordId: number[],
    patientAddr: string,
    doctorHandle: string,
    fileType: string,
    cid: number[],
    createdAt: string,
    wrappedKeyForPatient: number[]
  ): AptosTransaction {
    return this.createTransactionPayload('create_record', [
      recordId,
      patientAddr,
      doctorHandle,
      fileType,
      cid,
      createdAt,
      wrappedKeyForPatient,
    ]);
  }

  grantAccessPayload(
    recordId: number[],
    granteeAddr: string,
    wrappedKeyForGrantee: number[]
  ): AptosTransaction {
    return this.createTransactionPayload('grant_access', [
      recordId,
      granteeAddr,
      wrappedKeyForGrantee,
    ]);
  }

  revokeAccessPayload(recordId: number[], granteeAddr: string): AptosTransaction {
    return this.createTransactionPayload('revoke_access', [recordId, granteeAddr]);
  }

  revokeRecordPayload(recordId: number[]): AptosTransaction {
    return this.createTransactionPayload('revoke_record', [recordId]);
  }

  // View function helpers - these will be called via REST API
  async callViewFunction(functionName: string, args: any[]): Promise<any> {
    try {
      const response = await fetch(`${this.nodeUrl}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          function: `${this.moduleAddress}::medvault::${functionName}`,
          type_arguments: [],
          arguments: args,
        }),
      });

      if (!response.ok) {
        throw new Error(`View function call failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error(`Failed to call view function ${functionName}:`, error);
      throw error;
    }
  }

  async getRecordHeader(recordId: number[]): Promise<any> {
    return this.callViewFunction('get_record_header', [recordId]);
  }

  async listRecordsOf(patientAddr: string): Promise<number[][]> {
    return this.callViewFunction('list_records_of', [patientAddr]);
  }

  async getWrappedKey(recordId: number[], viewerAddr: string): Promise<number[] | null> {
    return this.callViewFunction('get_wrapped_key', [recordId, viewerAddr]);
  }

  async getUserPublicKey(userAddr: string): Promise<number[] | null> {
    return this.callViewFunction('get_user_public_key', [userAddr]);
  }

  async getOrganization(orgId: string): Promise<any> {
    return this.callViewFunction('get_organization', [orgId]);
  }

  async getDoctorInfo(doctorAddr: string): Promise<any> {
    return this.callViewFunction('get_doctor_info', [doctorAddr]);
  }

  async isDoctorActive(doctorAddr: string): Promise<boolean> {
    const result = await this.callViewFunction('is_doctor_active', [doctorAddr]);
    return result === true;
  }

  // Helper function to get transaction details
  async getTransaction(txHash: string): Promise<any> {
    try {
      const response = await fetch(`${this.nodeUrl}/transactions/by_hash/${txHash}`);
      if (!response.ok) {
        throw new Error(`Failed to get transaction: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get transaction:', error);
      throw error;
    }
  }

  // Helper function to get account balance
  async getAccountBalance(address: string): Promise<number> {
    try {
      const response = await fetch(`${this.nodeUrl}/accounts/${address}/resources`);
      if (!response.ok) {
        throw new Error(`Failed to get account resources: ${response.statusText}`);
      }
      
      const resources = await response.json();
      const coinResource = resources.find(
        (resource: any) => resource.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>'
      );
      return coinResource?.data ? parseInt(coinResource.data.coin.value) : 0;
    } catch (error) {
      console.error('Failed to get account balance:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const aptosService = new AptosService();
