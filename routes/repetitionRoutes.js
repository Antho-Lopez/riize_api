const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const repetitionController = require('../controllers/repetitionController');

// 📌 Créer une training_session_exercise (propriétaire ou admin)
router.post('/create', authMiddleware, repetitionController.createRepetition);

// 📌 Modifier une training_session_exercise (propriétaire ou admin)
router.put('/edit/:id', authMiddleware, repetitionController.updateRepetition);

// 📌 Supprimer une training_session_exercise (soft delete, propriétaire ou admin)
router.delete('/delete/:id', authMiddleware, repetitionController.deleteRepetition);

// 📌 Voir la liste des training_session_exercise d'une session (propriétaire ou admin)
router.get('/by-session/:session_id', authMiddleware, repetitionController.getRepetitionsBySessionId);

// 📌 Voir la liste des training_session_exercise d'un exercice (propriétaire ou admin)
router.get('/by-exercise/:exercise_id', authMiddleware, repetitionController.getRepetitionsByExerciseId);

module.exports = router;
