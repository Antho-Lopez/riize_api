const express = require('express');
const router = express.Router();
const db = require('../db'); // Importer la connexion MySQL

/**
 * @swagger
 * /api/download-reason:
 *   get:
 *     summary: Récupère toutes les raisons de téléchargement
 *     description: Retourne la liste des raisons stockées en base de données.
 *     responses:
 *       200:
 *         description: Liste des raisons de téléchargement
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   reason:
 *                     type: string
 *                     example: "Perte de poids"
 *       500:
 *         description: Erreur serveur
 */

router.get('/', (req, res) => {
    db.query('SELECT * FROM download_reasons', (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des données:', err);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.json(results);
    });
});

module.exports = router;
