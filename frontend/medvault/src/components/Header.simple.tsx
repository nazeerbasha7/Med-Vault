import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const location = useLocation();

  const navStyle = {
    padding: '20px',
    backgroundColor: '#1890ff',
    color: 'white',
    marginBottom: '20px'
  };

  const linkStyle = {
    color: 'white',
    textDecoration: 'none',
    marginRight: '30px',
    padding: '10px 15px',
    borderRadius: '4px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
  };

  const activeLinkStyle = {
    ...linkStyle,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    fontWeight: 'bold'
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header style={navStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>🏥 MedVault</h1>
        <nav>
          <Link to="/" style={isActive('/') ? activeLinkStyle : linkStyle}>
            🏠 Home
          </Link>
          <Link to="/admin" style={isActive('/admin') ? activeLinkStyle : linkStyle}>
            🏥 Admin
          </Link>
          <Link to="/doctor" style={isActive('/doctor') ? activeLinkStyle : linkStyle}>
            👨‍⚕️ Doctor
          </Link>
          <Link to="/patient" style={isActive('/patient') ? activeLinkStyle : linkStyle}>
            👤 Patient
          </Link>
          <Link to="/verify" style={isActive('/verify') ? activeLinkStyle : linkStyle}>
            🔍 Verify
          </Link>
        </nav>
        <div style={{ fontSize: '14px', opacity: 0.8 }}>
          Port: 3000 | Status: Running
        </div>
      </div>
    </header>
  );
};

export default Header;
