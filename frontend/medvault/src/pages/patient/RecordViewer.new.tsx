import React, { useEffect, useState } from 'react';
import { getMedicalRecord, grantRecordAccess } from '../../utils/petra-simple';

interface MedicalRecord {
  id: string;
  patientAddress: string;
  doctorAddress: string;
  title: string;
  description: string;
  recordType: string;
  createdAt: string;
  encryptionKey?: string;
  ipfsHash?: string;
  transactionHash?: string;
  accessList?: string[];
}

const RecordViewer: React.FC = () => {
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAccessControl, setShowAccessControl] = useState(false);
  const [newDoctorAddress, setNewDoctorAddress] = useState('');
  const [grantingAccess, setGrantingAccess] = useState(false);

  useEffect(() => {
    const loadRecord = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const recordId = urlParams.get('id');
        
        if (!recordId) {
          throw new Error('No record ID provided');
        }

        const recordData = await getMedicalRecord(recordId);
        if (!recordData) {
          throw new Error('Record not found');
        }

        setRecord(recordData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load record');
      } finally {
        setLoading(false);
      }
    };

    loadRecord();
  }, []);

  const handleGrantAccess = async () => {
    if (!record || !newDoctorAddress.trim()) return;

    setGrantingAccess(true);
    try {
      const success = await grantRecordAccess(record.id, newDoctorAddress.trim());
      if (success) {
        // Update local record with new access
        const updatedRecord = {
          ...record,
          accessList: [...(record.accessList || []), newDoctorAddress.trim()]
        };
        setRecord(updatedRecord);
        setNewDoctorAddress('');
        alert('Access granted successfully!');
      } else {
        throw new Error('Failed to grant access');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to grant access');
    } finally {
      setGrantingAccess(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#666' }}>Loading medical record...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#ff4d4f', marginBottom: '20px' }}>{error}</div>
        <a href="/patient" style={{ color: '#1890ff' }}>← Back to Dashboard</a>
      </div>
    );
  }

  if (!record) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#666', marginBottom: '20px' }}>Record not found</div>
        <a href="/patient" style={{ color: '#1890ff' }}>← Back to Dashboard</a>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <a href="/patient" style={{ color: '#1890ff', textDecoration: 'none' }}>← Back to Dashboard</a>
      </div>

      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', marginBottom: '5px' }}>
              {record.title}
            </h1>
            <div style={{ fontSize: '14px', color: '#999', textTransform: 'uppercase', marginBottom: '10px' }}>
              {record.recordType}
            </div>
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            {new Date(record.createdAt).toLocaleDateString()}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>Medical Details</h3>
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#fafafa', 
            borderRadius: '6px',
            lineHeight: '1.6',
            color: '#333'
          }}>
            {record.description}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>Record Information</h3>
          <div style={{ display: 'grid', gap: '10px', fontSize: '14px' }}>
            <div>
              <strong>Record ID:</strong> 
              <span style={{ fontFamily: 'monospace', backgroundColor: '#f0f0f0', padding: '2px 6px', borderRadius: '3px', marginLeft: '10px' }}>
                {record.id}
              </span>
            </div>
            <div>
              <strong>Doctor:</strong> 
              <span style={{ fontFamily: 'monospace', marginLeft: '10px' }}>
                {record.doctorAddress.substring(0, 10)}...{record.doctorAddress.substring(record.doctorAddress.length - 8)}
              </span>
            </div>
            <div>
              <strong>Created:</strong> {new Date(record.createdAt).toLocaleString()}
            </div>
            {record.transactionHash && (
              <div>
                <strong>Transaction:</strong> 
                <span style={{ fontFamily: 'monospace', marginLeft: '10px' }}>
                  {record.transactionHash}
                </span>
              </div>
            )}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>Security & Storage</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {record.encryptionKey && (
              <span style={{ 
                fontSize: '12px', 
                backgroundColor: '#f6ffed', 
                color: '#52c41a', 
                padding: '4px 8px', 
                borderRadius: '4px',
                border: '1px solid #b7eb8f'
              }}>
                🔐 AES Encrypted
              </span>
            )}
            {record.ipfsHash && (
              <span style={{ 
                fontSize: '12px', 
                backgroundColor: '#e6f7ff', 
                color: '#1890ff', 
                padding: '4px 8px', 
                borderRadius: '4px',
                border: '1px solid #91d5ff'
              }}>
                📎 IPFS: {record.ipfsHash.substring(0, 8)}...
              </span>
            )}
            <span style={{ 
              fontSize: '12px', 
              backgroundColor: '#fff7e6', 
              color: '#fa8c16', 
              padding: '4px 8px', 
              borderRadius: '4px',
              border: '1px solid #ffd591'
            }}>
              ⛓️ Blockchain Verified
            </span>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', margin: 0 }}>
              Access Control ({record.accessList ? record.accessList.length : 0} authorized)
            </h3>
            <button
              onClick={() => setShowAccessControl(!showAccessControl)}
              style={{
                padding: '6px 12px',
                backgroundColor: '#52c41a',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              {showAccessControl ? 'Hide' : 'Manage Access'}
            </button>
          </div>

          {record.accessList && record.accessList.length > 0 && (
            <div style={{ marginBottom: '15px' }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Authorized Addresses:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {record.accessList.map((address: string, index: number) => (
                  <div
                    key={index}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#f0f8ff',
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                      fontSize: '14px',
                      border: '1px solid #d9d9d9'
                    }}
                  >
                    {address === record.patientAddress ? '👤 ' : '👨‍⚕️ '}
                    {address.substring(0, 10)}...{address.substring(address.length - 8)}
                    {address === record.patientAddress && (
                      <span style={{ color: '#52c41a', marginLeft: '10px' }}>(You)</span>
                    )}
                    {address === record.doctorAddress && address !== record.patientAddress && (
                      <span style={{ color: '#1890ff', marginLeft: '10px' }}>(Doctor)</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {showAccessControl && (
            <div style={{ 
              padding: '15px', 
              backgroundColor: '#f9f9f9', 
              borderRadius: '6px',
              border: '1px solid #d9d9d9'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Grant Access to Doctor</h4>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <input
                  type="text"
                  value={newDoctorAddress}
                  onChange={(e) => setNewDoctorAddress(e.target.value)}
                  placeholder="Enter doctor's wallet address (0x...)"
                  disabled={grantingAccess}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '14px'
                  }}
                />
                <button
                  onClick={handleGrantAccess}
                  disabled={grantingAccess || !newDoctorAddress.trim()}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: grantingAccess || !newDoctorAddress.trim() ? '#d9d9d9' : '#1890ff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: grantingAccess || !newDoctorAddress.trim() ? 'not-allowed' : 'pointer'
                  }}
                >
                  {grantingAccess ? 'Granting...' : 'Grant Access'}
                </button>
              </div>
              <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
                ⚠️ Only grant access to trusted medical professionals. This action is recorded on the blockchain.
              </p>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
          <a
            href={`/verify?record=${record.id}`}
            style={{
              padding: '10px 20px',
              backgroundColor: '#722ed1',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px'
            }}
          >
            🔍 Verify Record
          </a>
          <button
            onClick={() => {
              navigator.clipboard.writeText(record.id);
              alert('Record ID copied to clipboard');
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            📋 Copy Record ID
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecordViewer;
