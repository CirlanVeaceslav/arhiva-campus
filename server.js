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

app.get('/', async (req, res) => {
  try {
    // Testăm conexiunea interogând baza de date
    const client = await pool.connect();
    res.send('Salut! Serverul pentru arhiva UAIC funcționează și este CONECTAT la baza de date Supabase!');
    client.release();
  } catch (err) {
    console.error(err);
    res.send('Serverul funcționează, dar există o eroare la conectarea cu baza de date. Verifică parola din Render.');
  }
});

app.listen(port, () => {
  console.log(`Serverul rulează pe portul ${port}`);
});