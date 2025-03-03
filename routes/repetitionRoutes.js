const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const repetitionController = require('../controllers/repetitionController');

// 📌 Créer une repetition (propriétaire ou admin)
router.post('/create', authMiddleware, repetitionController.createRepetition);

// 📌 Modifier une repetition (propriétaire ou admin)
router.put('/edit/:id', authMiddleware, repetitionController.updateRepetition);

// 📌 Supprimer une repetition
router.delete('/delete/:id', authMiddleware, repetitionController.deleteRepetition);

// 📌 Voir la liste des repetition d'une session (propriétaire ou admin)
router.get('/by-session/:session_id', authMiddleware, repetitionController.getRepetitionsBySessionId);

// 📌 Voir la liste des repetition d'un exercice (propriétaire ou admin)
router.get('/by-exercise/:exercise_id', authMiddleware, repetitionController.getRepetitionsByExerciseId);

module.exports = router;
