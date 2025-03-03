const express = require('express');
const router = express.Router();
const db = require('../db'); // Importer la connexion MySQL

router.get('/', (req, res) => {
    db.query('SELECT * FROM final_goals', (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des données:', err);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.json(results);
    });
});

module.exports = router;
