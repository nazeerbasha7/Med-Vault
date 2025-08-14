import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { key: '/', label: 'Home' },
    { key: '/admin', label: 'Admin' },
    { key: '/doctor', label: 'Doctor' },
    { key: '/patient', label: 'Patient' },
    { key: '/verify', label: 'Verify' },
  ];

  const handleMenuClick = (key: string) => {
    navigate(key);
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      navigate('/');
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  return (
    <AntHeader className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div 
            className="text-xl font-bold text-blue-600 cursor-pointer"
            onClick={() => navigate('/')}
          >
            🏥 MedVault
          </div>
          
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={handleMenuClick}
            className="border-none bg-transparent"
            style={{ minWidth: '400px' }}
          />
        </div>

        <Space>
          {connected && account ? (
            <Space>
              <Text type="secondary" className="text-sm">
                {`${account.address.slice(0, 6)}...${account.address.slice(-4)}`}
              </Text>
              <Button 
                icon={<LogoutOutlined />}
                onClick={handleDisconnect}
                type="text"
              >
                Disconnect
              </Button>
            </Space>
          ) : (
            <WalletSelector />
          )}
        </Space>
      </div>
    </AntHeader>
  );
};

export default Header;
