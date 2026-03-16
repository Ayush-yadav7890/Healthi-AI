const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Frontend files serve karo
app.use(express.static(path.join(__dirname, '../frontend')));

// Test route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Health AI Backend running!' });
});

// Main diagnose route
app.post('/api/diagnose', (req, res) => {
  const { symptoms } = req.body;

  if (!symptoms) {
    return res.status(400).json({ error: 'Symptoms required!' });
  }

  console.log('Received symptoms:', symptoms);

  // Python RAG engine call karo
  const python = spawn('python', [
    path.join(__dirname, '../rag-engine/query.py'),
    symptoms
  ]);

  let result = '';
  let errorOutput = '';

  python.stdout.on('data', (data) => {
    result += data.toString();
  });

  python.stderr.on('data', (data) => {
    errorOutput += data.toString();
  });

  python.on('close', (code) => {
    if (code !== 0) {
      console.error('Python error:', errorOutput);
      return res.status(500).json({ error: 'RAG engine failed!' });
    }
    try {
      // Last line mein JSON hoga
      const lines = result.trim().split('\n');
      const jsonLine = lines[lines.length - 1];
      const parsed = JSON.parse(jsonLine);
      res.json(parsed);
    } catch (e) {
      res.status(500).json({ error: 'Could not parse response!' });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});