const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:3002', // Лучше использовать localhost вместо 127.0.0.1
      changeOrigin: true,
      ws: true, // Важно для WebSocket соединений
      secure: false, // Для разработки можно отключить
      logLevel: 'debug', // Включите логирование для отладки
      onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.status(502).json({ error: 'Cannot connect to backend server' });
      },
      headers: {
        'Connection': 'keep-alive',
        'X-Forwarded-Proto': 'http'
      }
    })
  );
};