const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const downloadReasonRoutes = require('./downloadReason');
const downloadFromRoutes = require('./downloadFrom');
const finalGoalRoutes = require('./finalGoal');
const activityFrequencyRoutes = require('./activityFrequency');
const userRoutes = require('./userRoutes');
const musclesRoutes = require('./muscles');
const trainingRoutes = require('./trainingRoutes');
const trainingSessionRoutes = require('./trainingSessionRoutes');

// Définition des routes
router.use('/auth', authRoutes);
router.use('/download-reason', downloadReasonRoutes);
router.use('/download-from', downloadFromRoutes);
router.use('/final-goal', finalGoalRoutes);
router.use('/activity-frequency', activityFrequencyRoutes);
router.use('/users', userRoutes);
router.use('/muscles', musclesRoutes);
router.use('/trainings', trainingRoutes);
router.use('/training-sessions', trainingSessionRoutes);

module.exports = router;
