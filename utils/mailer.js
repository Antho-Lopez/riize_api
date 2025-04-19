const nodemailer = require('nodemailer');
require('dotenv').config();

const generateTemplate = require('../utils/emails/resetPasswordEmailTemplate'); 

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

const sendResetPasswordEmail = async (to, token) => {
    const resetUrl = `${process.env.BASE_URL}/api/auth/reset-password-form?token=${token}`;
    const html = generateTemplate(resetUrl); // appel du template

    const mailOptions = {
        from: process.env.MAIL_FROM,
        to,
        subject: "Réinitialisation de mot de passe",
        html,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = { sendResetPasswordEmail };