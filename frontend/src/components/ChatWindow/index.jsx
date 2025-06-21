import { Box, TextField, IconButton, List, CircularProgress, Snackbar, Badge } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import Message from './Message';
import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useSocket } from '../../contexts/SocketContext';

export default function ChatWindow({ chatId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { socket, isConnected } = useSocket();

  // Загрузка сообщений
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const { data } = await api.get(`/api/chats/${chatId}/messages`);
        setMessages(data.messages);
      } catch (err) {
        setError('Ошибка загрузки сообщений');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (chatId) loadMessages();
  }, [chatId]);

  // Подписка на новые сообщения через WebSocket
  useEffect(() => {
    if (!socket || !chatId) return;

    const handleNewMessage = (data) => {
      if (data.chatId === chatId) {
        setMessages(prev => [...prev, {
          ...data.message,
          isMe: data.sender === JSON.parse(localStorage.getItem('user'))?.phone
        }]);
      }
    };

    socket.on('newMessage', handleNewMessage);
    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [socket, chatId]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    
    const tempId = Date.now();
    const user = JSON.parse(localStorage.getItem('user'));
    
    const tempMessage = {
      id: `temp_${tempId}`,
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      status: 'sending'
    };

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');

    try {
      await api.post('/api/messages', {
        chatId,
        text: newMessage
      });

      setMessages(prev => prev.map(msg => 
        msg.id === tempMessage.id ? { ...msg, status: 'sent' } : msg
      ));
    } catch (err) {
      setError('Не удалось отправить сообщение');
      setMessages(prev => prev.map(msg => 
        msg.id === tempMessage.id ? { ...msg, status: 'failed' } : msg
      ));
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      backgroundColor: '#f5f5f5'
    }}>
      {/* Статус соединения */}
      <Box sx={{ 
        p: 1, 
        bgcolor: isConnected ? 'success.light' : 'error.light',
        color: 'white',
        textAlign: 'center'
      }}>
        {isConnected ? 'Online' : 'Offline'}
      </Box>

      {/* Список сообщений */}
      <Box sx={{ 
        flexGrow: 1, 
        overflow: 'auto',
        p: 2,
        backgroundImage: 'url(/chat-bg-pattern.png)',
        backgroundRepeat: 'repeat'
      }}>
        <List sx={{ display: 'flex', flexDirection: 'column' }}>
          {messages.map((msg) => (
            <Message key={msg.id || msg.tempId} message={msg} />
          ))}
        </List>
      </Box>
      
      {/* Поле ввода */}
      <Box sx={{ 
        p: 2, 
        borderTop: '1px solid #ddd',
        backgroundColor: 'white'
      }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Введите сообщение..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          disabled={!isConnected}
          InputProps={{
            endAdornment: (
              <IconButton 
                onClick={handleSend}
                disabled={!newMessage.trim() || !isConnected}
              >
                <SendIcon color={
                  !newMessage.trim() || !isConnected 
                    ? "disabled" 
                    : "primary"
                } />
              </IconButton>
            ),
            sx: { backgroundColor: 'white' }
          }}
        />
      </Box>

      {/* Уведомления об ошибках */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        message={error}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
    </Box>
  );
}