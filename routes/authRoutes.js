const express = require('express');
const { register, login, refreshToken, googleAuth, appleAuth } = require('../controllers/authController');

const router = express.Router();

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     summary: Connexion / Inscription avec Google
 *     responses:
 *       200:
 *         description: Connexion réussie
 */
router.post('/google', googleAuth);

/**
 * @swagger
 * /api/auth/apple:
 *   post:
 *     summary: Connexion / Inscription avec Apple
 *     responses:
 *       200:
 *         description: Connexion réussie
 */
router.post('/apple', appleAuth);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Inscription d'un utilisateur
 *     description: Crée un nouvel utilisateur et retourne un token JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               lastname:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               sex:
 *                 type: string
 *                 enum: [male, female]
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *       400:
 *         description: Email déjà utilisé ou données invalides
 */
router.post('/register', register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connexion d'un utilisateur
 *     description: Authentifie l'utilisateur et retourne un token JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Connexion réussie
 *       401:
 *         description: Email ou mot de passe incorrect
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Rafraîchir un access token
 *     responses:
 *       200:
 *         description: Nouveau access token généré
 */
router.post('/refresh', refreshToken);

module.exports = router;
