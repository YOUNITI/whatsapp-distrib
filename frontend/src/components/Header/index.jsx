import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

export default function Header() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          WhatsApp Integrator
        </Typography>
        {isAuthenticated && (
          <Button color="inherit" onClick={logout}>
            Выйти
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}