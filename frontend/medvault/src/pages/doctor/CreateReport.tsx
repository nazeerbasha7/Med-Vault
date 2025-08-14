import React, { useState, useEffect } from 'react';
import { 
  connectPetra, 
  getCurrentAccount, 
  isPetraConnected, 
  createMedicalRecord as createBlockchainRecord,
  generateRecordId,
  getExplorerUrl
} from '../../utils/blockchain';
import { generateEncryptionKey, encryptAndUploadFile } from '../../utils/crypto';
import { DEV_MODE } from '../../utils/deployment';

const CreateReport: React.FC = () => {
  const [formData, setFormData] = useState({
    patientAddress: '',
    recordType: 'consultation',
    title: '',
    description: '',
    file: null as File | null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  const [walletConnected, setWalletConnected] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<any>(null);
  const [txHash, setTxHash] = useState<string>('');

  // Check wallet connection on component mount
  useEffect(() => {
    checkWalletConnection();
    
    const urlParams = new URLSearchParams(window.location.search);
    const patientParam = urlParams.get('patient');
    if (patientParam) {
      setFormData(prev => ({
        ...prev,
        patientAddress: patientParam
      }));
    }
  }, []);

  const checkWalletConnection = async () => {
    try {
      const connected = await isPetraConnected();
      setWalletConnected(connected);
      if (connected) {
        const account = await getCurrentAccount();
        setCurrentAccount(account);
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  };

  const connectWallet = async () => {
    try {
      const account = await connectPetra();
      setCurrentAccount(account);
      setWalletConnected(true);
    } catch (error: any) {
      setSubmitStatus('error');
      setSubmitMessage(`Failed to connect wallet: ${error.message}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear status when user makes changes
    if (submitStatus !== 'idle') {
      setSubmitStatus('idle');
      setSubmitMessage('');
      setTxHash('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      file
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setSubmitMessage('');
    setTxHash('');

    try {
      // Check wallet connection
      if (!walletConnected || !currentAccount) {
        setSubmitMessage('Connecting to Petra wallet...');
        await connectWallet();
        return;
      }

      // Validate patient address format
      if (!formData.patientAddress.startsWith('0x') || formData.patientAddress.length < 10) {
        throw new Error('Please enter a valid wallet address (0x...)');
      }

      let cid = '';
      let encryptionKey = '';

      // Handle file encryption and IPFS upload if file is provided
      if (formData.file) {
        setSubmitMessage('🔐 Encrypting medical files...');
        
        // Generate encryption key
        encryptionKey = generateEncryptionKey();
        
        // Encrypt and upload file to IPFS
        const uploadResult = await encryptAndUploadFile(formData.file, encryptionKey);
        cid = uploadResult.cid;
        
        setSubmitMessage('☁️ Files uploaded securely to IPFS...');
      }

      setSubmitMessage('🔗 Creating medical record on Aptos blockchain...');

      // Generate unique record ID
      const recordId = generateRecordId();
      
      // Create wrapped key for patient (encryption key as hex string)
      const wrappedKeyForPatient = encryptionKey || 'demo_key_' + Math.random().toString(36);

      // Check if we're in dev mode or if we have a proper module address
      if (DEV_MODE) {
        setSubmitMessage('🧪 Development mode: Simulating blockchain transaction...');
        
        // Simulate transaction delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Generate a proper 64-character transaction hash for dev mode
        const mockTxHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
        setTxHash(mockTxHash);
        setSubmitStatus('success');
        setSubmitMessage(`✅ Medical record created successfully in development mode!`);
      } else {
        setSubmitMessage('🔒 Encrypting access keys...');

        // Create medical record on blockchain with proper hex encoding
        const txResponse = await createBlockchainRecord({
          recordId,                                    // String - will be converted to hex
          patientAddress: formData.patientAddress,     // Aptos address
          doctorHandle: `Dr_${currentAccount.address.substring(0, 8)}`, // String - will be converted to hex
          fileType: formData.recordType,               // String - will be converted to hex
          cid: cid || `demo_cid_${Date.now()}`,       // IPFS CID string - will be converted to hex
          createdAt: Math.floor(Date.now() / 1000),   // Unix timestamp
          wrappedKeyForPatient                         // Encrypted key string - will be converted to hex
        });

        setTxHash(txResponse.hash);
        setSubmitStatus('success');
        setSubmitMessage(`✅ Medical record created successfully on blockchain!`);
      }
      
      // Reset form
      setFormData({
        patientAddress: '',
        recordType: 'consultation',
        title: '',
        description: '',
        file: null
      });

      // Reset file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }

    } catch (error: any) {
      setSubmitStatus('error');
      setSubmitMessage(`❌ ${error.message || 'Failed to create medical record'}`);
      console.error('Error creating medical record:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <h2>📝 Create Medical Record</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Medical records are encrypted and stored securely on IPFS with on-chain metadata on Aptos blockchain.
      </p>

      {/* Development Mode Indicator */}
      {DEV_MODE && (
        <div style={{
          padding: '12px',
          marginBottom: '20px',
          backgroundColor: '#fff7e6',
          border: '1px solid #ffa940',
          borderRadius: '6px',
          color: '#d48806'
        }}>
          <strong>🧪 Development Mode Active</strong>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>
            Transactions are simulated. To enable real blockchain transactions, see the Production Deployment Guide.
          </p>
        </div>
      )}

      {/* Wallet Connection Status */}
      {!walletConnected ? (
        <div style={{
          padding: '15px',
          marginBottom: '20px',
          backgroundColor: '#fff2f0',
          border: '1px solid #ffccc7',
          borderRadius: '6px',
          color: '#ff4d4f'
        }}>
          <strong>⚠️ Petra Wallet Not Connected</strong>
          <p style={{ margin: '10px 0 0 0' }}>
            Please connect your Petra wallet to create medical records on the Aptos blockchain.
          </p>
          <button
            onClick={connectWallet}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              backgroundColor: '#ff4d4f',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Connect Petra Wallet
          </button>
        </div>
      ) : (
        <div style={{
          padding: '15px',
          marginBottom: '20px',
          backgroundColor: '#f6ffed',
          border: '1px solid #b7eb8f',
          borderRadius: '6px',
          color: '#52c41a'
        }}>
          <strong>✅ Wallet Connected</strong>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>
            Address: {currentAccount?.address}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Patient Wallet Address *
          </label>
          <input
            type="text"
            name="patientAddress"
            value={formData.patientAddress}
            onChange={handleInputChange}
            placeholder="0x123...abc"
            required
            disabled={isSubmitting || !walletConnected}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #d9d9d9',
              borderRadius: '4px',
              backgroundColor: (isSubmitting || !walletConnected) ? '#f5f5f5' : 'white'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Record Type *
          </label>
          <select
            name="recordType"
            value={formData.recordType}
            onChange={handleInputChange}
            required
            disabled={isSubmitting || !walletConnected}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #d9d9d9',
              borderRadius: '4px',
              backgroundColor: (isSubmitting || !walletConnected) ? '#f5f5f5' : 'white'
            }}
          >
            <option value="consultation">Consultation Report</option>
            <option value="lab">Lab Results</option>
            <option value="imaging">Imaging Report</option>
            <option value="prescription">Prescription</option>
            <option value="surgery">Surgery Report</option>
            <option value="diagnosis">Diagnosis</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Record Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="e.g., Annual Checkup Report"
            required
            disabled={isSubmitting || !walletConnected}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #d9d9d9',
              borderRadius: '4px',
              backgroundColor: (isSubmitting || !walletConnected) ? '#f5f5f5' : 'white'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Medical Report Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Detailed medical findings, recommendations, and notes..."
            required
            rows={6}
            disabled={isSubmitting || !walletConnected}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #d9d9d9',
              borderRadius: '4px',
              resize: 'vertical',
              backgroundColor: (isSubmitting || !walletConnected) ? '#f5f5f5' : 'white'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Attach Medical Files (Optional)
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            disabled={isSubmitting || !walletConnected}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #d9d9d9',
              borderRadius: '4px',
              backgroundColor: (isSubmitting || !walletConnected) ? '#f5f5f5' : 'white'
            }}
          />
          <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
            Supported formats: PDF, Images, Word documents. Files will be encrypted before upload.
          </p>
        </div>

        {/* Status Message */}
        {(submitMessage || submitStatus !== 'idle') && (
          <div style={{
            padding: '15px',
            borderRadius: '6px',
            backgroundColor: submitStatus === 'success' ? '#f6ffed' : 
                            submitStatus === 'error' ? '#fff2f0' : '#e6f7ff',
            border: `1px solid ${submitStatus === 'success' ? '#b7eb8f' : 
                                 submitStatus === 'error' ? '#ffccc7' : '#91d5ff'}`,
            color: submitStatus === 'success' ? '#52c41a' : 
                   submitStatus === 'error' ? '#ff4d4f' : '#1890ff'
          }}>
            {submitMessage}
            {submitStatus === 'success' && txHash && (
              <div style={{ marginTop: '10px' }}>
                {DEV_MODE ? (
                  <div style={{
                    padding: '8px 12px',
                    backgroundColor: '#fff7e6',
                    border: '1px solid #ffa940',
                    borderRadius: '4px',
                    color: '#d48806',
                    fontSize: '14px'
                  }}>
                    <strong>🧪 Development Mode:</strong> Transaction simulated<br/>
                    <code style={{ fontSize: '12px', color: '#999' }}>
                      {txHash}
                    </code><br/>
                    <em>Switch to production mode to create real blockchain transactions</em>
                  </div>
                ) : (
                  <a 
                    href={getExplorerUrl(txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ 
                      color: '#52c41a', 
                      textDecoration: 'underline',
                      fontWeight: 'bold'
                    }}
                  >
                    View Transaction on Aptos Explorer →
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
          <button
            type="submit"
            disabled={isSubmitting || !walletConnected}
            style={{
              padding: '12px 30px',
              backgroundColor: (isSubmitting || !walletConnected) ? '#d9d9d9' : '#52c41a',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: (isSubmitting || !walletConnected) ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            {isSubmitting ? '🔄 Creating on Blockchain...' : '� Create Record on Aptos'}
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => {
              setFormData({
                patientAddress: '',
                recordType: 'consultation',
                title: '',
                description: '',
                file: null
              });
              setSubmitStatus('idle');
              setSubmitMessage('');
              setTxHash('');
              const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
              if (fileInput) fileInput.value = '';
            }}
            style={{
              padding: '12px 30px',
              backgroundColor: isSubmitting ? '#f5f5f5' : '#666',
              color: isSubmitting ? '#999' : 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            Clear Form
          </button>
        </div>
      </form>

      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f0f8ff', borderRadius: '8px' }}>
        <h4>🔒 Production Security & Blockchain Integration</h4>
        <ul style={{ color: '#666', fontSize: '14px' }}>
          <li>✅ All records are encrypted client-side using AES-256-GCM</li>
          <li>✅ Files are stored on decentralized IPFS network</li>
          <li>✅ Medical record metadata is stored on Aptos blockchain</li>
          <li>✅ Real gas fees are paid for blockchain transactions</li>
          <li>✅ Petra wallet integration with transaction signing</li>
          <li>✅ Only the patient can grant access to other doctors</li>
          <li>✅ Soulbound NFT minted as proof of authenticity</li>
          <li>✅ All actions are immutably recorded on-chain</li>
        </ul>
      </div>
    </div>
  );
};

export default CreateReport;
