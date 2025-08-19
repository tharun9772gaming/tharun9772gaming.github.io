const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');
const url = require('url');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Proxy endpoint
app.use('/proxy', (req, res, next) => {
  const targetUrl = req.query.url;
  if (!targetUrl || !/^https?:\/\//i.test(targetUrl)) {
    return res.status(400).send('Invalid or missing URL.');
  }
  // Remove /proxy?url=
  req.url = url.parse(targetUrl).path || '/';
  createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    secure: false,
    selfHandleResponse: false,
    onProxyReq: (proxyReq, req, res) => {
      // Change the host header to match the target
      proxyReq.setHeader('host', url.parse(targetUrl).host);
    },
  })(req, res, next);
});

// Serve static files (if needed)
app.use(express.static(path.join(__dirname)));

// Start server
app.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
});
