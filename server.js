const express = require('express');
const { Pool } = require('pg');

const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');

// 1. MAI ÎNTÂI INIȚIALIZĂM 'app'
const app = express();

// 2. SETĂM FOLDERUL PENTRU FIȘIERE HTML
app.use(express.static('public'));

// 3. CONFIGURĂM SUPABASE ȘI MULTER

// Conectarea la Supabase Storage
const supabaseUrl = 'https://pmrjoxyavyveakenzzvw.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtcmpveHlhdnl2ZWFrZW56enZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI4NDY4OTUsImV4cCI6MjEwODQyMjg5NX0.qacxygJK0iSbhVo449Wq_Kn9Ter8ilFDedzT8ikqGZA'; 
const supabase = createClient(supabaseUrl, supabaseKey);

// Configurare Multer pentru a citi fișierul din memorie
const upload = multer({ storage: multer.memoryStorage() });

// Ruta care primește fișierul și datele din formular
app.post('/api/incarca', upload.single('fisier_pdf'), async (req, res) => {
    // Extragem datele completate de tine pe site
    const { parola, titlu, ciclu, anul, semestru, materia, tip_material, an_universitar } = req.body;

    // Sistem simplu de securitate: doar cine știe parola poate încărca fișiere
    if (parola !== 'uaic2026') {
        return res.status(403).send('Parolă incorectă! Nu ai permisiunea de a încărca fișiere.');
    }

    try {
        const fisier = req.file;
        if (!fisier) return res.status(400).send('Nu ai atașat niciun fișier PDF!');

        // 1. Încărcăm PDF-ul în Supabase Storage (în folderul Uploads)
        const numeUnic = Date.now() + '_' + fisier.originalname.replace(/\s+/g, '_');
        const { data, error } = await supabase.storage
            .from('materiale-fii')
            .upload(`Uploads/${numeUnic}`, fisier.buffer, { contentType: 'application/pdf' });

        if (error) throw error;

        // Construim link-ul public către fișier
        const linkPublic = `${supabaseUrl}/storage/v1/object/public/materiale-fii/Uploads/${numeUnic}`;

        // 2. Salvăm toate detaliile și link-ul în baza de date SQL
        const client = await pool.connect();
        await client.query(
            `INSERT INTO materiale (titlu, ciclu, anul, semestru, materia, tip_material, an_universitar, link_fisier) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [titlu, ciclu, anul, semestru, materia, tip_material, an_universitar, linkPublic]
        );
        client.release();

        // Trimitem un mesaj de succes către site
        res.send('SUCCES');
    } catch (err) {
        console.error(err);
        res.status(500).send('Eroare la încărcarea fișierului pe server.');
    }
});

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