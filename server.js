const express = require('express');
const { Pool } = require('pg');

const app = express();

// Îi spunem serverului să folosească folderul public pentru fișiere statice (HTML)
app.use(express.static('public')); 

// ... restul codului rămâne neschimbat ...

// Render va aloca automat un port, altfel folosim 3000 pentru testare locală
const port = process.env.PORT || 3000; 

// Configurarea conexiunii la baza de date folosind variabila din Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Setare obligatorie pentru conexiunile externe în cloud
});

// Rută API pentru a obține locațiile din baza de date
app.get('/api/locatii', async (req, res) => {
  try {
    const client = await pool.connect();
    // Extragem toate locațiile, ordonate după scor (cele mai bune primele)
    const result = await client.query('SELECT * FROM locatii ORDER BY scor DESC');
    res.json(result.rows);
    client.release();
  } catch (err) {
    console.error(err);
    res.status(500).send('Eroare la preluarea locațiilor din baza de date.');
  }
});
// Rută API pentru a obține materialele din baza de date
app.get('/api/materiale', async (req, res) => {
  try {
    const client = await pool.connect();
    // Extragem toate materialele
    const result = await client.query('SELECT * FROM materiale ORDER BY anul ASC');
    res.json(result.rows);
    client.release();
  } catch (err) {
    console.error(err);
    res.status(500).send('Eroare la preluarea materialelor.');
  }
});

app.listen(port, () => {
  console.log(`Serverul rulează pe portul ${port}`);
});