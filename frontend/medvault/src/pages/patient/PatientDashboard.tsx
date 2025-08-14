import React, { useState, useEffect, useRef } from 'react';
import { getPatientRecords, grantRecordAccess } from '../../utils/petra-simple';
import { getVerificationDashboard, comprehensiveRecordVerification } from '../../utils/blockchain';
import { DEPLOYMENT_CONFIG } from '../../utils/deployment';
import Verification from '../../components/Verification';

const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';

const PatientDashboard: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [patientAddress, setPatientAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<string>('');
  const [doctorAddress, setDoctorAddress] = useState('');
  const [grantingAccess, setGrantingAccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'records' | 'verification'>('records');
  const [verificationDashboard, setVerificationDashboard] = useState<any>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [blockchainStatus, setBlockchainStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [newRecordsCount, setNewRecordsCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadPatientData();
    
    // Set up auto-refresh every 30 seconds
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        checkForNewRecords();
      }, 30000);
    }

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh]);

  const loadPatientData = async () => {
    try {
      setLoading(true);
      
      // Get patient address from Petra
      if (window.aptos) {
        const account = await window.aptos.account();
        setPatientAddress(account.address);
        
        // Load both local and blockchain records
        await loadRecordsFromMultipleSources(account.address);
        
        // Check blockchain connectivity
        await checkBlockchainConnection();
      }
      
    } catch (error) {
      console.error('Failed to load patient data:', error);
      setBlockchainStatus('disconnected');
    } finally {
      setLoading(false);
      setLastUpdate(new Date());
    }
  };

  const loadRecordsFromMultipleSources = async (address: string) => {
    try {
      // Load from local storage (existing records)
      const localRecords = await getPatientRecords(address);
      
      // Query blockchain for new records
      const blockchainRecords = await queryBlockchainForRecords(address);
      
      // Merge and deduplicate records
      const allRecords = mergeRecords(localRecords, blockchainRecords);
      setRecords(allRecords);
      
      // Check if there are new records
      const newCount = blockchainRecords.filter(br => 
        !localRecords.some(lr => lr.transactionHash === br.transactionHash)
      ).length;
      setNewRecordsCount(newCount);
      
    } catch (error) {
      console.error('Error loading records from multiple sources:', error);
      // Fallback to local records only
      const localRecords = await getPatientRecords(address);
      setRecords(localRecords);
    }
  };

  const queryBlockchainForRecords = async (patientAddress: string): Promise<any[]> => {
    try {
      const response = await fetch(
        `${DEPLOYMENT_CONFIG.NODE_URL}/accounts/${patientAddress}/transactions?limit=100`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      
      const transactions = await response.json();
      
      // Filter for MedVault transactions
      const medvaultRecords = transactions
        .filter((tx: any) => 
          tx.success && 
          tx.payload?.function?.includes('medvault') &&
          (tx.payload?.function?.includes('create_medical_record') || 
           tx.payload?.function?.includes(DEPLOYMENT_CONFIG.MODULE_ADDRESS))
        )
        .map((tx: any) => ({
          id: tx.hash,
          transactionHash: tx.hash,
          title: `Medical Record - ${new Date(parseInt(tx.timestamp) / 1000).toLocaleDateString()}`,
          recordType: 'Blockchain Record',
          createdAt: new Date(parseInt(tx.timestamp) / 1000).toISOString(),
          doctorAddress: tx.sender,
          patientAddress: patientAddress,
          isBlockchainRecord: true,
          blockchainVerified: true,
          timestamp: tx.timestamp,
          gasUsed: tx.gas_used,
          success: tx.success,
          accessList: [tx.sender, patientAddress], // Default access
          ipfsHash: tx.payload?.arguments?.[2] || null, // Assuming IPFS hash in args
          encryptionKey: 'blockchain-encrypted'
        }));
      
      return medvaultRecords;
    } catch (error) {
      console.error('Error querying blockchain for records:', error);
      return [];
    }
  };

  const mergeRecords = (localRecords: any[], blockchainRecords: any[]): any[] => {
    const merged = [...localRecords];
    
    // Add blockchain records that don't exist locally
    blockchainRecords.forEach(br => {
      if (!merged.some(lr => lr.transactionHash === br.transactionHash || lr.id === br.id)) {
        merged.push(br);
      }
    });
    
    // Sort by creation date (newest first)
    return merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const checkBlockchainConnection = async () => {
    try {
      setBlockchainStatus('checking');
      const response = await fetch(`${DEPLOYMENT_CONFIG.NODE_URL}/`);
      if (response.ok) {
        setBlockchainStatus('connected');
      } else {
        setBlockchainStatus('disconnected');
      }
    } catch (error) {
      setBlockchainStatus('disconnected');
    }
  };

  const checkForNewRecords = async () => {
    if (!patientAddress) return;
    
    try {
      console.log('🔄 Checking for new records...');
      const currentRecords = records;
      await loadRecordsFromMultipleSources(patientAddress);
      
      // Update last refresh time
      setLastUpdate(new Date());
      
    } catch (error) {
      console.error('Error checking for new records:', error);
    }
  };

  const handleManualRefresh = async () => {
    if (loading) return;
    await loadPatientData();
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
    if (!autoRefresh) {
      // Start auto-refresh
      intervalRef.current = setInterval(() => {
        checkForNewRecords();
      }, 30000);
    } else {
      // Stop auto-refresh
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };

  const handleGrantAccess = async () => {
    if (!selectedRecordId || !doctorAddress.trim()) {
      alert('Please enter a valid doctor address');
      return;
    }

    setGrantingAccess(true);
    try {
      const success = await grantRecordAccess(selectedRecordId, doctorAddress.trim());
      if (success) {
        alert('Access granted successfully!');
        setShowAccessModal(false);
        setDoctorAddress('');
        setSelectedRecordId('');
        // Reload records to show updated access
        await loadPatientData();
      } else {
        throw new Error('Failed to grant access');
      }
    } catch (error: any) {
      alert('Error granting access: ' + error.message);
    } finally {
      setGrantingAccess(false);
    }
  };

  const navigateToRecord = (recordId: string) => {
    window.location.href = `/patient/record/${recordId}`;
  };

  const navigateToVerify = () => {
    window.location.href = '/verify';
  };

  const openAccessModal = (recordId: string) => {
    setSelectedRecordId(recordId);
    setShowAccessModal(true);
  };

  // Count unique doctors with access
  const uniqueDoctors = new Set(records.map(record => record.doctorAddress)).size;
  
  // Count recent records (last 30 days)
  const recentRecords = records.filter(record => {
    const recordDate = new Date(record.createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return recordDate > thirtyDaysAgo;
  }).length;

  // Count blockchain vs local records
  const blockchainRecords = records.filter(record => record.isBlockchainRecord).length;

  // Group records by type
  const recordsByType = records.reduce((acc, record) => {
    acc[record.recordType] = (acc[record.recordType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#666' }}>Loading your medical records...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px', color: '#1890ff' }}>
          🧑‍💼 Patient Dashboard
        </h1>
        <p style={{ color: '#666', fontSize: '16px' }}>
          Welcome to your personal health record dashboard. View and manage your medical records securely.
        </p>

        {/* Development Mode Indicator */}
        {DEV_MODE && (
          <div style={{
            padding: '12px',
            margin: '15px 0',
            backgroundColor: '#fff7e6',
            border: '1px solid #ffa940',
            borderRadius: '6px',
            color: '#d48806'
          }}>
            <strong>🧪 Development Mode Active</strong>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>
              Application is running in dev mode. Records and transactions are simulated for development and testing.
            </p>
          </div>
        )}

        {patientAddress && (
          <div style={{ 
            marginTop: '15px', 
            padding: '10px 15px', 
            backgroundColor: '#f0f8ff', 
            borderRadius: '6px', 
            border: '1px solid #bfdbfe' 
          }}>
            <strong>Your Wallet Address:</strong>
            <div style={{ 
              fontFamily: 'monospace', 
              fontSize: '14px', 
              color: '#1e40af', 
              marginTop: '5px',
              wordBreak: 'break-all'
            }}>
              {patientAddress}
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(patientAddress);
                  alert('Wallet address copied to clipboard!');
                }}
                style={{
                  padding: '4px 8px',
                  backgroundColor: '#1890ff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                📋 Copy Address
              </button>
              
              {/* Blockchain Status */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                backgroundColor: blockchainStatus === 'connected' ? '#f6ffed' : 
                                 blockchainStatus === 'disconnected' ? '#fff2f0' : '#fff7e6',
                color: blockchainStatus === 'connected' ? '#52c41a' : 
                       blockchainStatus === 'disconnected' ? '#ff4d4f' : '#fa8c16'
              }}>
                {blockchainStatus === 'connected' && '🟢 Blockchain Connected'}
                {blockchainStatus === 'disconnected' && '🔴 Blockchain Offline'}
                {blockchainStatus === 'checking' && '🟡 Checking...'}
              </div>
              
              {/* Auto-refresh toggle */}
              <button
                onClick={toggleAutoRefresh}
                style={{
                  padding: '4px 8px',
                  backgroundColor: autoRefresh ? '#52c41a' : '#d9d9d9',
                  color: autoRefresh ? 'white' : '#666',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                {autoRefresh ? '� Auto-Refresh ON' : '⏸️ Auto-Refresh OFF'}
              </button>
              
              {/* Manual refresh */}
              <button
                onClick={handleManualRefresh}
                disabled={loading}
                style={{
                  padding: '4px 8px',
                  backgroundColor: loading ? '#ccc' : '#722ed1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? '⏳ Loading...' : '🔄 Refresh Now'}
              </button>
            </div>
            
            {/* Last update info */}
            <div style={{ 
              fontSize: '11px', 
              color: '#999', 
              marginTop: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
              {newRecordsCount > 0 && (
                <span style={{
                  backgroundColor: '#ff4d4f',
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  fontSize: '10px'
                }}>
                  {newRecordsCount} new record{newRecordsCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', 
        borderBottom: '2px solid #f0f0f0',
        marginBottom: '30px'
      }}>
        <button
          onClick={() => setActiveTab('records')}
          style={{
            padding: '12px 24px',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'records' ? '3px solid #1890ff' : '3px solid transparent',
            color: activeTab === 'records' ? '#1890ff' : '#666',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          📋 My Records
        </button>
        <button
          onClick={() => setActiveTab('verification')}
          style={{
            padding: '12px 24px',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'verification' ? '3px solid #1890ff' : '3px solid transparent',
            color: activeTab === 'verification' ? '#1890ff' : '#666',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          🔍 Verification Center
        </button>
      </div>

      {/* Records Tab Content */}
      {activeTab === 'records' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>📋 My Records</h3>
              <p style={{ color: '#666', marginBottom: '15px' }}>
                {records.length} medical records available
              </p>
              <button 
                onClick={() => window.location.href = '#records-section'}
                style={{ 
              display: 'inline-block', 
              padding: '10px 20px', 
              backgroundColor: '#1890ff', 
              color: 'white', 
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            View All Records
          </button>
        </div>

        <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>🔐 Access Control</h3>
          <p style={{ color: '#666', marginBottom: '15px' }}>
            Manage doctor access to your records
          </p>
          <button 
            onClick={() => window.location.href = '#access-control-section'}
            style={{ 
              display: 'inline-block', 
              padding: '10px 20px', 
              backgroundColor: '#52c41a', 
              color: 'white', 
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Manage Access
          </button>
        </div>

        <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>🔍 Verify Records</h3>
          <p style={{ color: '#666', marginBottom: '15px' }}>Verify authenticity of medical certificates</p>
          <button 
            onClick={navigateToVerify}
            style={{ 
              display: 'inline-block', 
              padding: '10px 20px', 
              backgroundColor: '#722ed1', 
              color: 'white', 
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Verify Now
          </button>
        </div>
      </div>

      {/* Record Types Overview */}
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>📊 Health Overview</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f0f8ff', borderRadius: '6px' }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1890ff' }}>{records.length}</div>
            <div style={{ color: '#666', fontSize: '14px' }}>Total Records</div>
          </div>
          <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f6ffed', borderRadius: '6px' }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#52c41a' }}>{blockchainRecords}</div>
            <div style={{ color: '#666', fontSize: '14px' }}>Blockchain Records</div>
          </div>
          <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#fff7e6', borderRadius: '6px' }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#fa8c16' }}>{uniqueDoctors}</div>
            <div style={{ color: '#666', fontSize: '14px' }}>Authorized Doctors</div>
          </div>
          <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f9f0ff', borderRadius: '6px' }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#722ed1' }}>{recentRecords}</div>
            <div style={{ color: '#666', fontSize: '14px' }}>Recent Records</div>
          </div>
        </div>

        {/* Record Types Breakdown */}
        {Object.keys(recordsByType).length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h4 style={{ marginBottom: '15px', color: '#333' }}>📋 Records by Type</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
              {Object.entries(recordsByType).map(([type, count]) => (
                <div
                  key={type}
                  style={{
                    padding: '10px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '4px',
                    textAlign: 'center',
                    border: '1px solid #e9ecef'
                  }}
                >
                  <div style={{ fontWeight: 'bold', color: '#495057' }}>{count as number}</div>
                  <div style={{ fontSize: '12px', color: '#6c757d' }}>{type}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Access Control Section */}
      <div id="access-control-section" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>🔐 Access Control Management</h3>
        
        {records.length > 0 ? (
          <div>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Grant access to doctors for specific medical records. Only authorized doctors can view your encrypted data.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
              {records.map((record, index) => (
                <div
                  key={index}
                  style={{
                    padding: '15px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '6px',
                    backgroundColor: '#fafafa'
                  }}
                >
                  <div style={{ fontWeight: 'bold', color: '#333', marginBottom: '5px' }}>
                    {record.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#999', marginBottom: '10px' }}>
                    {record.recordType} • {new Date(record.createdAt).toLocaleDateString()}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
                    Access granted to: {record.accessList ? record.accessList.length : 1} address(es)
                  </div>
                  <button
                    onClick={() => openAccessModal(record.id)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#52c41a',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Grant Access
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
            No records available to manage access for.
          </p>
        )}
      </div>

      {/* Records Section */}
      <div id="records-section">
        {/* Recent Records */}
        {records.length > 0 && (
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>📋 Your Medical Records</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {records.slice(0, 10).map((record, index) => (
                <div
                  key={index}
                  style={{
                    padding: '15px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '6px',
                    backgroundColor: '#fafafa'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#333' }}>{record.title}</div>
                      <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase' }}>
                        {record.recordType}
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {new Date(record.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '10px', color: '#666', fontSize: '14px' }}>
                    Doctor: {record.doctorAddress.substring(0, 10)}...{record.doctorAddress.substring(record.doctorAddress.length - 8)}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {record.isBlockchainRecord && (
                      <span style={{ 
                        fontSize: '12px', 
                        backgroundColor: '#f6ffed', 
                        color: '#52c41a', 
                        padding: '2px 8px', 
                        borderRadius: '4px',
                        fontWeight: 'bold'
                      }}>
                        ⛓️ Blockchain Verified
                      </span>
                    )}
                    {record.ipfsHash && (
                      <span style={{ 
                        fontSize: '12px', 
                        backgroundColor: '#e6f7ff', 
                        color: '#1890ff', 
                        padding: '2px 8px', 
                        borderRadius: '4px' 
                      }}>
                        📎 IPFS Stored
                      </span>
                    )}
                    {record.encryptionKey && (
                      <span style={{ 
                        fontSize: '12px', 
                        backgroundColor: '#f6ffed', 
                        color: '#52c41a', 
                        padding: '2px 8px', 
                        borderRadius: '4px' 
                      }}>
                        🔐 Encrypted
                      </span>
                    )}
                    {record.transactionHash && (
                      <span style={{ 
                        fontSize: '12px', 
                        backgroundColor: '#f9f0ff', 
                        color: '#722ed1', 
                        padding: '2px 8px', 
                        borderRadius: '4px' 
                      }}>
                        🔗 TX: {record.transactionHash.substring(0, 8)}...
                      </span>
                    )}
                    <button
                      onClick={() => navigateToRecord(record.id)}
                      style={{ 
                        fontSize: '12px', 
                        backgroundColor: '#722ed1', 
                        color: 'white', 
                        padding: '4px 8px', 
                        borderRadius: '4px',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => openAccessModal(record.id)}
                      style={{ 
                        fontSize: '12px', 
                        backgroundColor: '#52c41a', 
                        color: 'white', 
                        padding: '4px 8px', 
                        borderRadius: '4px',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      Grant Access
                    </button>
                    {record.transactionHash && (
                      <button
                        onClick={() => window.open(`https://explorer.aptoslabs.com/txn/${record.transactionHash}?network=testnet`, '_blank')}
                        style={{ 
                          fontSize: '12px', 
                          backgroundColor: '#fa8c16', 
                          color: 'white', 
                          padding: '4px 8px', 
                          borderRadius: '4px',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        🔍 View on Explorer
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {records.length === 0 && (
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>📋</div>
            <h3 style={{ color: '#333', marginBottom: '10px' }}>No Medical Records Yet</h3>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Your medical records will appear here when doctors create them for you.
            </p>
            <p style={{ color: '#999', fontSize: '14px' }}>
              Share your wallet address with your doctor to get started.
            </p>
          </div>
        )}
      </div>

      {/* Access Modal */}
      {showAccessModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Grant Doctor Access</h3>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Enter the doctor's wallet address to grant them access to this medical record.
            </p>
            
            <input
              type="text"
              value={doctorAddress}
              onChange={(e) => setDoctorAddress(e.target.value)}
              placeholder="Enter doctor's wallet address (0x...)"
              disabled={grantingAccess}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '14px',
                marginBottom: '20px'
              }}
            />
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowAccessModal(false);
                  setDoctorAddress('');
                  setSelectedRecordId('');
                }}
                disabled={grantingAccess}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f5f5f5',
                  color: '#333',
                  border: '1px solid #d9d9d9',
                  borderRadius: '4px',
                  cursor: grantingAccess ? 'not-allowed' : 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleGrantAccess}
                disabled={grantingAccess || !doctorAddress.trim()}
                style={{
                  padding: '10px 20px',
                  backgroundColor: grantingAccess || !doctorAddress.trim() ? '#d9d9d9' : '#1890ff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: grantingAccess || !doctorAddress.trim() ? 'not-allowed' : 'pointer'
                }}
              >
                {grantingAccess ? 'Granting Access...' : 'Grant Access'}
              </button>
            </div>
            
            <p style={{ fontSize: '12px', color: '#666', margin: '15px 0 0 0' }}>
              ⚠️ Only grant access to trusted medical professionals. This action is recorded on the blockchain.
            </p>
          </div>
        </div>
      )}

          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#1e40af' }}>💡 Quick Tip</h4>
            <p style={{ margin: 0, color: '#1e40af' }}>
              Your medical records are encrypted and stored securely on IPFS. Only you control who can access them.
            </p>
          </div>
        </div>
      )}

      {/* Verification Tab Content */}
      {activeTab === 'verification' && (
        <div>
          <Verification patientAddress={patientAddress} />
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
