import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Avatar,
  Box,
  List,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Checkbox,
  ListItem,
  ListItemText
} from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import Message from '../components/ChatWindow/Message';
import MessageSender from '../components/ChatWindow/MessageSender';
import { WebSocketContext } from '../contexts/WebSocketContext';

export default function Dashboard() {
  const [authData, setAuthData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [ws, setWs] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedChats, setSelectedChats] = useState([]);
  const [availableChats, setAvailableChats] = useState([
    { id: '79223334455@c.us', name: 'Алексей' },
    { id: '79223337788@c.us', name: 'Мария' },
    { id: '79223339911@c.us', name: 'Сергей' }
  ]);

  // Загрузка данных авторизации
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('whatsapp_auth')) || {};
    setAuthData(data);
  }, []);

  // Подключение WebSocket
  useEffect(() => {
    if (!authData?.phone) return;

    const socket = new WebSocket('ws://localhost:5002');
    setWs(socket);

    return () => socket.close();
  }, [authData]);

  // Отправка сообщения в несколько чатов
  const handleBulkSend = (text) => {
    if (!text.trim() || selectedChats.length === 0) return;

    selectedChats.forEach(chatId => {
      const newMessage = {
        text,
        time: new Date().toLocaleTimeString(),
        isMe: true,
        status: 'sending',
        chatId
      };

      setMessages(prev => [...prev, newMessage]);

      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          action: 'SEND_MESSAGE',
          payload: {
            chatId,
            text
          }
        }));

        setTimeout(() => {
          setMessages(prev => prev.map(msg =>
            msg === newMessage ? { ...msg, status: 'sent' } : msg
          ));
        }, 1000);
      }
    });
  };

  return (
    <WebSocketContext.Provider value={ws}>
      <Container maxWidth="md" sx={{ pb: 8 }}>
        {/* Шапка профиля */}
        <Paper elevation={3} sx={{ p: 4, mt: 4, textAlign: 'center' }}>
          <Avatar sx={{ width: 80, height: 80, mb: 2, bgcolor: 'success.main', mx: 'auto' }}>
            <WhatsAppIcon fontSize="large" />
          </Avatar>
          <Typography variant="h4" gutterBottom>WhatsApp подключен</Typography>
          <Typography variant="h6" sx={{ mb: 2 }}>+{authData?.phone}</Typography>
          <Typography color="text.secondary">
            Статус: {authData?.status || 'авторизован'}
          </Typography>

          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => setOpenDialog(true)}
          >
            Массовая рассылка
          </Button>
        </Paper>

        {/* Окно чата */}
        <Paper elevation={3} sx={{ mt: 4, height: '400px', overflow: 'auto' }}>
          <List>
            {messages.filter(m => !m.chatId || m.chatId === 'current').map((msg, index) => (
              <React.Fragment key={index}>
                <Message message={msg} />
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>
        </Paper>

        {/* Поле ввода */}
        <Box sx={{ mt: 2 }}>
          <MessageSender onSend={(text) => handleBulkSend(text, ['current'])} />
        </Box>

        {/* Диалог массовой рассылки */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Массовая рассылка</DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">Выберите чаты:</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {availableChats.map(chat => (
                  <Chip
                    key={chat.id}
                    label={chat.name}
                    onClick={() => setSelectedChats(prev =>
                      prev.includes(chat.id)
                        ? prev.filter(id => id !== chat.id)
                        : [...prev, chat.id]
                    )}
                    color={selectedChats.includes(chat.id) ? 'primary' : 'default'}
                    variant={selectedChats.includes(chat.id) ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>
            </Box>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Текст сообщения"
              variant="outlined"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
            <Button
              variant="contained"
              onClick={() => {
                const input = document.querySelector('textarea');
                handleBulkSend(input.value);
                setOpenDialog(false);
              }}
            >
              Отправить
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </WebSocketContext.Provider>
  );
}