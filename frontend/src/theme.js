import { createTheme } from '@mui/material/styles';

const whatsappTheme = createTheme({
  palette: {
    primary: {
      main: '#25D366', // Зеленый WhatsApp
      contrastText: '#fff',
    },
    secondary: {
      main: '#075E54', // Темно-зеленый WhatsApp
    },
    background: {
      default: '#f0f2f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#3B4A54',
      secondary: '#667781',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'Helvetica',
      'Arial',
      'sans-serif',
    ].join(','),
    h5: {
      fontWeight: 600,
      color: '#3B4A54',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          padding: '8px 16px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(11, 20, 26, 0.08)',
        },
      },
    },
  },
});

export default whatsappTheme;