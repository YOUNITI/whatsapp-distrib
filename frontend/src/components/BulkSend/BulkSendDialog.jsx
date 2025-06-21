import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Typography,
  Alert
} from '@mui/material';

export function BulkSendDialog({ open, onClose, onSend, selectedCount }) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const handleSend = async () => {
    if (!message.trim()) {
      setError('Введите текст сообщения');
      return;
    }

    setSending(true);
    setError(null);
    try {
      const success = await onSend(message);
      if (success) {
        setMessage('');
        onClose();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Массовая рассылка
        <Typography variant="subtitle2" color="text.secondary">
          Выбрано чатов: {selectedCount}
        </Typography>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          autoFocus
          margin="dense"
          label="Текст сообщения"
          fullWidth
          multiline
          rows={6}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            setError(null);
          }}
          disabled={sending}
          error={!!error}
          helperText={error}
        />
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
          disabled={sending}
          color="secondary"
        >
          Отмена
        </Button>
        <Button
          onClick={handleSend}
          color="primary"
          variant="contained"
          disabled={sending || selectedCount === 0}
          startIcon={sending ? <CircularProgress size={20} /> : null}
        >
          {sending ? 'Отправка...' : 'Отправить'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}