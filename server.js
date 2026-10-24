const express = require('express');
const app = express();
const port = 3000;

// Aceasta este o rută de test. 
// Când cineva intră pe site-ul tău, va primi acest mesaj.
app.get('/', (req, res) => {
  res.send('Salut! Serverul pentru arhiva UAIC funcționează perfect.');
});

// Pornim serverul și îl punem să asculte pe portul 3000
app.listen(port, () => {
  console.log(`Serverul rulează la adresa http://localhost:${port}`);
});