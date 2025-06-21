import React, { useState, useContext } from 'react';
import {
  TextField,
  Box,
  IconButton,
  InputAdornment,
  Paper,
  Tooltip
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { WebSocketContext } from '../../contexts/WebSocketContext'; // Исправленный импорт

export default function MessageSender({ onSend }) {
  const [message, setMessage] = useState('');
  const ws = useContext(WebSocketContext);

  const handleSend = () => {
    if (!message.trim()) return;
    onSend(message);
    setMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ p: 2, borderTop: '1px solid #eee' }}>
      <Paper elevation={0} sx={{ p: 1, borderRadius: 4 }}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Напишите сообщение..."
          variant="outlined"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title="Отправить">
                  <IconButton
                    onClick={handleSend}
                    disabled={!message.trim()}
                    color="primary"
                  >
                    <SendIcon />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
            sx: { borderRadius: 4 }
          }}
        />
      </Paper>
    </Box>
  );
}