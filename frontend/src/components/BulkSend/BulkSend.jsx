import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Checkbox,
  CircularProgress,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  Alert
} from '@mui/material';
import { Search as SearchIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { BulkSendDialog } from './BulkSendDialog';

export default function BulkSend() {
  const [state, setState] = useState({
    chats: [],
    selectedChats: [],
    loading: true,
    error: null,
    searchQuery: '',
    dialogOpen: false
  });

  const fetchChats = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await fetch('/api/chats');
      if (!response.ok) throw new Error('Ошибка загрузки чатов');
      const data = await response.json();
      setState(prev => ({ ...prev, chats: data }));
    } catch (err) {
      setState(prev => ({ ...prev, error: err.message }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const filteredChats = state.chats.filter(chat =>
    chat.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
    chat.lastMessage?.toLowerCase().includes(state.searchQuery.toLowerCase())
  );

  const handleBulkSend = async (message) => {
    try {
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chats: state.selectedChats,
          message
        })
      });
      if (!response.ok) throw new Error('Ошибка отправки');
      return true;
    } catch (err) {
      setState(prev => ({ ...prev, error: err.message }));
      return false;
    }
  };

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        Массовая рассылка
      </Typography>

      {/* Панель управления */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Поиск чатов..."
          value={state.searchQuery}
          onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />
        <Button
          variant="outlined"
          onClick={fetchChats}
          startIcon={<RefreshIcon />}
          disabled={state.loading}
        >
          Обновить
        </Button>
        <Button
          variant="contained"
          onClick={() => setState(prev => ({ ...prev, dialogOpen: true }))}
          disabled={state.selectedChats.length === 0 || state.loading}
          sx={{ ml: 'auto' }}
        >
          Отправить ({state.selectedChats.length})
        </Button>
      </Box>

      {state.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {state.error}
        </Alert>
      )}

      {/* Список чатов */}
      <Paper elevation={3} sx={{ flex: 1, overflow: 'auto' }}>
        {state.loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : filteredChats.length === 0 ? (
          <Typography sx={{ p: 3, textAlign: 'center' }}>
            {state.searchQuery ? 'Чаты не найдены' : 'Нет доступных чатов'}
          </Typography>
        ) : (
          <List>
            {filteredChats.map((chat) => (
              <ListItem key={chat.id} disablePadding>
                <ListItemButton onClick={() =>
                  setState(prev => ({
                    ...prev,
                    selectedChats: prev.selectedChats.includes(chat.id)
                      ? prev.selectedChats.filter(id => id !== chat.id)
                      : [...prev.selectedChats, chat.id]
                  }))}>
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={state.selectedChats.includes(chat.id)}
                      tabIndex={-1}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={chat.name}
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                          sx={{ display: 'block' }}
                        >
                          {chat.isGroup ? 'Группа' : 'Личный чат'}
                        </Typography>
                        {chat.lastMessage && (
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}
                          >
                            {chat.lastMessage}
                          </Typography>
                        )}
                      </>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      <BulkSendDialog
        open={state.dialogOpen}
        onClose={() => setState(prev => ({ ...prev, dialogOpen: false }))}
        onSend={handleBulkSend}
        selectedCount={state.selectedChats.length}
      />
    </Box>
  );
}