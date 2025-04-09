const express = require('express');
const router = express.Router();
const errorController = require('../controllers/errorLogsController');

// Route pour créer un enregistrement d'erreur
router.post('/error', errorController.logError);

module.exports = router;