const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../db');
const userModel = require('../models/userModel');
const { sendResetPasswordEmail } = require('../utils/mailer');
require('dotenv').config();

const client = new OAuth2Client(process.env.WEB_GOOGLE_CLIENT_ID);

// Générer un token d'accès (expire vite)
const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: process.env.JWT_ACCESS_EXPIRES }
    );
};

// Générer un Refresh Token (expire après 30 jours)
const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES }
    );
};

// Authentification avec Google
exports.googleAuth = async (req, res) => {
    const { token } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.WEB_GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const {
            email: googleEmail,
            given_name,
            family_name,
            sub,
            email_verified
        } = payload;

        if (!email_verified) {
            return res.status(401).json({ error: 'Email non vérifié par Google' });
        }

        // Récupère les données supplémentaires du formulaire frontend
        const {
            name,
            lastname,
            email,
            provider_id,
            final_goal_id,
            download_reason_id,
            download_from_id,
            sex,
            birth_date,
            activity_frequency_id,
            height,
            weight,
            weight_unit,
            goal_weight,
            height_unit
        } = req.body;

        db.query(
            'SELECT * FROM users WHERE provider = "google" AND provider_id = ?',
            [sub],
            (err, results) => {
                if (err) {
                    console.error("Erreur SQL dans SELECT Google:", err);
                    return res.status(500).json({ error: 'Erreur serveur' });
                }

                if (results.length > 0) {
                    // Utilisateur existant → JWT
                    const user = results[0];
                    const accessToken = generateAccessToken(user);
                    const refreshToken = generateRefreshToken(user);
                    return res.json({ accessToken, refreshToken });
                } else {
                    // Nouvel utilisateur → Inscription
                    db.query(
                        `INSERT INTO users 
                            (name, lastname, email, provider, provider_id, final_goal_id, download_reason_id, download_from_id, sex, birth_date, activity_frequency_id, height, weight, weight_unit, goal_weight, height_unit, role)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            name || given_name || 'Utilisateur',
                            lastname || family_name || '',
                            email || googleEmail,
                            'google',
                            provider_id || sub,
                            final_goal_id || null,
                            download_reason_id || null,
                            download_from_id || null,
                            sex || null,
                            birth_date || null,
                            activity_frequency_id || null,
                            height || null,
                            weight || null,
                            weight_unit || 'kg',
                            goal_weight || null,
                            height_unit || 'cm',
                            'user'
                        ],
                        (err, result) => {
                            if (err) {
                                console.error("Erreur SQL dans INSERT Google:", err);
                                return res.status(500).json({ error: 'Erreur serveur' });
                            }

                            const user = { id: result.insertId, email: email || googleEmail, role: 'user' };
                            const accessToken = generateAccessToken(user);
                            const refreshToken = generateRefreshToken(user);

                            return res.status(201).json({ accessToken, refreshToken });
                        }
                    );
                }
            }
        );
    } catch (err) {
        console.error("Erreur Google verifyIdToken:", err);
        return res.status(401).json({ error: 'Token Google invalide' });
    }
};

exports.checkGoogleAccount = async (req, res) => {
    const { idToken } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.WEB_GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const provider_id = payload.sub;

        db.query(
            'SELECT * FROM users WHERE provider = "google" AND provider_id = ?',
            [provider_id],
            (err, results) => {
                if (err) {
                    console.error("Erreur SQL dans checkGoogleAccount :", err);
                    return res.status(500).json({ error: 'Erreur serveur' });
                }

                if (results.length > 0) {
                    return res.json({ accountExists: true });
                } else {
                    return res.json({ accountExists: false });
                }
            }
        );
    } catch (err) {
        console.error("Erreur lors de la vérification du token Google :", err);
        return res.status(400).json({ error: 'Token invalide ou utilisateur introuvable' });
    }
};

// 🍏 Authentification avec Apple
exports.appleAuth = async (req, res) => {
    const { token } = req.body;

    try {
        // Vérifie et décode le token Apple
        const decoded = jwt.decode(token, { complete: true });
        if (!decoded) return res.status(401).json({ error: 'Token Apple invalide' });

        const { email, sub } = decoded.payload;

        // Données supplémentaires du formulaire (si fournies)
        const {
            name,
            lastname,
            email: emailFromForm,
            provider_id,
            final_goal_id,
            download_reason_id,
            download_from_id,
            sex,
            birth_date,
            activity_frequency_id,
            height,
            weight,
            weight_unit,
            goal_weight,
            height_unit
        } = req.body;
        
        // Vérifie si l'utilisateur Apple existe déjà
        db.query(
            'SELECT * FROM users WHERE provider = "apple" AND provider_id = ?',
            [sub],
            (err, results) => {
                if (err) {
                    console.error("Erreur SQL dans SELECT Apple:", err);
                    return res.status(500).json({ error: 'Erreur serveur' });
                }

                if (results.length > 0) {
                    // Utilisateur existant → Connexion
                    const user = results[0];
                    const accessToken = generateAccessToken(user);
                    const refreshToken = generateRefreshToken(user);
                    return res.json({ accessToken, refreshToken });
                } else {
                    // Nouvel utilisateur → Inscription
                    db.query(
                        `INSERT INTO users 
                            (name, lastname, email, provider, provider_id, final_goal_id, download_reason_id, download_from_id, sex, birth_date, activity_frequency_id, height, weight, weight_unit, goal_weight, height_unit, role)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            name || 'Utilisateur',
                            lastname || '',
                            emailFromForm || email,
                            'apple',
                            provider_id || sub,
                            final_goal_id || null,
                            download_reason_id || null,
                            download_from_id || null,
                            sex || 'male',
                            birth_date || null,
                            activity_frequency_id || null,
                            height || null,
                            weight || null,
                            weight_unit || 'kg',
                            goal_weight || null,
                            height_unit || 'cm',
                            'user'
                        ],
                        (err, result) => {
                            if (err) {
                                console.error("Erreur SQL dans INSERT Apple:", err);
                                return res.status(500).json({ error: 'Erreur serveur' });
                            }

                            const user = { id: result.insertId, email: emailFromForm || email, role: 'user' };
                            const accessToken = generateAccessToken(user);
                            const refreshToken = generateRefreshToken(user);

                            return res.status(201).json({ accessToken, refreshToken });
                        }
                    );
                }
            }
        );
    } catch (err) {
        console.error("Erreur AppleAuth:", err);
        return res.status(401).json({ error: 'Token Apple invalide' });
    }
};

