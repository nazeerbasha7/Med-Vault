import React, { useState } from 'react';
import { comprehensiveRecordVerification, publicRecordVerification } from '../../utils/blockchain';

interface VerificationResult {
  score: number;
  details: Array<{
    check: string;
    status: 'passed' | 'failed' | 'warning';
    message: string;
  }>;
  summary: string;
}

const Verify: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'comprehensive' | 'public'>('comprehensive');
  const [recordId, setRecordId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleComprehensiveVerification = async () => {
    if (!recordId || !file) {
      setError('Please provide both Record ID and file for comprehensive verification');
      return;
    }

    setIsVerifying(true);
    setError(null);
    setVerificationResult(null);

    try {
      const result = await comprehensiveRecordVerification(recordId, file);
      setVerificationResult(result);
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePublicVerification = async () => {
    if (!recordId) {
      setError('Please provide Record ID for public verification');
      return;
    }

    setIsVerifying(true);
    setError(null);
    setVerificationResult(null);

    try {
      const result = await publicRecordVerification(recordId);
      setVerificationResult(result);
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#52c41a';
    if (score >= 60) return '#faad14';
    return '#ff4d4f';
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px', color: '#1890ff' }}>
          🔍 Medical Record Verification
        </h1>
        <p style={{ color: '#666', fontSize: '16px' }}>
          Verify the authenticity and integrity of medical records using blockchain technology.
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', 
        borderBottom: '2px solid #f0f0f0',
        marginBottom: '30px'
      }}>
        <button
          onClick={() => setActiveTab('comprehensive')}
          style={{
            padding: '12px 24px',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'comprehensive' ? '3px solid #1890ff' : '3px solid transparent',
            color: activeTab === 'comprehensive' ? '#1890ff' : '#666',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          🔍 Comprehensive Verification
        </button>
        <button
          onClick={() => setActiveTab('public')}
          style={{
            padding: '12px 24px',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'public' ? '3px solid #1890ff' : '3px solid transparent',
            color: activeTab === 'public' ? '#1890ff' : '#666',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          🌐 Public Verification
        </button>
      </div>

      {/* Comprehensive Verification Tab */}
      {activeTab === 'comprehensive' && (
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>🔍 Comprehensive Record Verification</h3>
          <p style={{ color: '#666', marginBottom: '30px' }}>
            Perform a complete verification including blockchain lookup, file integrity check, and cryptographic authentication.
          </p>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
              Record ID:
            </label>
            <input
              type="text"
              value={recordId}
              onChange={(e) => setRecordId(e.target.value)}
              placeholder="Enter medical record ID (0x...)"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
              Upload File for Verification:
            </label>
            <input
              type="file"
              onChange={handleFileUpload}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d9d9d9',
                borderRadius: '4px'
              }}
            />
            {file && (
              <p style={{ marginTop: '8px', color: '#52c41a', fontSize: '14px' }}>
                ✓ File selected: {file.name}
              </p>
            )}
          </div>

          <button
            onClick={handleComprehensiveVerification}
            disabled={isVerifying || !recordId || !file}
            style={{
              padding: '12px 24px',
              backgroundColor: isVerifying || !recordId || !file ? '#d9d9d9' : '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: isVerifying || !recordId || !file ? 'not-allowed' : 'pointer'
            }}
          >
            {isVerifying ? '🔄 Verifying...' : '🔍 Start Comprehensive Verification'}
          </button>
        </div>
      )}

      {/* Public Verification Tab */}
      {activeTab === 'public' && (
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>🌐 Public Record Verification</h3>
          <p style={{ color: '#666', marginBottom: '30px' }}>
            Verify basic record information using only the Record ID. No file upload required.
          </p>

          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
              Record ID:
            </label>
            <input
              type="text"
              value={recordId}
              onChange={(e) => setRecordId(e.target.value)}
              placeholder="Enter medical record ID (0x...)"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '14px'
              }}
            />
          </div>

          <button
            onClick={handlePublicVerification}
            disabled={isVerifying || !recordId}
            style={{
              padding: '12px 24px',
              backgroundColor: isVerifying || !recordId ? '#d9d9d9' : '#52c41a',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: isVerifying || !recordId ? 'not-allowed' : 'pointer'
            }}
          >
            {isVerifying ? '🔄 Verifying...' : '🌐 Start Public Verification'}
          </button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#fff2f0',
          border: '1px solid #ffccc7',
          borderRadius: '4px',
          color: '#cf1322'
        }}>
          <strong>❌ Error:</strong> {error}
        </div>
      )}

      {/* Verification Results */}
      {verificationResult && (
        <div style={{
          marginTop: '20px',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: `2px solid ${getScoreColor(verificationResult.score)}`
        }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>📊 Verification Results</h3>
            <div style={{
              display: 'inline-block',
              padding: '8px 16px',
              backgroundColor: getScoreColor(verificationResult.score),
              color: 'white',
              borderRadius: '20px',
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              Score: {verificationResult.score}%
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Summary:</h4>
            <p style={{ color: '#666', lineHeight: '1.6' }}>{verificationResult.summary}</p>
          </div>

          <div>
            <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>Detailed Checks:</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {verificationResult.details.map((detail, index) => (
                <div
                  key={index}
                  style={{
                    padding: '12px',
                    borderRadius: '4px',
                    backgroundColor: detail.status === 'passed' ? '#f6ffed' : detail.status === 'warning' ? '#fffbe6' : '#fff2f0',
                    border: `1px solid ${detail.status === 'passed' ? '#b7eb8f' : detail.status === 'warning' ? '#ffe58f' : '#ffccc7'}`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                    <span>
                      {detail.status === 'passed' ? '✅' : detail.status === 'warning' ? '⚠️' : '❌'}
                    </span>
                    <strong style={{ color: '#333' }}>{detail.check}</strong>
                  </div>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>{detail.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Verify;
