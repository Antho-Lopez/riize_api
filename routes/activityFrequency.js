const express = require('express');
const router = express.Router();
const db = require('../db'); // Importer la connexion MySQL

// Route GET pour récupérer toutes les raisons de téléchargement
router.get('/', (req, res) => {
    db.query('SELECT * FROM activity_frequencies', (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des données:', err);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.json(results);
    });
});

module.exports = router;
