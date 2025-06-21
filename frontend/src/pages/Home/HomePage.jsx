import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      gap: 3
    }}>
      <Typography variant="h3" gutterBottom>
        WhatsApp Рассыльщик
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        Управляйте массовыми рассылками легко и эффективно
      </Typography>
      
      <Button 
        variant="contained" 
        size="large" 
        component={Link} 
        to="/bulk-send"
        sx={{ width: 200 }}
      >
        Начать рассылку
      </Button>
      
      <Button 
        variant="outlined" 
        component={Link} 
        to="/auth"
        sx={{ width: 200 }}
      >
        Авторизация
      </Button>
    </Box>
  );
}