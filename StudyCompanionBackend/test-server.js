const express = require('express');
const cors = require('cors');
const app = express();
const port = 8080;

// CORS config
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

// JSON body parser
app.use(express.json({ limit: "10mb" }));

// Basic route
app.get('/', (req, res) => {
  console.log('Root endpoint hit');
  res.send('Express server with CORS is working!');
});

// Test JSON route
app.get('/json', (req, res) => {
  console.log('JSON endpoint hit');
  res.json({ message: 'This is a JSON response' });
});

// Echo POST endpoint - will echo back whatever JSON you send
app.post('/echo', (req, res) => {
  console.log('Echo endpoint hit with body:', req.body);
  res.json({
    message: 'Received your data',
    receivedData: req.body
  });
});

app.listen(port, '127.0.0.1', () => {
  console.log(`Express server with CORS running at http://127.0.0.1:${port}/`);
  console.log(`Test with: curl http://127.0.0.1:${port}`);
  console.log(`Test POST with: curl -X POST http://127.0.0.1:${port}/echo -H "Content-Type: application/json" -d '{"test":"data"}'`);
});