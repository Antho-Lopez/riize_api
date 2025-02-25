const express = require('express');
const router = express.Router();
const db = require('../db'); // Importer la connexion MySQL

/**
 * @swagger
 * /api/final-goal:
 *   get:
 *     summary: Récupère les raisons personnels
 *     description: Retourne la liste des raisons stockées en base de données.
 *     responses:
 *       200:
 *         description: Liste des raisons personnels
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
 *                     example: "Pour être en meilleure santé"
 *       500:
 *         description: Erreur serveur
 */
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
