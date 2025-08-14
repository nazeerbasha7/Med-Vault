import React, { useState, useEffect } from 'react';
import { isPetraAvailable, connectPetra, getPetraAccount, createOrganization, getUserOrganization } from '../../utils/petra-simple';

const AdminDashboard: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string>('');
  const [orgName, setOrgName] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [userOrganization, setUserOrganization] = useState<any>(null);

  useEffect(() => {
    checkConnection();
  }, []);

  useEffect(() => {
    if (isConnected && account) {
      loadUserOrganization();
    }
  }, [isConnected, account]);

  const loadUserOrganization = async () => {
    try {
      const org = await getUserOrganization(account);
      setUserOrganization(org);
    } catch (error) {
      console.error('Error loading user organization:', error);
    }
  };

  const checkConnection = async () => {
    if (isPetraAvailable()) {
      try {
        const acc = await getPetraAccount();
        setAccount(acc.address);
        setIsConnected(true);
      } catch (error) {
        console.log('Not connected');
      }
    }
  };

  const handleConnect = async () => {
    try {
      setLoading(true);
      const acc = await connectPetra();
      setAccount(acc.address);
      setIsConnected(true);
      setStatus('Connected successfully!');
    } catch (error) {
      setStatus(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrg = async () => {
    if (!orgName.trim()) {
      setStatus('Please enter organization name');
      return;
    }

    try {
      setLoading(true);
      setStatus('Creating organization on blockchain...');
      const result = await createOrganization(orgName);
      setStatus('✅ Organization created successfully!');
      setOrgName('');
      // Reload user organization
      await loadUserOrganization();
    } catch (error) {
      setStatus(`❌ ${error instanceof Error ? error.message : 'Failed to create organization'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '24px', color: '#1890ff' }}>
        🏥 Admin Dashboard
      </h1>

      {/* Wallet Connection */}
      <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        {!isConnected ? (
          <div>
            <p style={{ marginBottom: '15px' }}>Connect your Petra wallet to manage organizations</p>
            <button 
              onClick={handleConnect}
              disabled={loading || !isPetraAvailable()}
              style={{ 
                padding: '10px 20px', 
                backgroundColor: isPetraAvailable() ? '#1890ff' : '#ccc', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: isPetraAvailable() ? 'pointer' : 'not-allowed' 
              }}
            >
              {loading ? 'Connecting...' : isPetraAvailable() ? 'Connect Petra Wallet' : 'Petra Wallet Not Found'}
            </button>
          </div>
        ) : (
          <div>
            <p style={{ color: '#52c41a', marginBottom: '10px' }}>✅ Wallet Connected</p>
            <p style={{ fontSize: '14px', color: '#666' }}>Address: {account}</p>
          </div>
        )}
      </div>

      {/* Create Organization */}
      {isConnected && !userOrganization && (
        <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>🏨 Create Your Organization</h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '15px' }}>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="Enter organization name"
              style={{ 
                padding: '10px', 
                border: '1px solid #ddd', 
                borderRadius: '4px', 
                flex: 1,
                fontSize: '14px'
              }}
            />
            <button
              onClick={handleCreateOrg}
              disabled={loading}
              style={{ 
                padding: '10px 20px', 
                backgroundColor: '#52c41a', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Creating...' : 'Create Organization'}
            </button>
          </div>
          {status && (
            <p style={{ 
              color: status.includes('❌') || status.includes('failed') ? '#ff4d4f' : '#52c41a',
              fontSize: '14px',
              margin: '10px 0 0 0'
            }}>
              {status}
            </p>
          )}
        </div>
      )}

      {/* User Organization */}
      {isConnected && userOrganization && (
        <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>🏨 Your Organization</h3>
          <div style={{ padding: '15px', border: '1px solid #e8e8e8', borderRadius: '8px', backgroundColor: '#fafafa' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>{userOrganization.name}</h4>
                <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
                  Created: {new Date(userOrganization.createdAt).toLocaleDateString()}
                </p>
                <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#999' }}>
                  Doctors: {userOrganization.doctorCount || 0}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <a 
                  href="/admin/doctors" 
                  style={{ 
                    padding: '8px 16px', 
                    backgroundColor: '#52c41a', 
                    color: 'white', 
                    textDecoration: 'none', 
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                >
                  Manage Doctors
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <p style={{ marginBottom: '30px', color: '#666' }}>
        Organization administration interface for managing hospitals and medical staff.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>🏨 Organizations</h3>
          <p style={{ color: '#666', marginBottom: '15px' }}>Manage healthcare organizations and hospitals</p>
          <button style={{ padding: '10px 20px', backgroundColor: '#1890ff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            View Organizations
          </button>
        </div>

        <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>👨‍⚕️ Doctors</h3>
          <p style={{ color: '#666', marginBottom: '15px' }}>Register and manage medical professionals</p>
          <a href="/admin/doctors" style={{ display: 'inline-block', padding: '10px 20px', backgroundColor: '#52c41a', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
            Manage Doctors
          </a>
        </div>

        <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>📊 Analytics</h3>
          <p style={{ color: '#666', marginBottom: '15px' }}>View system usage and statistics</p>
          <button style={{ padding: '10px 20px', backgroundColor: '#722ed1', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            View Reports
          </button>
        </div>

        <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>⚙️ Settings</h3>
          <p style={{ color: '#666', marginBottom: '15px' }}>Configure system settings and permissions</p>
          <button style={{ padding: '10px 20px', backgroundColor: '#fa8c16', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            System Settings
          </button>
        </div>
      </div>

      <div style={{ padding: '20px', backgroundColor: '#f0f8ff', borderRadius: '8px' }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>🚀 Quick Actions</h3>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <button style={{ padding: '10px 20px', backgroundColor: '#1890ff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Create Organization
          </button>
          <button style={{ padding: '10px 20px', backgroundColor: '#52c41a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Register Doctor
          </button>
          <button style={{ padding: '10px 20px', backgroundColor: '#722ed1', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            View All Records
          </button>
          <button style={{ padding: '10px 20px', backgroundColor: '#fa8c16', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
