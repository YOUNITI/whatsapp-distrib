import { Box, Typography, Paper, CircularProgress, Tooltip, useTheme } from '@mui/material';
import { useMemo } from 'react';
import { Check, ErrorOutline, DoneAll, Schedule } from '@mui/icons-material';

export default function Message({ message }) {
  const theme = useTheme();

  const time = useMemo(() => message.time || new Date().toLocaleTimeString(), [message.time]);

  const statusIcon = useMemo(() => {
    switch(message.status) {
      case 'sending': return <Schedule color="disabled" fontSize="small" />;
      case 'sent': return <Check color="action" fontSize="small" />;
      case 'delivered': return <DoneAll color="action" fontSize="small" />;
      case 'read': return <DoneAll color="info" fontSize="small" />;
      case 'failed': return <ErrorOutline color="error" fontSize="small" />;
      default: return null;
    }
  }, [message.status]);

  return (
    <Box sx={{
      display: 'flex',
      justifyContent: message.isMe ? 'flex-end' : 'flex-start',
      mb: 2,
      px: 1
    }}>
      <Tooltip title={`${time} ${message.chatName ? `| ${message.chatName}` : ''}`} placement={message.isMe ? 'left' : 'right'}>
        <Paper sx={{
          p: 1.5,
          maxWidth: '75%',
          backgroundColor: message.isMe
            ? theme.palette.mode === 'dark'
              ? theme.palette.primary.dark
              : '#dcf8c6'
            : theme.palette.background.paper,
          borderRadius: message.isMe ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
          boxShadow: theme.shadows[1]
        }}>
          <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
            {message.text}
          </Typography>
          <Box sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            mt: 0.5,
            gap: 0.5
          }}>
            <Typography variant="caption" sx={{
              color: message.isMe
                ? theme.palette.mode === 'dark'
                  ? 'primary.light'
                  : '#4a8c3e'
                : 'text.secondary'
            }}>
              {time}
            </Typography>
            {message.isMe && statusIcon}
          </Box>
        </Paper>
      </Tooltip>
    </Box>
  );
}