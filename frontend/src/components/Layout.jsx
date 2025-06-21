import React from 'react';
import { Box } from '@mui/material';
import Header from './Header/index';
import Notification from './Notification/index';

/**
 * Основной лейаут приложения
 * 
 * @param {Object} props - Свойства компонента
 * @param {ReactNode} props.children - Дочерние элементы
 * @returns {JSX.Element} Компонент лейаута
 */
const Layout = ({ children }) => {
  return (
    <Box 
      sx={{ 
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5'
      }}
    >
      {/* Шапка приложения */}
      <Header />
      
      {/* Основное содержимое */}
      <Box 
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          maxWidth: 1200,
          width: '100%',
          mx: 'auto'
        }}
      >
        {children}
      </Box>
      
      {/* Система уведомлений */}
      <Notification />
    </Box>
  );
};

export default Layout;