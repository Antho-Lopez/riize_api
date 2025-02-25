const express = require('express');
const router = express.Router();
const db = require('../db'); // Importer la connexion MySQL

/**
 * @swagger
 * /api/download-from:
 *   get:
 *     summary: Récupère la liste des réseaux 
 *     description: Retourne la liste des réseaux stockées en base de données.
 *     responses:
 *       200:
 *         description: Liste des réseaux sociaux
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
 *                     example: "Youtube"
 *       500:
 *         description: Erreur serveur
 */
router.get('/', (req, res) => {
    db.query('SELECT * FROM download_froms', (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des données:', err);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.json(results);
    });
});

module.exports = router;
