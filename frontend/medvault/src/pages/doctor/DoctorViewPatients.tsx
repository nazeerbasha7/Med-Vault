import React, { useState, useEffect } from 'react';
import { getDoctorPatients, getPatientRecords } from '../../utils/petra-simple';

const DoctorViewPatients: React.FC = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patientRecords, setPatientRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const patientList = await getDoctorPatients();
      setPatients(patientList);
    } catch (error) {
      console.error('Failed to load patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectPatient = async (patient: any) => {
    try {
      setSelectedPatient(patient);
      setLoadingRecords(true);
      const records = await getPatientRecords(patient.address);
      setPatientRecords(records);
    } catch (error) {
      console.error('Failed to load patient records:', error);
      setPatientRecords([]);
    } finally {
      setLoadingRecords(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#666' }}>Loading patients...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '24px', color: '#1890ff' }}>
        👥 My Patients
      </h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: selectedPatient ? '1fr 2fr' : '1fr', gap: '20px' }}>
        {/* Patient List */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Patient List ({patients.length})</h3>
          
          {patients.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>👥</div>
              <p>No patients yet</p>
              <p style={{ fontSize: '14px' }}>Patients will appear here after you create medical records for them.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {patients.map((patient, index) => (
                <div
                  key={index}
                  onClick={() => selectPatient(patient)}
                  style={{
                    padding: '15px',
                    border: selectedPatient?.address === patient.address ? '2px solid #1890ff' : '1px solid #d9d9d9',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    backgroundColor: selectedPatient?.address === patient.address ? '#f0f8ff' : 'white',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                    {patient.address.substring(0, 10)}...{patient.address.substring(patient.address.length - 8)}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    {patient.recordCount} records • Last visit: {new Date(patient.lastVisit).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Patient Details */}
        {selectedPatient && (
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Patient Records</h3>
              <div style={{ fontSize: '14px', color: '#666' }}>
                <div>Address: {selectedPatient.address}</div>
                <div>Total Records: {selectedPatient.recordCount}</div>
                <div>First Visit: {new Date(selectedPatient.firstVisit || selectedPatient.lastVisit).toLocaleDateString()}</div>
                <div>Last Visit: {new Date(selectedPatient.lastVisit).toLocaleDateString()}</div>
              </div>
            </div>

            {loadingRecords ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                Loading records...
              </div>
            ) : patientRecords.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>📋</div>
                <p>No records found</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {patientRecords.map((record, index) => (
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
                      {record.description}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      {record.ipfsHash && (
                        <span style={{ 
                          fontSize: '12px', 
                          backgroundColor: '#e6f7ff', 
                          color: '#1890ff', 
                          padding: '2px 8px', 
                          borderRadius: '4px' 
                        }}>
                          📎 IPFS: {record.ipfsHash.substring(0, 8)}...
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
                      <span style={{ 
                        fontSize: '12px', 
                        backgroundColor: '#fff7e6', 
                        color: '#fa8c16', 
                        padding: '2px 8px', 
                        borderRadius: '4px' 
                      }}>
                        ID: {record.id}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f8ff', borderRadius: '6px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#1890ff' }}>Quick Actions</h4>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <a 
                  href={`/doctor/create-report?patient=${selectedPatient.address}`}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#52c41a',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                >
                  📝 New Record
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedPatient.address);
                    alert('Address copied to clipboard');
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#1890ff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  📋 Copy Address
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorViewPatients;
