const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const canAccessResource = require('../middleware/canAccessResource');
const trainingSessionController = require('../controllers/trainingSessionController');

// 📌 Récupérer toutes les sessions d'un training (propriétaire ou admin)
router.get('/by-training/:training_id', authMiddleware, canAccessResource('trainings', 'user_id', 'training_id'), trainingSessionController.getSessionsByTrainingId);

// 📌 Récupérer l'entraînement en cours de l'utilisateur
router.get('/current', authMiddleware, trainingSessionController.getCurrentSession);

// 📌 Récupérer la session d'entraînement du jour (terminée) pour l'utilisateur
router.get('/today/completed', authMiddleware, trainingSessionController.getTodayCompletedSession);

// 📌 Créer une session (doit appartenir à l'utilisateur ou être admin)
router.post('/create', authMiddleware, trainingSessionController.createSession);

// 📌 Modifier une session (seulement le propriétaire ou un admin)
router.put('/edit/:id', authMiddleware, trainingSessionController.updateSession);

// 📌 Récupérer une session spécifique (propriétaire ou admin)
router.get('/:id', authMiddleware, trainingSessionController.getSessionById);

// 📌 Supprimer une session (soft delete, propriétaire ou admin)
router.delete('/delete/:id', authMiddleware, trainingSessionController.deleteSession);


module.exports = router;
