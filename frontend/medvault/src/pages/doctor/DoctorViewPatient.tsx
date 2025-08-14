import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

interface PatientRecord {
  id: string;
  type: string;
  date: string;
  doctor: string;
  accessible: boolean;
}

const DoctorViewPatient: React.FC = () => {
  const { address } = useParams<{ address: string }>();
  const [patientRecords] = useState<PatientRecord[]>([
    {
      id: '1',
      type: 'Blood Test Results',
      date: '2025-08-10',
      doctor: 'Dr. Smith',
      accessible: true
    },
    {
      id: '2',
      type: 'X-Ray Report',
      date: '2025-08-05',
      doctor: 'Dr. Johnson',
      accessible: false
    },
    {
      id: '3',
      type: 'Prescription',
      date: '2025-08-01',
      doctor: 'Dr. Williams',
      accessible: true
    }
  ]);

  const handleRequestAccess = (recordId: string) => {
    alert(`Requesting access to record ${recordId}`);
  };

  const handleViewRecord = (recordId: string) => {
    alert(`Viewing record ${recordId}`);
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h2>👤 Patient Records</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Patient Address: <code>{address || 'Not specified'}</code>
        </p>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3>📋 Medical Records</h3>
        <p style={{ color: '#666', fontSize: '14px' }}>
          You can view records you have access to, or request access to restricted records.
        </p>
      </div>

      <div style={{ display: 'grid', gap: '15px' }}>
        {patientRecords.map((record) => (
          <div
            key={record.id}
            style={{
              padding: '20px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              backgroundColor: record.accessible ? '#f9fff9' : '#fff9f9'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>
                  {record.accessible ? '🔓' : '🔒'} {record.type}
                </h4>
                <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                  <strong>Date:</strong> {record.date}
                </p>
                <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                  <strong>Created by:</strong> {record.doctor}
                </p>
                <p style={{ margin: '5px 0', fontSize: '12px', color: record.accessible ? '#52c41a' : '#ff4d4f' }}>
                  {record.accessible ? '✅ Access Granted' : '❌ Access Required'}
                </p>
              </div>
              <div>
                {record.accessible ? (
                  <button
                    onClick={() => handleViewRecord(record.id)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#52c41a',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    View Record
                  </button>
                ) : (
                  <button
                    onClick={() => handleRequestAccess(record.id)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#1890ff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Request Access
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h4>📝 Actions Available</h4>
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <button
            style={{
              padding: '10px 20px',
              backgroundColor: '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            onClick={() => alert('Creating new record for this patient')}
          >
            Create New Record
          </button>
          <button
            style={{
              padding: '10px 20px',
              backgroundColor: '#722ed1',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            onClick={() => alert('Viewing patient summary')}
          >
            Patient Summary
          </button>
          <button
            style={{
              padding: '10px 20px',
              backgroundColor: '#fa8c16',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            onClick={() => alert('Requesting bulk access to records')}
          >
            Request Bulk Access
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorViewPatient;
