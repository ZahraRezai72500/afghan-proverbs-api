import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import cors from 'cors';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
const PORT = 3000;
const dataPath = path.join(__dirname, 'data', 'proverbs.json');

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// GET all proverbs
app.get('/api/proverbs', async (req, res) => {
  try {
    const data = await fs.readFile(dataPath, 'utf-8');
    const proverbs = JSON.parse(data);
    res.json(proverbs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single proverb by ID
app.get('/api/proverbs/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = await fs.readFile(dataPath);
    const proverbs = JSON.parse(data);
    const proverb = proverbs.find(p => p.id === id);
    if (!proverb) {
      return res.status(404).json({ error: 'Proverb not found' });
    }
    res.json(proverb);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new proverb
app.post('/api/proverbs', async (req, res) => {
  try {
    const data = await fs.readFile(dataPath);
    const proverbs = JSON.parse(data);
    const newId = proverbs.length ? Math.max(...proverbs.map(p => p.id)) + 1 : 1;
    const newProverb = { id: newId, ...req.body };
    proverbs.push(newProverb);
    await fs.writeFile(dataPath, JSON.stringify(proverbs, null, 2));
    res.status(201).json(newProverb);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT (update) proverb by ID
app.put('/api/proverbs/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = await fs.readFile(dataPath);
    let proverbs = JSON.parse(data);
    const index = proverbs.findIndex(p => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Proverb not found' });
    }
    proverbs[index] = { ...proverbs[index], ...req.body };
    await fs.writeFile(dataPath, JSON.stringify(proverbs, null, 2));
    res.json(proverbs[index]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE proverb by ID
app.delete('/api/proverbs/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = await fs.readFile(dataPath);
    let proverbs = JSON.parse(data);
    const filtered = proverbs.filter(p => p.id !== id);
    if (filtered.length === proverbs.length) {
      return res.status(404).json({ error: 'Proverb not found' });
    }
    await fs.writeFile(dataPath, JSON.stringify(filtered, null, 2));
    res.json({ message: 'Proverb deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Server start
app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});