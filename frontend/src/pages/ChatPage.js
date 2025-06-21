import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button, Typography } from '@mui/material';

function ChatPage() {
  const { isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Typography variant="h4">Chat Dashboard</Typography>
      <Button onClick={logout}>Logout</Button>
      {/* Остальной интерфейс чата */}
    </div>
  );
}

export default ChatPage;