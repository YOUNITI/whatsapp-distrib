import React, { useState, useEffect } from 'react';

const QRScanner = ({ darkMode }) => {
  const [qrData, setQrData] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3003');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'qr_update' && data.qr && data.qr.length < 500) {
        setQrData(data.qr);
        setStatus('ready');
        setError(null);
      }
      else if (data.type === 'qr_error') {
        setError(data.message || 'QR generation error');
        setStatus('error');
      }
      else if (data.type === 'status_update') {
        setStatus(data.status);
      }
    };

    ws.onerror = () => {
      setError('Connection error');
      setStatus('error');
    };

    return () => ws.close();
  }, []);

  const renderQR = () => {
    if (!qrData) return null;

    // Используем нативный canvas вместо библиотеки
    return (
      <canvas
        id="qr-canvas"
        style={{
          width: '300px',
          height: '300px',
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '8px'
        }}
      />
    );
  };

  useEffect(() => {
    if (qrData && status === 'ready') {
      // Ручная отрисовка QR через Canvas API
      const canvas = document.getElementById('qr-canvas');
      if (canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = 300;
        canvas.height = 300;

        // Простая реализация QR (псевдокод)
        drawCustomQR(ctx, qrData, 300, 300);
      }
    }
  }, [qrData, status]);

  const styles = {
    container: {
      backgroundColor: darkMode ? '#1e1e1e' : '#f5f5f5',
      color: darkMode ? '#ffffff' : '#333333',
      padding: '30px',
      borderRadius: '12px',
      textAlign: 'center',
      maxWidth: '500px',
      margin: '0 auto'
    },
    statusText: {
      color: darkMode ? '#aaaaaa' : '#666666',
      margin: '20px 0',
      minHeight: '24px'
    },
    errorText: {
      color: '#ff4444',
      margin: '20px 0'
    }
  };

  return (
    <div style={styles.container}>
      <h2>WhatsApp Connection</h2>

      {status === 'loading' && (
        <p style={styles.statusText}>Initializing QR scanner...</p>
      )}

      {status === 'ready' && renderQR()}

      {status === 'error' && (
        <p style={styles.errorText}>
          {error || 'Unknown error occurred'}
        </p>
      )}

      <div style={{ marginTop: '25px', textAlign: 'left' }}>
        <h3>Instructions:</h3>
        <ol style={{ paddingLeft: '20px' }}>
          <li>Open WhatsApp → Settings → Linked Devices</li>
          <li>Tap on "Link a Device"</li>
          <li>Point your camera at the QR code</li>
        </ol>
      </div>
    </div>
  );
};

// Простейшая реализация рисования QR
function drawCustomQR(ctx, data, width, height) {
  const cellSize = Math.floor(width / 20);
  const offset = (width - (20 * cellSize)) / 2;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#000000';
  for (let i = 0; i < data.length; i++) {
    if (data[i] === '1') {
      const x = offset + (i % 20) * cellSize;
      const y = offset + Math.floor(i / 20) * cellSize;
      ctx.fillRect(x, y, cellSize, cellSize);
    }
  }
}

export default QRScanner;