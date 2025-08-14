import React from 'react';

function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#1890ff', marginBottom: '20px' }}>🏥 MedVault - Decentralized Medical Records</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Welcome to MedVault</h2>
        <p>A privacy-first, organization-enabled medical records management system built on Aptos blockchain.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        <div style={{ padding: '20px', border: '2px solid #1890ff', borderRadius: '8px', backgroundColor: '#f0f8ff' }}>
          <h3>🏥 Admin Dashboard</h3>
          <p>Organization management and doctor registration</p>
          <button style={{ padding: '10px 20px', backgroundColor: '#1890ff', color: 'white', border: 'none', borderRadius: '4px' }}>
            Access Admin
          </button>
        </div>

        <div style={{ padding: '20px', border: '2px solid #52c41a', borderRadius: '8px', backgroundColor: '#f6ffed' }}>
          <h3>👨‍⚕️ Doctor Portal</h3>
          <p>Patient management and record creation</p>
          <button style={{ padding: '10px 20px', backgroundColor: '#52c41a', color: 'white', border: 'none', borderRadius: '4px' }}>
            Access Doctor Portal
          </button>
        </div>

        <div style={{ padding: '20px', border: '2px solid #722ed1', borderRadius: '8px', backgroundColor: '#f9f0ff' }}>
          <h3>👤 Patient Dashboard</h3>
          <p>Access control and medical history</p>
          <button style={{ padding: '10px 20px', backgroundColor: '#722ed1', color: 'white', border: 'none', borderRadius: '4px' }}>
            Access Patient Portal
          </button>
        </div>

        <div style={{ padding: '20px', border: '2px solid #fa8c16', borderRadius: '8px', backgroundColor: '#fff7e6' }}>
          <h3>🔍 Verification System</h3>
          <p>Public record authenticity verification</p>
          <button style={{ padding: '10px 20px', backgroundColor: '#fa8c16', color: 'white', border: 'none', borderRadius: '4px' }}>
            Verify Records
          </button>
        </div>
      </div>

      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>🔐 System Features</h3>
        <ul>
          <li>✅ Organization-first architecture with admin controls</li>
          <li>✅ Privacy-first design with client-side encryption</li>
          <li>✅ Soulbound NFTs for record authenticity</li>
          <li>✅ Cross-organizational sharing with patient consent</li>
          <li>✅ Complete audit trails on Aptos blockchain</li>
          <li>✅ IPFS decentralized storage</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center', color: '#666' }}>
        <p>🚀 MedVault is running on port 3000 | Built with React + Aptos + IPFS</p>
      </div>
    </div>
  );
}

export default App;
