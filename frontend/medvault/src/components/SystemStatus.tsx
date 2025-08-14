import React from 'react';

const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';
const MODULE_ADDR = import.meta.env.VITE_MODULE_ADDR;
const NODE_URL = import.meta.env.VITE_NODE_URL;
const NETWORK = import.meta.env.VITE_NETWORK || 'testnet';

interface SystemStatusProps {
  compact?: boolean;
}

const SystemStatus: React.FC<SystemStatusProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <div style={{
        padding: '10px',
        backgroundColor: DEV_MODE ? '#fff7e6' : '#f6ffed',
        border: `1px solid ${DEV_MODE ? '#ffa940' : '#b7eb8f'}`,
        borderRadius: '6px',
        marginBottom: '15px'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          fontSize: '14px' 
        }}>
          <span style={{ color: DEV_MODE ? '#d48806' : '#52c41a' }}>
            {DEV_MODE ? '🧪 Development Mode' : '✅ Production Mode'}
          </span>
          <span style={{ color: '#666' }}>
            {NETWORK.toUpperCase()} • {DEV_MODE ? 'Simulated' : 'Live'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '20px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      marginBottom: '20px'
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>📊 System Status</h3>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px'
      }}>
        <div style={{
          padding: '15px',
          backgroundColor: DEV_MODE ? '#fff7e6' : '#f6ffed',
          borderRadius: '6px',
          border: `1px solid ${DEV_MODE ? '#ffa940' : '#b7eb8f'}`
        }}>
          <div style={{ fontWeight: 'bold', color: DEV_MODE ? '#d48806' : '#52c41a' }}>
            {DEV_MODE ? '🧪 Development' : '🚀 Production'}
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
            {DEV_MODE ? 'Simulated transactions' : 'Live blockchain'}
          </div>
        </div>

        <div style={{
          padding: '15px',
          backgroundColor: '#f0f8ff',
          borderRadius: '6px',
          border: '1px solid #bfdbfe'
        }}>
          <div style={{ fontWeight: 'bold', color: '#1890ff' }}>
            🔗 {NETWORK.charAt(0).toUpperCase() + NETWORK.slice(1)}
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
            Aptos network
          </div>
        </div>

        <div style={{
          padding: '15px',
          backgroundColor: '#f9f0ff',
          borderRadius: '6px',
          border: '1px solid #d3adf7'
        }}>
          <div style={{ fontWeight: 'bold', color: '#722ed1' }}>
            🔐 AES-256
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
            Encryption active
          </div>
        </div>

        <div style={{
          padding: '15px',
          backgroundColor: '#fff2e8',
          borderRadius: '6px',
          border: '1px solid #ffbb96'
        }}>
          <div style={{ fontWeight: 'bold', color: '#fa8c16' }}>
            📁 {DEV_MODE ? 'Mock IPFS' : 'IPFS'}
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
            File storage
          </div>
        </div>
      </div>

      {/* Configuration Details */}
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '14px' }}>Configuration</h4>
        <div style={{ fontSize: '12px', color: '#666' }}>
          <div>Contract: {MODULE_ADDR ? `${MODULE_ADDR.substring(0, 10)}...${MODULE_ADDR.substring(MODULE_ADDR.length - 8)}` : 'Not configured'}</div>
          <div>Node: {NODE_URL || 'Default'}</div>
          <div>Mode: {DEV_MODE ? 'Development (transactions simulated)' : 'Production (live blockchain)'}</div>
        </div>
      </div>
    </div>
  );
};

export default SystemStatus;
