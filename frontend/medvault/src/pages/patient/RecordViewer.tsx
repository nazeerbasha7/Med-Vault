import React, { useEffect, useState } from 'react';
import { 
  getCurrentAccount, 
  isPetraConnected, 
  connectPetra,
  logViewAccess,
  getRecordHeader,
  getWrappedKey,
  grantRecordAccess as grantBlockchainAccess,
  bytesToString,
  stringToBytes,
  getExplorerUrl
} from '../../utils/blockchain';
import { downloadAndDecryptFile, unwrapKey, retrievePrivateKeySecurely } from '../../utils/crypto';

interface MedicalRecord {
  recordId: number[];
  patient: string;
  issuingDoctor: string;
  issuingOrg: string;
  doctorHandle: string;
  fileType: string;
  cid: number[];
  createdAt: number;
  revoked: boolean;
  nftTokenAddress?: string;
}

const RecordViewer: React.FC = () => {
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAccessControl, setShowAccessControl] = useState(false);
  const [newDoctorAddress, setNewDoctorAddress] = useState('');
  const [grantingAccess, setGrantingAccess] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<any>(null);
  const [viewingFile, setViewingFile] = useState(false);
  const [txHash, setTxHash] = useState<string>('');
  const [accessVerified, setAccessVerified] = useState(false);

  useEffect(() => {
    initializeAndLoadRecord();
  }, []);

  const initializeAndLoadRecord = async () => {
    try {
      // Check wallet connection
      const connected = await isPetraConnected();
      setWalletConnected(connected);
      
      if (connected) {
        const account = await getCurrentAccount();
        setCurrentAccount(account);
        await loadRecord(account?.address);
      } else {
        setError('Please connect your Petra wallet to view medical records');
        setLoading(false);
      }
    } catch (err) {
      setError('Failed to initialize wallet connection');
      setLoading(false);
    }
  };

  const loadRecord = async (userAddress?: string) => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const recordIdHex = urlParams.get('id');
      
      if (!recordIdHex) {
        throw new Error('No record ID provided');
      }

      // Convert hex record ID to byte array
      const recordId = stringToBytes(recordIdHex);

      // Get record header from blockchain
      const recordHeader = await getRecordHeader(recordId);
      
      if (!recordHeader || recordHeader.length === 0) {
        throw new Error('Record not found on blockchain');
      }

      // Parse record data (this is a simplified version - in reality, you'd parse the Move struct)
      const recordData = recordHeader as MedicalRecord;
      setRecord(recordData);

      // Verify user has access by checking if they can get the wrapped key
      if (userAddress) {
        try {
          const wrappedKey = await getWrappedKey(recordId, userAddress);
          if (wrappedKey && wrappedKey.length > 0) {
            setAccessVerified(true);
            
            // Log the view access (this could charge a small gas fee)
            await logViewAccess(recordId);
          } else {
            setAccessVerified(false);
            setError('You do not have permission to view this record');
          }
        } catch (err) {
          setAccessVerified(false);
          setError('Access verification failed');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load record');
    } finally {
      setLoading(false);
    }
  };

  const connectWallet = async () => {
    try {
      const account = await connectPetra();
      setCurrentAccount(account);
      setWalletConnected(true);
      await loadRecord(account.address);
    } catch (error: any) {
      setError(`Failed to connect wallet: ${error.message}`);
    }
  };

  const handleViewFile = async () => {
    if (!record || !currentAccount) return;

    setViewingFile(true);
    try {
      // Get the wrapped key for this user
      const wrappedKey = await getWrappedKey(record.recordId, currentAccount.address);
      if (!wrappedKey || wrappedKey.length === 0) {
        throw new Error('You do not have access to decrypt this file');
      }

      // Here you would need to retrieve the user's private key
      // This would require a password prompt in a real implementation
      const password = prompt('Enter your decryption password:');
      if (!password) {
        throw new Error('Password required to decrypt file');
      }

      // Retrieve private key
      const privateKey = await retrievePrivateKeySecurely(password, currentAccount.address);
      
      // Unwrap the symmetric key
      const symmetricKey = await unwrapKey(new Uint8Array(wrappedKey), privateKey);
      
      // Get IPFS CID and other metadata
      const cidString = bytesToString(record.cid);
      
      // Download and decrypt the file
      // Note: This would need additional metadata like IV and hash stored in the record
      // For now, this is a simplified implementation
      alert('File decryption functionality requires additional implementation for IV and hash retrieval');
      
    } catch (error: any) {
      alert(`Failed to view file: ${error.message}`);
    } finally {
      setViewingFile(false);
    }
  };

  const handleGrantAccess = async () => {
    if (!record || !newDoctorAddress.trim()) return;

    setGrantingAccess(true);
    try {
      // This would require generating a wrapped key for the new grantee
      // For now, simplified implementation
      const wrappedKeyForGrantee = stringToBytes('placeholder_wrapped_key');
      
      const txResponse = await grantBlockchainAccess({
        recordId: record.recordId,
        granteeAddress: newDoctorAddress.trim(),
        wrappedKeyForGrantee
      });

      setTxHash(txResponse.hash);
      setNewDoctorAddress('');
      alert('Access granted successfully! Transaction: ' + txResponse.hash);
      
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to grant access');
    } finally {
      setGrantingAccess(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#666' }}>🔍 Loading medical record from blockchain...</div>
        {!walletConnected && (
          <div style={{ marginTop: '20px' }}>
            <button onClick={connectWallet} style={{ padding: '10px 20px', backgroundColor: '#1890ff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Connect Petra Wallet
            </button>
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#ff4d4f', marginBottom: '20px' }}>{error}</div>
        {!walletConnected ? (
          <button onClick={connectWallet} style={{ padding: '10px 20px', backgroundColor: '#1890ff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Connect Petra Wallet
          </button>
        ) : (
          <a href="/patient" style={{ color: '#1890ff' }}>← Back to Dashboard</a>
        )}
      </div>
    );
  }

  if (!record) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#666', marginBottom: '20px' }}>Record not found on blockchain</div>
        <a href="/patient" style={{ color: '#1890ff' }}>← Back to Dashboard</a>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <a href="/patient" style={{ color: '#1890ff', textDecoration: 'none' }}>← Back to Dashboard</a>
      </div>

      {/* Wallet Status */}
      {walletConnected && currentAccount && (
        <div style={{
          padding: '10px 15px',
          marginBottom: '20px',
          backgroundColor: accessVerified ? '#f6ffed' : '#fff2f0',
          border: `1px solid ${accessVerified ? '#b7eb8f' : '#ffccc7'}`,
          borderRadius: '6px',
          color: accessVerified ? '#52c41a' : '#ff4d4f'
        }}>
          <strong>{accessVerified ? '✅ Access Verified' : '❌ Access Denied'}</strong>
          <div style={{ fontSize: '12px', marginTop: '5px' }}>
            Connected: {currentAccount.address.substring(0, 10)}...{currentAccount.address.substring(currentAccount.address.length - 8)}
          </div>
        </div>
      )}

      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', marginBottom: '5px' }}>
              Medical Record - {record.fileType}
            </h1>
            <div style={{ fontSize: '14px', color: '#999', textTransform: 'uppercase', marginBottom: '10px' }}>
              {record.doctorHandle}
            </div>
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            {new Date(record.createdAt * 1000).toLocaleDateString()}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>Record Information</h3>
          <div style={{ display: 'grid', gap: '10px', fontSize: '14px' }}>
            <div>
              <strong>Record ID:</strong> 
              <span style={{ fontFamily: 'monospace', backgroundColor: '#f0f0f0', padding: '2px 6px', borderRadius: '3px', marginLeft: '10px' }}>
                {bytesToString(record.recordId)}
              </span>
            </div>
            <div>
              <strong>Patient:</strong> 
              <span style={{ fontFamily: 'monospace', marginLeft: '10px' }}>
                {record.patient.substring(0, 10)}...{record.patient.substring(record.patient.length - 8)}
              </span>
            </div>
            <div>
              <strong>Issuing Doctor:</strong> 
              <span style={{ fontFamily: 'monospace', marginLeft: '10px' }}>
                {record.issuingDoctor.substring(0, 10)}...{record.issuingDoctor.substring(record.issuingDoctor.length - 8)}
              </span>
            </div>
            <div>
              <strong>Organization:</strong> {record.issuingOrg}
            </div>
            <div>
              <strong>Created:</strong> {new Date(record.createdAt * 1000).toLocaleString()}
            </div>
            <div>
              <strong>Status:</strong> 
              <span style={{ 
                color: record.revoked ? '#ff4d4f' : '#52c41a',
                fontWeight: 'bold',
                marginLeft: '10px'
              }}>
                {record.revoked ? '❌ Revoked' : '✅ Active'}
              </span>
            </div>
            {record.nftTokenAddress && (
              <div>
                <strong>NFT Token:</strong> 
                <span style={{ fontFamily: 'monospace', marginLeft: '10px' }}>
                  {record.nftTokenAddress.substring(0, 10)}...{record.nftTokenAddress.substring(record.nftTokenAddress.length - 8)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>Security & Storage</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ 
              fontSize: '12px', 
              backgroundColor: '#f6ffed', 
              color: '#52c41a', 
              padding: '4px 8px', 
              borderRadius: '4px',
              border: '1px solid #b7eb8f'
            }}>
              🔐 AES-256-GCM Encrypted
            </span>
            {record.cid && record.cid.length > 0 && (
              <span style={{ 
                fontSize: '12px', 
                backgroundColor: '#e6f7ff', 
                color: '#1890ff', 
                padding: '4px 8px', 
                borderRadius: '4px',
                border: '1px solid #91d5ff'
              }}>
                📎 IPFS: {bytesToString(record.cid).substring(0, 8)}...
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
              ⛓️ Aptos Blockchain
            </span>
            <span style={{ 
              fontSize: '12px', 
              backgroundColor: '#f6ffed', 
              color: '#52c41a', 
              padding: '4px 8px', 
              borderRadius: '4px',
              border: '1px solid #b7eb8f'
            }}>
              🎫 Soulbound NFT
            </span>
          </div>
        </div>

        {/* File Viewing */}
        {accessVerified && record.cid && record.cid.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>Encrypted Files</h3>
            <button
              onClick={handleViewFile}
              disabled={viewingFile}
              style={{
                padding: '10px 20px',
                backgroundColor: viewingFile ? '#d9d9d9' : '#52c41a',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: viewingFile ? 'not-allowed' : 'pointer',
                marginRight: '10px'
              }}
            >
              {viewingFile ? '🔄 Decrypting...' : '📄 View Encrypted File'}
            </button>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
              ⚠️ Viewing files requires gas fees and your decryption password.
            </p>
          </div>
        )}

        {/* Access Control */}
        {accessVerified && currentAccount?.address === record.patient && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', margin: 0 }}>
                Access Control
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
                    {grantingAccess ? '🔄 Granting...' : '🔗 Grant Access'}
                  </button>
                </div>
                <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
                  ⚠️ Granting access creates a blockchain transaction and charges gas fees.
                </p>
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
          <a
            href={`/verify?record=${bytesToString(record.recordId)}`}
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
              navigator.clipboard.writeText(bytesToString(record.recordId));
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
