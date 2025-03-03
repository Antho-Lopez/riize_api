const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const exerciseController = require('../controllers/exerciseController');

// 📌 Voir la liste des exercices d'un entraînement (propriétaire ou admin)
router.get('/by-training/:training_id', authMiddleware, exerciseController.getExercisesByTrainingId);

// 📌 Voir les détails d'un exercice (propriétaire ou admin)
router.get('/:id', authMiddleware, exerciseController.getExerciseById);

// 📌 Créer un exercice (propriétaire de l'entraînement ou admin)
router.post('/create', authMiddleware, exerciseController.createExercise);

// 📌 Modifier un exercice (propriétaire ou admin)
router.put('/edit/:id', authMiddleware, exerciseController.updateExercise);

// 📌 Supprimer un exercice (soft delete, propriétaire ou admin)
router.delete('/delete/:id', authMiddleware, exerciseController.deleteExercise);

module.exports = router;
