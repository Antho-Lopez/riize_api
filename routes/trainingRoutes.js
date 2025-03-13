const express = require('express');
const router = express.Router();
const trainingController = require('../controllers/trainingController');
const authMiddleware = require('../middleware/authMiddleware');
const canAccessResource = require('../middleware/canAccessResource');

// 📌 Créer un training
router.post('/create', authMiddleware, trainingController.createTraining);

router.get('/today', authMiddleware, trainingController.getTodayTraining);
// 📌 Mettre à jour un training
router.put('/edit/:id', authMiddleware, canAccessResource('trainings', 'user_id'), trainingController.updateTraining);

// 📌 Voir la liste des trainings d’un utilisateur
router.get('/', authMiddleware, trainingController.getUserTrainings);

// 📌 Voir un training en détail
router.get('/:id', authMiddleware, canAccessResource('trainings', 'user_id'), trainingController.getTrainingById);

// 📌 Supprimer un training
router.delete('/delete/:id', authMiddleware, canAccessResource('trainings', 'user_id'), trainingController.deleteTraining);

module.exports = router;