// Inscription
exports.register = async (req, res) => {
    try {
        // Fusionner les valeurs reçues avec les valeurs par défaut
        const userData = {...req.body };

        // Vérification des champs obligatoires
        if (!userData.email || (!userData.password && userData.provider === 'local')) {
            return res.status(400).json({ error: 'Email et mot de passe requis' });
        }

        // Vérifier si l'utilisateur existe déjà
        const [existingUser] = await db.promise().query('SELECT * FROM users WHERE email = ?', [userData.email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'Cet email est déjà utilisé' });
        }

        // Hasher le mot de passe seulement si l'inscription est "local"
        if (userData.provider === 'local') {
            userData.password = await bcrypt.hash(userData.password, 10);
        } else {
            userData.password = null; // Pour Google/Apple, pas besoin de mot de passe
        }

        // Génération des clés et valeurs dynamiquement
        const columns = Object.keys(userData).join(', ');
        const placeholders = Object.keys(userData).map(() => '?').join(', ');
        const values = Object.values(userData);

        // Insertion dans la BDD
        const [result] = await db.promise().query(
            `INSERT INTO users (${columns}) VALUES (${placeholders})`,
            values
        );
        
        await userModel.addInitialWeight(result.insertId, userData.weight);

        // Génération des tokens
        const user = { id: result.insertId, email: userData.email, role: userData.role };
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        res.status(201).json({ accessToken, refreshToken });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// Connexion
exports.login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email et mot de passe requis" });
    }

    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
        if (err) {
            console.error("Erreur SQL :", err);
            return res.status(500).json({ error: "Erreur serveur" });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "Email introuvable" });
        }

        const user = results[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Mot de passe incorrect" });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        res.json({ accessToken, refreshToken });
    });
};


// Rafraîchir un token
exports.refreshToken = (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh Token requis' });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const newAccessToken = generateAccessToken({ id: decoded.id, email: decoded.email, role: decoded.role });

        res.json({ accessToken: newAccessToken });
    } catch (err) {
        return res.status(403).json({ error: 'Refresh Token invalide ou expiré' });
    }
};

// Étape 1 - Demande de reset de mot de passe
exports.requestResetPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) return res.status(400).json({ error: "Email requis" });

    try {
        const [userResult] = await db.promise().query("SELECT * FROM users WHERE email = ?", [email]);
        if (userResult.length === 0) {
            return res.status(404).json({ error: "Email introuvable" });
        }

        const user = userResult[0];

        // Génère un token JWT valable 30 minutes
        const resetToken = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: "30m" }
        );

        // envoyer un email avec le token, mais pour l’instant on le retourne dans la réponse
        await sendResetPasswordEmail(user.email, resetToken);
        res.json({ message: "Email de réinitialisation envoyé." });

    } catch (err) {
        console.error("Erreur lors de la demande de reset :", err);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// Étape 2 - Réinitialisation du mot de passe
exports.resetPassword = async (req, res) => {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
        return res.status(400).json({ error: "Token et nouveau mot de passe requis" });
    }

    try {
        const decoded = jwt.verify(resetToken, process.env.JWT_ACCESS_SECRET);
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.promise().query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, decoded.id]);

        res.json({ message: "Mot de passe mis à jour avec succès" });
    } catch (err) {
        console.error("Erreur reset password :", err);
        res.status(403).json({ error: "Token invalide ou expiré" });
    }
};
