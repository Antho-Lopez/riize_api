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
const exerciseRoutes = require('./exerciseRoutes');
const repetitionRoutes = require('./repetitionRoutes');
const faq = require('./faq');
const errorLogs = require('./errorLogs');
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
router.use('/exercises', exerciseRoutes);
router.use('/repetitions', repetitionRoutes);
router.use('/faq', faq);
router.use('/logs', errorLogs);

module.exports = router;
