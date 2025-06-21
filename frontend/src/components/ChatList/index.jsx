import { 
  List, 
  CircularProgress, 
  Alert, 
  AlertTitle,
  TextField,
  InputAdornment,
  IconButton,
  Box,
  Typography
} from '@mui/material';
import { Search as SearchIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import ChatItem from './ChatItem';

export default function ChatList({ 
  onSelectChat, 
  activeChat,
  refreshFlag 
}) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Функция загрузки чатов
  const fetchChats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/chats');
      
      // Преобразуем данные для WhatsApp Web API
      const formattedChats = response.data.map(chat => ({
        id: chat.id._serialized || chat.id, // Поддержка разных форматов ID
        name: chat.name || chat.id.user || 'Без названия',
        lastMessage: chat.lastMessage?.body || '',
        unreadCount: chat.unreadCount || 0,
        isGroup: chat.isGroup || false,
        timestamp: chat.lastMessage?.timestamp || Date.now()
      }));
      
      setChats(formattedChats);
      setError(null);
    } catch (err) {
      console.error('Ошибка загрузки чатов:', err);
      setError(err.response?.data?.message || 'Не удалось загрузить чаты');
      
      // Перенаправление при 401 ошибке
      if (err.response?.status === 401) {
        window.location.href = '/auth';
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Загрузка при монтировании и изменении refreshFlag
  useEffect(() => {
    fetchChats();
  }, [fetchChats, refreshFlag]);

  // Фильтрация чатов по поисковому запросу
  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Обработчик обновления списка
  const handleRefresh = () => {
    setSearchQuery('');
    fetchChats();
  };

  // Отображение состояния загрузки
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        height: '100%'
      }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>
          Загрузка чатов...
        </Typography>
      </Box>
    );
  }

  // Отображение ошибок
  if (error) {
    return (
      <Alert 
        severity="error"
        sx={{ m: 2 }}
        action={
          <IconButton 
            color="inherit" 
            size="small"
            onClick={handleRefresh}
          >
            <RefreshIcon />
          </IconButton>
        }
      >
        <AlertTitle>Ошибка</AlertTitle>
        {error}
      </Alert>
    );
  }

  // Основной интерфейс
  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: 'background.default'
    }}>
      {/* Панель поиска */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Поиск чатов..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <IconButton
                size="small"
                onClick={() => setSearchQuery('')}
                edge="end"
              >
                <Typography variant="caption" color="text.secondary">
                  Очистить
                </Typography>
              </IconButton>
            )
          }}
        />
      </Box>

      {/* Список чатов */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        {filteredChats.length > 0 ? (
          <List sx={{ 
            height: '100%', 
            overflow: 'auto',
            py: 0
          }}>
            {filteredChats.map(chat => (
              <ChatItem
                key={chat.id}
                chat={chat}
                onClick={() => onSelectChat(chat.id)}
                isActive={activeChat === chat.id}
              />
            ))}
          </List>
        ) : (
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            p: 3
          }}>
            <Typography variant="h6" color="text.secondary">
              {searchQuery ? 'Чаты не найдены' : 'Нет доступных чатов'}
            </Typography>
            <IconButton 
              onClick={handleRefresh}
              color="primary"
              sx={{ mt: 2 }}
            >
              <RefreshIcon />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* Панель статуса */}
      <Box sx={{ 
        p: 1, 
        borderTop: 1, 
        borderColor: 'divider',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="caption" color="text.secondary">
          {filteredChats.length} из {chats.length} чатов
        </Typography>
        <IconButton 
          onClick={handleRefresh}
          size="small"
          color="primary"
        >
          <RefreshIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
}