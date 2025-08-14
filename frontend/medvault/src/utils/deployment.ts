// Deployment configuration for MedVault smart contracts

// Testnet deployment to match Petra wallet connection
const DEPLOYED_MODULE_ADDR = '0x97a225d875749b3619ba5e8ad9d9aec6b316a9bc9365fe8777c8819385159b83';

export const DEPLOYMENT_CONFIG = {
  MODULE_ADDRESS: DEPLOYED_MODULE_ADDR,
  NETWORK: 'testnet', // Switch to testnet to match Petra
  NODE_URL: 'https://fullnode.testnet.aptoslabs.com/v1',
};

// Production mode active
export const DEV_MODE = false;

console.log('📦 MedVault Configuration:');
console.log('MODULE_ADDRESS:', DEPLOYMENT_CONFIG.MODULE_ADDRESS);
console.log('NETWORK:', DEPLOYMENT_CONFIG.NETWORK);
console.log('NODE_URL:', DEPLOYMENT_CONFIG.NODE_URL);
console.log('DEV_MODE:', DEV_MODE);

// Mock responses (unused in production mode)
export const MOCK_RESPONSES = {
  CREATE_ORG: {
    success: true,
    hash: '0x123456789abcdef',
    message: 'Organization created successfully (mock mode)'
  },
  REGISTER_DOCTOR: {
    success: true,
    hash: '0x987654321fedcba',
    message: 'Doctor registered successfully (mock mode)'
  }
};
