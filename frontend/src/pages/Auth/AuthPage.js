import React, { useState, useEffect } from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Button,
  Alert,
  Paper,
  useTheme
} from '@mui/material';
import axios from 'axios';
import QRCode from 'qrcode.react';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [qrData, setQrData] = useState(null);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('/api/auth-status', {
        timeout: 10000,
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      if (response.data.status === 'authenticated') {
        setStatus('authenticated');
        navigate('/dashboard');
      } else if (response.data.qr) {
        setQrData(response.data.qr);
        setStatus('qr_required');
      } else {
        setStatus('loading');
      }
      setError(null);
    } catch (err) {
      const errorMessage = err.response?.data?.error ||
                         err.message ||
                         'Failed to connect to backend service';
      setError(errorMessage);
      setStatus('error');
      setRetryCount(prev => prev + 1);
      console.error('Auth check error:', err);
    }
  };

  useEffect(() => {
    const intervalId = setInterval(checkAuthStatus, 3000);
    // Первая проверка сразу при монтировании
    checkAuthStatus();

    return () => {
      clearInterval(intervalId);
    };
  }, [retryCount]); // Зависимость от retryCount для перезапуска

  const handleRetry = () => {
    setStatus('loading');
    setError(null);
    checkAuthStatus();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        p: 2,
        backgroundColor: theme.palette.background.default
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 450,
          textAlign: 'center',
          borderRadius: 2,
          backgroundColor: theme.palette.background.paper
        }}
      >
        {status === 'loading' && (
          <>
            <CircularProgress
              size={60}
              thickness={4}
              sx={{ mb: 3, color: theme.palette.primary.main }}
            />
            <Typography variant="h6" sx={{ mb: 1 }}>
              Connecting to WhatsApp...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while we connect to the service
            </Typography>
          </>
        )}

        {status === 'qr_required' && qrData && (
          <>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 500 }}>
              Scan WhatsApp QR Code
            </Typography>
            <Box
              sx={{
                p: 2,
                mb: 3,
                border: `1px dashed ${theme.palette.divider}`,
                borderRadius: 1,
                display: 'inline-block',
                backgroundColor: 'white'
              }}
            >
              <QRCode
                value={qrData}
                size={256}
                level="H"
                includeMargin
                fgColor={theme.palette.getContrastText(theme.palette.background.paper)}
              />
            </Box>
            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                To connect your WhatsApp account:
              </Typography>
              <ol style={{
                paddingLeft: 20,
                margin: 0,
                textAlign: 'left'
              }}>
                <li>Open WhatsApp on your phone</li>
                <li>Tap <strong>Menu → Linked Devices</strong></li>
                <li>Point your phone at this QR code</li>
              </ol>
            </Box>
          </>
        )}

        {status === 'error' && (
          <>
            <Alert
              severity="error"
              sx={{
                mb: 3,
                textAlign: 'left'
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Connection Error
              </Typography>
              <Typography variant="body2">
                {error}
              </Typography>
              {retryCount > 1 && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Attempt {retryCount} of 3
                </Typography>
              )}
            </Alert>
            <Button
              variant="contained"
              color="primary"
              onClick={handleRetry}
              size="large"
              fullWidth
              sx={{
                py: 1.5,
                fontWeight: 500
              }}
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Connecting...' : 'Retry Connection'}
            </Button>
            {retryCount > 2 && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 2 }}
              >
                If the problem persists, please check:
                <ul style={{ paddingLeft: 20, marginTop: 4 }}>
                  <li>Backend server is running</li>
                  <li>Network connection is stable</li>
                </ul>
              </Typography>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
};

export default AuthPage;