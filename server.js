require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');

const PORT = process.env.PORT || 3000;
const APP_PASSWORD = process.env.APP_PASSWORD || '';
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('ERREUR: la variable d\'environnement DATABASE_URL est manquante.');
  console.error('Elle doit contenir la chaîne de connexion PostgreSQL fournie par votre hébergeur de base de données.');
  process.exit(1);
}
if (!APP_PASSWORD) {
  console.warn('ATTENTION: aucune variable APP_PASSWORD définie — l\'application sera accessible sans mot de passe.');
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const STATE_ID = 'stocky';

async function ensureSchemaAndSeed() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_state (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  const { rows } = await pool.query('SELECT 1 FROM app_state WHERE id = $1', [STATE_ID]);
  if (rows.length === 0) {
    const seedPath = path.join(__dirname, 'seed-data.json');
    let seed = { categories: [], brands: [], units: [], warehouses: [], providers: [], clients: [], products: [], purchases: [], sales: [], employees: [], departments: [], designations: [], companies: [] };
    if (fs.existsSync(seedPath)) {
      seed = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
    }
    await pool.query('INSERT INTO app_state (id, data) VALUES ($1, $2)', [STATE_ID, seed]);
    console.log('Base initialisée avec les données de départ.');
  } else {
    console.log('Base existante détectée — pas de réinitialisation.');
  }
}

const app = express();
app.use(express.json({ limit: '15mb' }));

// --- Auth ---
function checkPassword(req, res, next) {
  if (!APP_PASSWORD) return next();
  const provided = req.headers['x-app-password'];
  if (provided === APP_PASSWORD) return next();
  return res.status(401).json({ error: 'Mot de passe invalide' });
}

app.post('/api/login', (req, res) => {
  const { password } = req.body || {};
  if (!APP_PASSWORD || password === APP_PASSWORD) {
    return res.json({ ok: true });
  }
  return res.status(401).json({ ok: false, error: 'Mot de passe invalide' });
});

app.get('/api/state', checkPassword, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT data, updated_at FROM app_state WHERE id = $1', [STATE_ID]);
    if (rows.length === 0) return res.status(404).json({ error: 'Aucune donnée trouvée' });
    res.json({ data: rows[0].data, updatedAt: rows[0].updated_at });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur lors de la lecture des données' });
  }
});

app.put('/api/state', checkPassword, async (req, res) => {
  const { data } = req.body || {};
  if (!data || typeof data !== 'object') {
    return res.status(400).json({ error: 'Données invalides' });
  }
  try {
    await pool.query(
      'INSERT INTO app_state (id, data, updated_at) VALUES ($1, $2, now()) ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = now()',
      [STATE_ID, data]
    );
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur lors de la sauvegarde des données' });
  }
});

app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

ensureSchemaAndSeed()
  .then(() => {
    app.listen(PORT, () => console.log(`Stocky en ligne sur le port ${PORT}`));
  })
  .catch((e) => {
    console.error('Impossible d\'initialiser la base de données:', e.message);
    process.exit(1);
  });
