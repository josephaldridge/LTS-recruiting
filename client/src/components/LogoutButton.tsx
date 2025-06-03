import React from 'react';
import Button from '@mui/material/Button';

interface LogoutButtonProps {
  handleLogout: () => void;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ handleLogout }) => (
  <Button
    onClick={handleLogout}
    className="bg-white/40 hover:bg-white/60 text-gray-900 rounded-full px-6 py-2 font-medium transition shadow ml-4"
  >
    Logout
  </Button>
);

export default LogoutButton; 