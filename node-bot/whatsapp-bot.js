require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

const whatsappClient = new Client({
  authStrategy: new LocalAuth({
    clientId: 'main-session',
    dataPath: path.join(__dirname, 'wwebjs_auth')
  }),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--single-process',
      '--disable-gpu',
      '--no-zygote'
    ]
  },
  takeoverOnConflict: true,
  restartOnAuthFail: true
});

let currentQR = null;
let isReady = false;
let reconnectTimeout = null;

// Функция для получения всех чатов (групп и контактов)
async function getAllChats() {
  try {
    console.log('Fetching chats from WhatsApp...');
    const chats = await whatsappClient.getChats();

    console.log(`Total chats found: ${chats.length}`);
    const groups = chats.filter(chat => chat.isGroup);
    console.log(`Groups found: ${groups.length}`);

    return chats.map(chat => ({
      id: chat.id._serialized,
      name: chat.name || chat.id.user,
      isGroup: chat.isGroup,
      participantsCount: chat.isGroup ? chat.participants.length : 0
    }));
  } catch (err) {
    console.error('Error in getAllChats:', err);
    throw err;
  }
}

// Обработчики событий WhatsApp
whatsappClient.on('qr', (qr) => {
  console.log('QR code received');
  currentQR = qr;
  isReady = false;
  broadcast({ type: 'qr', qr });
});

whatsappClient.on('authenticated', () => {
  console.log('Authenticated successfully');
});

whatsappClient.on('auth_failure', (msg) => {
  console.error('Authentication failure:', msg);
  isReady = false;
});

whatsappClient.on('ready', async () => {
  console.log('Client is ready');
  isReady = true;
  currentQR = null;

  try {
    const contacts = await getAllChats();
    console.log('Sending contacts to clients:', contacts.length);

    broadcast({
      type: 'ready',
      user: {
        id: whatsappClient.info.wid._serialized,
        name: whatsappClient.info.pushname,
        phone: whatsappClient.info.wid.user
      },
      contacts // Отправляем все контакты (группы будут с isGroup: true)
    });
  } catch (err) {
    console.error('Error in ready handler:', err);
  }
});

whatsappClient.on('disconnected', (reason) => {
  console.log('Disconnected:', reason);
  isReady = false;

  // Автопереподключение с экспоненциальной задержкой
  const delay = Math.min(5000 * (reconnectAttempts + 1), 30000);
  console.log(`Attempting to reconnect in ${delay}ms`);

  reconnectTimeout = setTimeout(() => {
    whatsappClient.initialize()
      .then(() => console.log('Reconnection initialized'))
      .catch(err => console.error('Reconnection error:', err));
  }, delay);
});

// Обработка WebSocket соединений
wss.on('connection', async (ws) => {
  console.log('New WebSocket connection');

  // Отправка текущего состояния при подключении
  if (isReady) {
    try {
      const contacts = await getAllChats();
      ws.send(JSON.stringify({
        type: 'ready',
        user: {
          id: whatsappClient.info.wid._serialized,
          name: whatsappClient.info.pushname,
          phone: whatsappClient.info.wid.user
        },
        contacts
      }));
    } catch (err) {
      console.error('Error sending initial state:', err);
    }
  } else if (currentQR) {
    ws.send(JSON.stringify({ type: 'qr', qr: currentQR }));
  }

  // Обработка входящих сообщений
  ws.on('message', async (message) => {
    try {
      const { action, data } = JSON.parse(message);
      console.log('Received action:', action);

      if (action === 'getStatus') {
        if (isReady) {
          const contacts = await getAllChats();
          ws.send(JSON.stringify({
            type: 'ready',
            user: {
              id: whatsappClient.info.wid._serialized,
              name: whatsappClient.info.pushname,
              phone: whatsappClient.info.wid.user
            },
            contacts
          }));
        } else if (currentQR) {
          ws.send(JSON.stringify({ type: 'qr', qr: currentQR }));
        }
      }

      if (action === 'sendBulk') {
        if (!isReady) throw new Error('WhatsApp client is not ready');

        const { recipients, message } = data;
        console.log(`Sending message to ${recipients.length} recipients`);

        const results = [];
        for (const recipient of recipients) {
          try {
            await whatsappClient.sendMessage(recipient, message);
            results.push({ status: 'success', recipient });
          } catch (err) {
            console.error(`Error sending to ${recipient}:`, err);
            results.push({ status: 'error', recipient, error: err.message });
          }
        }

        ws.send(JSON.stringify({
          type: 'sendResults',
          results
        }));
      }
    } catch (err) {
      console.error('Error processing message:', err);
      ws.send(JSON.stringify({
        type: 'error',
        message: err.message
      }));
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

// Широковещательная рассылка
function broadcast(message) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

// Запуск сервера
const PORT = process.env.PORT || 5001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server started on port ${PORT}`);
  whatsappClient.initialize()
    .then(() => console.log('WhatsApp client initializing...'))
    .catch(err => console.error('Initialization error:', err));
});

// Обработка завершения работы
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  clearTimeout(reconnectTimeout);
  try {
    await whatsappClient.destroy();
    server.close();
    process.exit(0);
  } catch (err) {
    console.error('Shutdown error:', err);
    process.exit(1);
  }
});