const express = require('express');
const app = express();
const port = 3000;

// Servir des fichiers statiques depuis un dossier 'public'
app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});