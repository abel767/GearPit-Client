// api/proxy.js
import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();

app.use(cors());
app.use(express.json());

// Create proxy middleware
// In your api/proxy.js file, add a timeout option:
app.use('/', createProxyMiddleware({
  target: 'https://51.20.143.235.nip.io',
  changeOrigin: true,
  timeout: 60000, // 60 seconds timeout
  proxyTimeout: 60000
}));

export default app;