const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Health-check endpoint (must be BEFORE the static/catch‑all)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files from the Vite build output
app.use(express.static(path.join(__dirname, 'dist')));

// Catch‑all: for any route not matched above, serve index.html (SPA fallback)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Frontend server running on port ${PORT}`);
});