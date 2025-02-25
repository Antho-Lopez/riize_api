const express = require('express');
const router = express.Router();
const db = require('../db'); // Importer la connexion MySQL

/**
 * @swagger
 * /api/activity-frequency:
 *   get:
 *     summary: Récupère la liste des différentes fréquences d'activité 
 *     description: Retourne la liste des différentes fréquences d'activité en base de données.
 *     responses:
 *       200:
 *         description: Liste des différentes fréquences d'activité 
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
 *                     example: "Peu actif"
 *       500:
 *         description: Erreur serveur
 */
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
