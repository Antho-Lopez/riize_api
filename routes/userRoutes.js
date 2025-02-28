const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware'); 
const isAdminMiddleware = require('../middleware/isAdminMiddleware'); 
const canAccessResource = require('../middleware/canAccessResource');

// Récupérer le profil de l'utilisateur connecté
router.get('/:id', authMiddleware, canAccessResource('users', 'id'), userController.getUserProfile);

// Mettre à jour un utilisateur
router.put('/edit/:id', authMiddleware, canAccessResource('users', 'id'), userController.updateUser);

// Supprimer un utilisateur
router.delete('/delete/:id', authMiddleware, canAccessResource('users', 'id'), userController.deleteUser);

// Récupérer tous les utilisateurs (Admin seulement)
router.get('/', authMiddleware, isAdminMiddleware, userController.getAllUsers);

// Gestion de l'historique de poids de l'utilisateur
router.post('/update-weight/:id', authMiddleware, canAccessResource('users', 'id'), userController.updateWeight);

// Récupérer l'historique des poids d'un utilisateur
router.get('/weight-history/:id', authMiddleware, canAccessResource('users', 'id'), userController.getUserWeightHistory);


module.exports = router;
