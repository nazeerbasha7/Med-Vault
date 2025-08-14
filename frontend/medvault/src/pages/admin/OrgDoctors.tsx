import React, { useState, useEffect } from 'react';
import { isPetraAvailable, getPetraAccount, registerDoctor, getDoctorsByOrg, getUserOrganization } from '../../utils/petra-simple';

interface Doctor {
  id: string;
  name: string;
  license: string;
  specialization: string;
  address: string;
  status: 'active' | 'pending' | 'suspended';
  organizationId: string;
  organizationName: string;
  createdAt: string;
}

const OrgDoctors: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string>('');
  const [userOrganization, setUserOrganization] = useState<any>(null);

  useEffect(() => {
    checkConnection();
  }, []);

  useEffect(() => {
    if (isConnected && account) {
      loadUserData();
    }
  }, [isConnected, account]);

  const checkConnection = async () => {
    if (isPetraAvailable()) {
      try {
        const acc = await getPetraAccount();
        setAccount(acc.address);
        setIsConnected(true);
      } catch (error) {
        console.log('Not connected');
        setStatus('Please connect your Petra wallet first');
      }
    }
  };

  const loadUserData = async () => {
    try {
      setLoading(true);
      // Load user's organization first
      const org = await getUserOrganization(account);
      setUserOrganization(org);
      
      if (org) {
        // Load doctors for this organization
        const orgDoctors = await getDoctorsByOrg(account);
        setDoctors(orgDoctors);
        setStatus(orgDoctors.length === 0 ? 'No doctors registered yet.' : `${orgDoctors.length} doctor(s) registered`);
      } else {
        setStatus('No organization found. Please create an organization first.');
        setDoctors([]);
      }
    } catch (error) {
      setStatus('Failed to load data');
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const [showAddForm, setShowAddForm] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    license: '',
    specialization: '',
    address: ''
  });

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      setStatus('Please connect your Petra wallet first');
      return;
    }

    if (!userOrganization) {
      setStatus('You must have an organization to register doctors');
      return;
    }

    if (!newDoctor.name || !newDoctor.specialization || !newDoctor.address) {
      setStatus('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setStatus('Registering doctor on blockchain...');
      
      // Call the registerDoctor function with proper parameters
      await registerDoctor(
        account, // Organization owner address
        newDoctor.name,
        newDoctor.specialization,
        newDoctor.address
      );
      
      setStatus('✅ Doctor registered successfully!');
      
      // Reset form
      setNewDoctor({ name: '', license: '', specialization: '', address: '' });
      setShowAddForm(false);
      
      // Reload doctors list
      await loadUserData();
      
    } catch (error) {
      setStatus(`❌ ${error instanceof Error ? error.message : 'Failed to register doctor'}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#52c41a';
      case 'pending': return '#faad14';
      case 'suspended': return '#ff4d4f';
      default: return '#666';
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 10px 0', color: '#1890ff' }}>
            👨‍⚕️ Organization Doctors
          </h1>
          <p style={{ color: '#666', margin: 0 }}>
            Manage medical professionals in your organization
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          disabled={!isConnected || !userOrganization}
          style={{
            padding: '12px 24px',
            backgroundColor: (isConnected && userOrganization) ? '#52c41a' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: (isConnected && userOrganization) ? 'pointer' : 'not-allowed',
            fontWeight: 'bold'
          }}
        >
          + Register New Doctor
        </button>
      </div>

      {/* Connection Status */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: isConnected ? '#f6ffed' : '#fff7e6', borderRadius: '8px', border: `1px solid ${isConnected ? '#b7eb8f' : '#ffd591'}` }}>
        {isConnected ? (
          <div>
            <p style={{ color: '#52c41a', margin: '0 0 5px 0', fontWeight: 'bold' }}>✅ Wallet Connected</p>
            <p style={{ fontSize: '14px', color: '#666', margin: '0 0 5px 0' }}>Address: {account}</p>
            {userOrganization ? (
              <p style={{ fontSize: '14px', color: '#52c41a', margin: 0 }}>Organization: {userOrganization.name}</p>
            ) : (
              <p style={{ fontSize: '14px', color: '#fa8c16', margin: 0 }}>⚠️ No organization found. Create one first.</p>
            )}
          </div>
        ) : (
          <div>
            <p style={{ color: '#fa8c16', margin: '0 0 5px 0', fontWeight: 'bold' }}>⚠️ Wallet Not Connected</p>
            <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>Please connect your Petra wallet to manage doctors</p>
          </div>
        )}
      </div>

      {/* Status Messages */}
      {status && (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: status.includes('⚠️') ? '#fff7e6' : '#f6ffed', borderRadius: '8px' }}>
          <p style={{ color: status.includes('⚠️') ? '#fa8c16' : '#52c41a', margin: 0 }}>{status}</p>
        </div>
      )}

      {showAddForm && userOrganization && (
        <div style={{ marginBottom: '30px', padding: '24px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Register New Doctor</h3>
          <form onSubmit={handleAddDoctor} style={{ display: 'grid', gap: '15px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Doctor Name *</label>
                <input
                  type="text"
                  value={newDoctor.name}
                  onChange={(e) => setNewDoctor({...newDoctor, name: e.target.value})}
                  required
                  style={{ width: '100%', padding: '10px', border: '1px solid #d9d9d9', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>License Number *</label>
                <input
                  type="text"
                  value={newDoctor.license}
                  onChange={(e) => setNewDoctor({...newDoctor, license: e.target.value})}
                  required
                  style={{ width: '100%', padding: '10px', border: '1px solid #d9d9d9', borderRadius: '4px' }}
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Specialization *</label>
                <select
                  value={newDoctor.specialization}
                  onChange={(e) => setNewDoctor({...newDoctor, specialization: e.target.value})}
                  required
                  style={{ width: '100%', padding: '10px', border: '1px solid #d9d9d9', borderRadius: '4px' }}
                >
                  <option value="">Select Specialization</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="General Practice">General Practice</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Wallet Address *</label>
                <input
                  type="text"
                  value={newDoctor.address}
                  onChange={(e) => setNewDoctor({...newDoctor, address: e.target.value})}
                  placeholder="0x123..."
                  required
                  style={{ width: '100%', padding: '10px', border: '1px solid #d9d9d9', borderRadius: '4px' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#52c41a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Register Doctor
              </button>
              <button type="button" onClick={() => setShowAddForm(false)} style={{ padding: '10px 20px', backgroundColor: '#666', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e8e8e8' }}>
          <h3 style={{ margin: 0, color: '#333' }}>Registered Doctors ({doctors.length})</h3>
        </div>
        <div style={{ padding: '20px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: '#666' }}>Loading doctors...</p>
            </div>
          ) : doctors.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: '#666', fontSize: '16px', marginBottom: '10px' }}>No doctors registered yet</p>
              <p style={{ color: '#999', fontSize: '14px' }}>
                {isConnected 
                  ? 'Click "Register New Doctor" to add the first doctor to your organization'
                  : 'Connect your wallet to view and manage doctors'
                }
              </p>
            </div>
          ) : (
            doctors.map((doctor) => (
              <div key={doctor.id} style={{ padding: '20px', border: '1px solid #e8e8e8', borderRadius: '8px', marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>{doctor.name}</h4>
                    <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}><strong>License:</strong> {doctor.license}</p>
                    <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}><strong>Specialization:</strong> {doctor.specialization}</p>
                    <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}><strong>Address:</strong> {doctor.address}</p>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: '12px', 
                      fontSize: '12px', 
                      fontWeight: 'bold',
                      backgroundColor: getStatusColor(doctor.status),
                      color: 'white' 
                    }}>
                      {doctor.status.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button style={{ padding: '8px 16px', backgroundColor: '#1890ff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                      View Profile
                    </button>
                    <button style={{ padding: '8px 16px', backgroundColor: '#fa8c16', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                      Edit
                    </button>
                    {doctor.status === 'pending' && (
                      <button style={{ padding: '8px 16px', backgroundColor: '#52c41a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Approve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default OrgDoctors;
