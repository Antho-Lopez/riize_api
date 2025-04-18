const express = require('express');
const { register, login, refreshToken, googleAuth, checkGoogleAccount, appleAuth, requestResetPassword, resetPassword } = require('../controllers/authController');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../db');

const router = express.Router();
const renderResetForm = require('../utils/emails/resetPasswordFormTemplate');
const successPage = require('../utils/emails/successPage');
const errorPage  = require('../utils/emails/errorPage');

router.post('/google', googleAuth);
router.post('/google/check', checkGoogleAccount);
router.post('/apple', appleAuth);
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/request-reset', requestResetPassword);
router.post('/reset-password', resetPassword);

router.get('/reset-password-form', (req, res) => {
    const { token } = req.query;
    res.send(renderResetForm(token)); 
});

// Traitement du formulaire
router.post('/reset-password-form', async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).send("Données invalides.");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        const hashed = await bcrypt.hash(newPassword, 10);

        await db.promise().query(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashed, decoded.id]
        );

        res.send(successPage);
    } catch (err) {
        console.error(err);
        res.send(errorPage);
    }
});

module.exports = router;
