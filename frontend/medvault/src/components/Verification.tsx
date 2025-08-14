import React, { useState, useRef } from 'react';
import { 
  comprehensiveRecordVerification, 
  publicRecordVerification, 
  getVerificationDashboard,
  VerificationResult 
} from '../utils/blockchain';

interface VerificationProps {
  patientAddress?: string;
}

export const Verification: React.FC<VerificationProps> = ({ patientAddress }) => {
  const [recordId, setRecordId] = useState('');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [publicResult, setPublicResult] = useState<any>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('comprehensive');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleComprehensiveVerification = async () => {
    if (!recordId.trim()) return;
    
    setLoading(true);
    try {
      const file = fileInputRef.current?.files?.[0];
      const result = await comprehensiveRecordVerification(recordId.trim(), file);
      setVerificationResult(result);
    } catch (error) {
      console.error('Verification failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublicVerification = async () => {
    if (!recordId.trim()) return;
    
    setLoading(true);
    try {
      const result = await publicRecordVerification(recordId.trim());
      setPublicResult(result);
    } catch (error) {
      console.error('Public verification failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboard = async () => {
    if (!patientAddress) return;
    
    setLoading(true);
    try {
      const result = await getVerificationDashboard(patientAddress);
      setDashboard(result);
    } catch (error) {
      console.error('Dashboard loading failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Highly Verified';
    if (score >= 60) return 'Verified';
    return 'Unverified';
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          🔍 Medical Record Verification System
        </h2>
        <p className="text-gray-600">
          Verify medical records using blockchain, IPFS, and cryptographic methods
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex mb-6 border-b">
        <button
          className={`px-6 py-3 font-medium ${
            activeTab === 'comprehensive' 
              ? 'border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('comprehensive')}
        >
          Comprehensive Verification
        </button>
        <button
          className={`px-6 py-3 font-medium ${
            activeTab === 'public' 
              ? 'border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('public')}
        >
          Public Verification
        </button>
        {patientAddress && (
          <button
            className={`px-6 py-3 font-medium ${
              activeTab === 'dashboard' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('dashboard')}
          >
            Verification Dashboard
          </button>
        )}
      </div>

      {/* Comprehensive Verification Tab */}
      {activeTab === 'comprehensive' && (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">
              🔐 Comprehensive Verification
            </h3>
            <p className="text-blue-700 text-sm">
              Complete verification using blockchain lookup, file integrity, and cryptographic authentication
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Record ID
              </label>
              <input
                type="text"
                value={recordId}
                onChange={(e) => setRecordId(e.target.value)}
                placeholder="Enter medical record ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medical File (Optional)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.dcm"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            onClick={handleComprehensiveVerification}
            disabled={!recordId.trim() || loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium py-3 px-4 rounded-md transition-colors"
          >
            {loading ? 'Verifying...' : '🔍 Verify Record'}
          </button>

          {/* Comprehensive Results */}
          {verificationResult && (
            <div className="mt-6 bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold">Verification Results</h4>
                <div className="flex items-center space-x-2">
                  <span className={`text-2xl font-bold ${getScoreColor(verificationResult.verificationInfo.verificationScore)}`}>
                    {verificationResult.verificationInfo.verificationScore}%
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    verificationResult.isValid 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {getScoreLabel(verificationResult.verificationInfo.verificationScore)}
                  </span>
                </div>
              </div>

              {/* Verification Methods */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                {Object.entries(verificationResult.verificationMethods).map(([method, passed]) => (
                  <div key={method} className="text-center">
                    <div className={`text-2xl mb-1 ${passed ? 'text-green-500' : 'text-red-500'}`}>
                      {passed ? '✅' : '❌'}
                    </div>
                    <div className="text-xs text-gray-600 capitalize">
                      {method.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Record Information */}
              <div className="bg-white p-4 rounded border">
                <h5 className="font-medium mb-3">Record Information</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Record ID:</span>
                    <span className="ml-2 font-mono">{verificationResult.verificationInfo.recordId.substring(0, 20)}...</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Created:</span>
                    <span className="ml-2">{new Date(verificationResult.verificationInfo.createdAt * 1000).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">File Type:</span>
                    <span className="ml-2">{verificationResult.verificationInfo.fileType}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">On Chain:</span>
                    <span className="ml-2">{verificationResult.verificationInfo.onChain ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>

              {/* Errors and Warnings */}
              {verificationResult.errors.length > 0 && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                  <h6 className="font-medium text-red-800 mb-2">Errors:</h6>
                  <ul className="text-sm text-red-700 list-disc list-inside">
                    {verificationResult.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {verificationResult.warnings.length > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <h6 className="font-medium text-yellow-800 mb-2">Warnings:</h6>
                  <ul className="text-sm text-yellow-700 list-disc list-inside">
                    {verificationResult.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Public Verification Tab */}
      {activeTab === 'public' && (
        <div className="space-y-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">
              🌐 Public Verification
            </h3>
            <p className="text-green-700 text-sm">
              Anyone can verify a record exists without accessing private medical data
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Record ID
            </label>
            <input
              type="text"
              value={recordId}
              onChange={(e) => setRecordId(e.target.value)}
              placeholder="Enter medical record ID for public verification"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <button
            onClick={handlePublicVerification}
            disabled={!recordId.trim() || loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-medium py-3 px-4 rounded-md transition-colors"
          >
            {loading ? 'Verifying...' : '🌐 Public Verify'}
          </button>

          {publicResult && (
            <div className="mt-6 bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold">Public Verification Result</h4>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  publicResult.verified 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {publicResult.verified ? 'Verified' : 'Not Found'}
                </span>
              </div>

              <div className="bg-white p-4 rounded border">
                <p className="text-gray-700">{publicResult.publicInfo}</p>
                {publicResult.exists && (
                  <div className="mt-3 text-sm text-gray-600">
                    <div>File Hash: {publicResult.fileHash}</div>
                    <div>Doctor: {publicResult.doctorAddress?.substring(0, 10)}...</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && patientAddress && (
        <div className="space-y-6">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">
              📊 Verification Dashboard
            </h3>
            <p className="text-purple-700 text-sm">
              Overview of all your medical records and their verification status
            </p>
          </div>

          <button
            onClick={loadDashboard}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            {loading ? 'Loading...' : '📊 Load Dashboard'}
          </button>

          {dashboard && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-blue-100 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{dashboard.totalRecords}</div>
                <div className="text-sm text-blue-800">Total Records</div>
              </div>
              <div className="bg-green-100 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{dashboard.verifiedRecords}</div>
                <div className="text-sm text-green-800">Verified</div>
              </div>
              <div className="bg-red-100 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">{dashboard.unverifiedRecords}</div>
                <div className="text-sm text-red-800">Unverified</div>
              </div>
              <div className="bg-yellow-100 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-600">{dashboard.verificationRate.toFixed(1)}%</div>
                <div className="text-sm text-yellow-800">Verification Rate</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Verification;
