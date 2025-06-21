import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  CssBaseline,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Snackbar,
  TextField,
  ThemeProvider,
  Typography,
  createTheme,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  AppBar,
  Toolbar
} from '@mui/material';
import {
  Send as SendIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Logout as LogoutIcon,
  QrCode as QrCodeIcon
} from '@mui/icons-material';
import MuiAlert from '@mui/material/Alert';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function App() {
  const [state, setState] = useState({
    status: 'disconnected',
    qrCode: '',
    contacts: [],
    groups: [],
    selectedGroups: [],
    message: '',
    sending: false,
    notifications: [],
    templates: [],
    openTemplateDialog: false,
    newTemplate: { name: '', text: '' },
    currentUser: null
  });

  const ws = useRef(null);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    const websocketUrl = `ws://${window.location.hostname}:5001`;
    ws.current = new WebSocket(websocketUrl);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      setState(prev => ({ ...prev, status: 'connecting' }));
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
      setState(prev => ({ ...prev, status: 'disconnected' }));
      setTimeout(connectWebSocket, 5000);
    };

    ws.current.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        console.log('Received data:', data);

        switch (data.type) {
          case 'qr':
            setState(prev => ({
              ...prev,
              status: 'connecting',
              qrCode: data.qr,
              currentUser: null
            }));
            break;

          case 'ready':
            setState(prev => ({
              ...prev,
              status: 'ready',
              contacts: data.contacts || [],
              groups: data.contacts.filter(c => c.isGroup),
              templates: data.templates || prev.templates,
              currentUser: data.user
            }));
            break;

          case 'logoutSuccess':
            setState(prev => ({
              ...prev,
              status: 'disconnected',
              currentUser: null,
              notifications: [...prev.notifications, {
                id: Date.now(),
                message: 'Вы успешно вышли из аккаунта',
                severity: 'success'
              }]
            }));
            break;

          case 'messageStatus':
            setState(prev => ({
              ...prev,
              notifications: [...prev.notifications, {
                id: Date.now(),
                message: `Сообщение ${data.messageId} ${getStatusText(data.status)}`,
                severity: data.status === 3 ? 'success' : 'info'
              }]
            }));
            break;

          case 'sendResults':
            setState(prev => ({
              ...prev,
              sending: false,
              notifications: [...prev.notifications, {
                id: Date.now(),
                message: `Отправлено ${data.results.filter(r => r.status === 'sent').length} из ${data.results.length} сообщений`,
                severity: 'info'
              }]
            }));
            break;

          case 'templateAdded':
            setState(prev => ({
              ...prev,
              templates: [...prev.templates, data.template],
              notifications: [...prev.notifications, {
                id: Date.now(),
                message: `Шаблон "${data.template.name}" добавлен`,
                severity: 'success'
              }],
              openTemplateDialog: false,
              newTemplate: { name: '', text: '' }
            }));
            break;

          case 'templateDeleted':
            setState(prev => ({
              ...prev,
              templates: prev.templates.filter(t => t.id !== data.id),
              notifications: [...prev.notifications, {
                id: Date.now(),
                message: 'Шаблон удален',
                severity: 'info'
              }]
            }));
            break;

          case 'error':
            setState(prev => ({
              ...prev,
              sending: false,
              notifications: [...prev.notifications, {
                id: Date.now(),
                message: data.message || 'Произошла ошибка',
                severity: 'error'
              }]
            }));
            break;

          default:
            console.log('Unknown message type:', data.type);
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };
  };

  const getStatusText = (ack) => {
    switch(ack) {
      case 1: return 'доставлено на сервер';
      case 2: return 'доставлено получателю';
      case 3: return 'прочитано';
      default: return 'отправлено';
    }
  };

  const handleSendMessage = () => {
    if (!state.selectedGroups.length || !state.message.trim()) return;

    setState(prev => ({ ...prev, sending: true }));

    ws.current.send(JSON.stringify({
      action: 'sendBulk',
      data: {
        recipients: state.selectedGroups,
        message: state.message
      }
    }));
  };

  const handleLogout = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        action: 'forceLogout'
      }));
    }
  };

  const handleGroupSelect = (event) => {
    setState(prev => ({
      ...prev,
      selectedGroups: event.target.value
    }));
  };

  const handleTemplateSelect = (template) => {
    setState(prev => ({
      ...prev,
      message: template.text
    }));
  };

  const handleAddTemplate = () => {
    if (!state.newTemplate.name.trim() || !state.newTemplate.text.trim()) return;

    ws.current.send(JSON.stringify({
      action: 'addTemplate',
      data: state.newTemplate
    }));
  };

  const handleDeleteTemplate = (id) => {
    ws.current.send(JSON.stringify({
      action: 'deleteTemplate',
      data: { id }
    }));
  };

  const handleNotificationClose = (id) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.id !== id)
    }));
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />

      {/* Шапка с кнопкой выхода */}
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            WhatsApp Bulk Sender
          </Typography>

          {state.currentUser && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ mr: 2 }}>
                {state.currentUser.name || state.currentUser.phone}
              </Typography>
              <Tooltip title="Выйти из аккаунта">
                <IconButton
                  color="error"
                  onClick={handleLogout}
                >
                  <LogoutIcon />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          {state.status === 'disconnected' && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress />
              <Typography variant="body1" sx={{ mt: 2 }}>
                Подключение к серверу...
              </Typography>
            </Box>
          )}

          {state.status === 'connecting' && state.qrCode && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" gutterBottom>
                Отсканируйте QR-код в WhatsApp
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <QrCodeIcon color="primary" sx={{ fontSize: 40, mr: 1 }} />
                <Typography variant="body1">
                  WhatsApp → Настройки → Сканировать QR-код
                </Typography>
              </Box>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(state.qrCode)}`}
                alt="QR Code"
                style={{ margin: '0 auto' }}
              />
            </Box>
          )}

          {state.status === 'ready' && (
            <>
              <Box sx={{ mb: 4 }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="groups-select-label">Группы</InputLabel>
                  <Select
                    labelId="groups-select-label"
                    multiple
                    value={state.selectedGroups}
                    onChange={handleGroupSelect}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((groupId) => {
                          const group = state.groups.find(g => g.id === groupId);
                          return (
                            <Typography key={groupId} variant="body2">
                              {group?.name || groupId}
                            </Typography>
                          );
                        })}
                      </Box>
                    )}
                  >
                    {state.groups.map((group) => (
                      <MenuItem key={group.id} value={group.id}>
                        <ListItemText
                          primary={group.name || 'Без названия'}
                          secondary={`Участников: ${group.participantsCount}`}
                        />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  label="Сообщение"
                  value={state.message}
                  onChange={(e) => setState(prev => ({ ...prev, message: e.target.value }))}
                  sx={{ mb: 2 }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Button
                      variant="contained"
                      onClick={handleSendMessage}
                      disabled={state.sending || !state.selectedGroups.length || !state.message.trim()}
                      startIcon={state.sending ? <CircularProgress size={20} /> : <SendIcon />}
                    >
                      {state.sending ? 'Отправка...' : 'Отправить'}
                    </Button>

                    <Button
                      variant="outlined"
                      sx={{ ml: 2 }}
                      onClick={() => setState(prev => ({ ...prev, openTemplateDialog: true }))}
                      startIcon={<AddIcon />}
                    >
                      Шаблон
                    </Button>
                  </Box>

                  <Typography variant="body2">
                    Выбрано групп: {state.selectedGroups.length}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box>
                <Typography variant="h6" gutterBottom>
                  Шаблоны сообщений
                </Typography>

                {state.templates.length > 0 ? (
                  <List dense>
                    {state.templates.map((template) => (
                      <ListItem
                        key={template.id}
                        secondaryAction={
                          <Tooltip title="Удалить">
                            <IconButton
                              edge="end"
                              onClick={() => handleDeleteTemplate(template.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        }
                      >
                        <ListItemText
                          primary={template.name}
                          secondary={template.text.length > 50
                            ? `${template.text.substring(0, 50)}...`
                            : template.text}
                          onClick={() => handleTemplateSelect(template)}
                          sx={{ cursor: 'pointer' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Нет сохраненных шаблонов
                  </Typography>
                )}
              </Box>
            </>
          )}
        </Paper>
      </Container>

      {/* Диалог добавления шаблона */}
      <Dialog
        open={state.openTemplateDialog}
        onClose={() => setState(prev => ({ ...prev, openTemplateDialog: false }))}
      >
        <DialogTitle>Добавить новый шаблон</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название шаблона"
            fullWidth
            variant="standard"
            value={state.newTemplate.name}
            onChange={(e) => setState(prev => ({
              ...prev,
              newTemplate: { ...prev.newTemplate, name: e.target.value }
            }))}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Текст сообщения"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={state.newTemplate.text}
            onChange={(e) => setState(prev => ({
              ...prev,
              newTemplate: { ...prev.newTemplate, text: e.target.value }
            }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setState(prev => ({ ...prev, openTemplateDialog: false }))}>
            Отмена
          </Button>
          <Button
            onClick={handleAddTemplate}
            disabled={!state.newTemplate.name.trim() || !state.newTemplate.text.trim()}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Уведомления */}
      {state.notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open
          autoHideDuration={6000}
          onClose={() => handleNotificationClose(notification.id)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => handleNotificationClose(notification.id)}
            severity={notification.severity}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </ThemeProvider>
  );
}

export default App;