const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;
const CARDS_FILE = path.join(__dirname, 'cards.json');

// Initialize cards file
if (!fs.existsSync(CARDS_FILE)) {
  fs.writeFileSync(CARDS_FILE, '[]', 'utf-8');
}

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// GET /api/cards — Get all cards
app.get('/api/cards', (req, res) => {
  try {
    const data = fs.readFileSync(CARDS_FILE, 'utf-8');
    const cards = JSON.parse(data);
    res.json({ cards, count: cards.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read cards' });
  }
});

// POST /api/cards — Add a new card
app.post('/api/cards', (req, res) => {
  try {
    const cards = JSON.parse(fs.readFileSync(CARDS_FILE, 'utf-8'));
    const newCard = {
      ...req.body,
      id: req.body.id || `server-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      created_at: req.body.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    cards.push(newCard);
    fs.writeFileSync(CARDS_FILE, JSON.stringify(cards, null, 2), 'utf-8');
    res.status(201).json({ card: newCard, count: cards.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add card' });
  }
});

// PUT /api/cards/:id — Update a card
app.put('/api/cards/:id', (req, res) => {
  try {
    const cards = JSON.parse(fs.readFileSync(CARDS_FILE, 'utf-8'));
    const idx = cards.findIndex(c => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Card not found' });
    
    cards[idx] = { ...cards[idx], ...req.body, updated_at: new Date().toISOString() };
    fs.writeFileSync(CARDS_FILE, JSON.stringify(cards, null, 2), 'utf-8');
    res.json({ card: cards[idx], count: cards.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update card' });
  }
});

// DELETE /api/cards/:id — Delete a card
app.delete('/api/cards/:id', (req, res) => {
  try {
    let cards = JSON.parse(fs.readFileSync(CARDS_FILE, 'utf-8'));
    const before = cards.length;
    cards = cards.filter(c => c.id !== req.params.id);
    if (cards.length === before) return res.status(404).json({ error: 'Card not found' });
    
    fs.writeFileSync(CARDS_FILE, JSON.stringify(cards, null, 2), 'utf-8');
    res.json({ count: cards.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete card' });
  }
});

// PUT /api/cards — Replace all cards (bulk sync)
app.put('/api/cards', (req, res) => {
  try {
    const cards = req.body.cards || [];
    fs.writeFileSync(CARDS_FILE, JSON.stringify(cards, null, 2), 'utf-8');
    res.json({ count: cards.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to replace cards' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🃏 Card sync server running on port ${PORT}`);
  console.log(`📁 Cards file: ${CARDS_FILE}`);
});
