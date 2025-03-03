const express = require('express');
const { register, login, refreshToken, googleAuth, appleAuth } = require('../controllers/authController');

const router = express.Router();

router.post('/google', googleAuth);
router.post('/apple', appleAuth);
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);

module.exports = router;
