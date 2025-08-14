import React, { useState, useEffect } from 'react';
import { getDoctorPatients, getCurrentUserWalletData } from '../../utils/petra-simple';

const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';

const DoctorDashboard: React.FC = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [doctorData, setDoctorData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load doctor's wallet data
      const walletData = await getCurrentUserWalletData();
      setDoctorData(walletData);
      
      // Load doctor's patients
      const patientList = await getDoctorPatients();
      setPatients(patientList);
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalRecords = patients.reduce((sum, patient) => sum + (patient.recordCount || 0), 0);

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px', color: '#1890ff' }}>
          👨‍⚕️ Doctor Dashboard
        </h1>
        {doctorData.doctorName && (
          <p style={{ color: '#666', fontSize: '16px' }}>
            Welcome back, Dr. {doctorData.doctorName} - {doctorData.specialization}
          </p>
        )}
        {doctorData.organizationName && (
          <p style={{ color: '#999', fontSize: '14px' }}>
            {doctorData.organizationName}
          </p>
        )}
      </div>

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
            Application is running in dev mode. Blockchain transactions are simulated for development and testing.
          </p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>👥 My Patients</h3>
          <p style={{ color: '#666', marginBottom: '15px' }}>
            {patients.length} active patients with {totalRecords} total records
          </p>
          <a 
            href="/doctor/view-patients" 
            style={{ 
              display: 'inline-block', 
              padding: '10px 20px', 
              backgroundColor: '#1890ff', 
              color: 'white', 
              textDecoration: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            View Patients
          </a>
        </div>

        <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>📝 Create Report</h3>
          <p style={{ color: '#666', marginBottom: '15px' }}>Create encrypted medical reports stored on IPFS</p>
          <a 
            href="/doctor/create-report" 
            style={{ 
              display: 'inline-block', 
              padding: '10px 20px', 
              backgroundColor: '#52c41a', 
              color: 'white', 
              textDecoration: 'none', 
              borderRadius: '4px' 
            }}
          >
            New Report
          </a>
        </div>

        <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>� Verify Records</h3>
          <p style={{ color: '#666', marginBottom: '15px' }}>Verify authenticity of medical records</p>
          <a 
            href="/verify" 
            style={{ 
              display: 'inline-block', 
              padding: '10px 20px', 
              backgroundColor: '#fa8c16', 
              color: 'white', 
              textDecoration: 'none', 
              borderRadius: '4px' 
            }}
          >
            Verify Records
          </a>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>📊 Practice Overview</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '20px' }}>
          <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f0f8ff', borderRadius: '6px' }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1890ff' }}>{patients.length}</div>
            <div style={{ color: '#666', fontSize: '14px' }}>Total Patients</div>
          </div>
          <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f6ffed', borderRadius: '6px' }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#52c41a' }}>{totalRecords}</div>
            <div style={{ color: '#666', fontSize: '14px' }}>Records Created</div>
          </div>
          <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#fff7e6', borderRadius: '6px' }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#fa8c16' }}>100%</div>
            <div style={{ color: '#666', fontSize: '14px' }}>Records Encrypted</div>
          </div>
          <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f9f0ff', borderRadius: '6px' }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#722ed1' }}>
              {DEV_MODE ? 'DEV' : 'IPFS'}
            </div>
            <div style={{ color: '#666', fontSize: '14px' }}>
              {DEV_MODE ? 'Development Mode' : 'Storage Network'}
            </div>
          </div>
        </div>

        {/* Recent Patients */}
        {patients.length > 0 && (
          <div>
            <h4 style={{ margin: '20px 0 15px 0', color: '#333' }}>Recent Patients</h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #d9d9d9' }}>Patient Address</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #d9d9d9' }}>Records</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #d9d9d9' }}>Last Visit</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.slice(0, 5).map((patient, index) => (
                    <tr key={index}>
                      <td style={{ padding: '12px', borderBottom: '1px solid #f0f0f0' }}>
                        {patient.address.substring(0, 10)}...{patient.address.substring(patient.address.length - 8)}
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #f0f0f0' }}>
                        {patient.recordCount}
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #f0f0f0' }}>
                        {new Date(patient.lastVisit).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
