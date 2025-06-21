import React from 'react';
import { Snackbar, Alert } from '@mui/material';

export default function Notification() {
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [severity, setSeverity] = React.useState('info');

  // Для демонстрации - в реальном приложении получайте эти данные из контекста
  return (
    <Snackbar open={open} autoHideDuration={6000} onClose={() => setOpen(false)}>
      <Alert onClose={() => setOpen(false)} severity={severity}>
        {message}
      </Alert>
    </Snackbar>
  );
}