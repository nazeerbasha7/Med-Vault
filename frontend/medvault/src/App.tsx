import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import all page components
import AdminDashboard from './pages/admin/AdminDashboard';
import OrgDoctors from './pages/admin/OrgDoctors';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import CreateReport from './pages/doctor/CreateReport';
import DoctorViewPatient from './pages/doctor/DoctorViewPatient';
import DoctorViewPatients from './pages/doctor/DoctorViewPatients';
import PatientDashboard from './pages/patient/PatientDashboard';
import RecordViewer from './pages/patient/RecordViewer';
import Verify from './pages/verify/Verify';

// Simple Header component (inline to avoid dependency issues)
const SimpleHeader: React.FC = () => {
  return (
    <header style={{ 
      padding: '20px', 
      backgroundColor: '#1890ff', 
      color: 'white',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>🏥 MedVault</h1>
        <nav>
          <a href="/" style={{ color: 'white', textDecoration: 'none', marginRight: '20px' }}>Home</a>
          <a href="/admin" style={{ color: 'white', textDecoration: 'none', marginRight: '20px' }}>Admin</a>
          <a href="/doctor" style={{ color: 'white', textDecoration: 'none', marginRight: '20px' }}>Doctor</a>
          <a href="/patient" style={{ color: 'white', textDecoration: 'none', marginRight: '20px' }}>Patient</a>
          <a href="/verify" style={{ color: 'white', textDecoration: 'none' }}>Verify</a>
        </nav>
        <div style={{ fontSize: '12px', opacity: 0.8 }}>
          Decentralized Medical Records
        </div>
      </div>
    </header>
  );
};

// Home page component - FIXED: Moved inline to avoid import issues
const Home: React.FC = () => {
  return (
    <div style={{ textAlign: 'center', padding: '64px 16px' }}>
      <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#1f2937', marginBottom: '24px' }}>
        Welcome to MedVault
      </h1>
      <p style={{ fontSize: '20px', color: '#6b7280', marginBottom: '32px', maxWidth: '768px', margin: '0 auto 32px' }}>
        A decentralized, privacy-first patient health record system built on Aptos blockchain.
        Secure medical records with patient-controlled access and organizational management.
      </p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', maxWidth: '1024px', margin: '48px auto' }}>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏥</div>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>For Organizations</h3>
          <p style={{ color: '#6b7280', marginBottom: '16px' }}>
            Manage doctors, verify credentials, and maintain audit logs.
          </p>
          <a 
            href="/admin" 
            style={{ 
              backgroundColor: '#3b82f6', 
              color: 'white', 
              padding: '8px 16px', 
              borderRadius: '4px', 
              textDecoration: 'none',
              display: 'inline-block'
            }}
          >
            Admin Portal
          </a>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>👨‍⚕️</div>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>For Doctors</h3>
          <p style={{ color: '#6b7280', marginBottom: '16px' }}>
            Create encrypted reports, view patient timelines, and request access.
          </p>
          <a 
            href="/doctor" 
            style={{ 
              backgroundColor: '#10b981', 
              color: 'white', 
              padding: '8px 16px', 
              borderRadius: '4px', 
              textDecoration: 'none',
              display: 'inline-block'
            }}
          >
            Doctor Portal
          </a>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧑‍💼</div>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>For Patients</h3>
          <p style={{ color: '#6b7280', marginBottom: '16px' }}>
            View your records, control access, and manage your health data.
          </p>
          <a 
            href="/patient" 
            style={{ 
              backgroundColor: '#8b5cf6', 
              color: 'white', 
              padding: '8px 16px', 
              borderRadius: '4px', 
              textDecoration: 'none',
              display: 'inline-block'
            }}
          >
            Patient Portal
          </a>
        </div>
      </div>
      
      <div style={{ marginTop: '64px', backgroundColor: '#eff6ff', padding: '32px', borderRadius: '8px', maxWidth: '1024px', margin: '64px auto 0' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>
          Public Record Verification
        </h2>
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>
          Verify the authenticity of medical records and NFT certificates.
        </p>
        <a 
          href="/verify" 
          style={{ 
            backgroundColor: '#6366f1', 
            color: 'white', 
            padding: '12px 24px', 
            borderRadius: '6px', 
            textDecoration: 'none',
            display: 'inline-block'
          }}
        >
          Verify Records
        </a>
      </div>
      
      <div style={{ marginTop: '48px', fontSize: '14px', color: '#9ca3af' }}>
        <p>
          Powered by Aptos blockchain • Encrypted with libsodium • Stored on IPFS
        </p>
      </div>
    </div>
  );
};

// Main App component - FIXED: Removed duplicate function declarations and syntax errors
function App(): JSX.Element {
  return (
    <Router>
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <SimpleHeader />
        <main style={{ padding: '20px' }}>
          <Routes>
            {/* FIXED: Added proper route structure with all existing components */}
            <Route path="/" element={<Home />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/doctors" element={<OrgDoctors />} />
            
            {/* Doctor Routes */}
            <Route path="/doctor" element={<DoctorDashboard />} />
            <Route path="/doctor/create-report" element={<CreateReport />} />
            <Route path="/doctor/view-patients" element={<DoctorViewPatients />} />
            <Route path="/doctor/patient/:address" element={<DoctorViewPatient />} />
            
            {/* Patient Routes */}
            <Route path="/patient" element={<PatientDashboard />} />
            <Route path="/patient/record/:id" element={<RecordViewer />} />
            
            {/* Verification Routes */}
            <Route path="/verify" element={<Verify />} />
            <Route path="/verify/:recordId" element={<Verify />} />
            
            {/* 404 Route */}
            <Route path="*" element={
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <h2>Page Not Found</h2>
                <p>The page you're looking for doesn't exist.</p>
                <a href="/" style={{ color: '#1890ff' }}>Go back to home</a>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
} // FIXED: Added missing semicolon and proper closing

export default App;
