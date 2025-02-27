const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../db');
require('dotenv').config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

// 🟢 Authentification avec Google
// peut être qu'il faudra AJOUTER LE ROLE POUR L'AUTH GOOGLE ET APPLE
exports.googleAuth = async (req, res) => {
    const { token } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const { email, name, sub } = ticket.getPayload(); // `sub` est l'ID unique Google

        db.query('SELECT * FROM users WHERE provider = "google" AND provider_id = ?', [sub], (err, results) => {
            if (err) return res.status(500).json({ error: 'Erreur serveur' });

            if (results.length > 0) {
                // Utilisateur existant -> Générer un JWT
                const user = results[0];
                const accessToken = generateAccessToken(user);
                const refreshToken = generateRefreshToken(user);
                return res.json({ accessToken, refreshToken });
            } else {
                // Nouvel utilisateur -> On l'inscrit
                db.query(
                    'INSERT INTO users (name, email, provider, provider_id) VALUES (?, ?, "google", ?)',
                    [name, email, sub],
                    (err, result) => {
                        if (err) return res.status(500).json({ error: 'Erreur serveur' });

                        const user = { id: result.insertId, email };
                        const accessToken = generateAccessToken(user);
                        const refreshToken = generateRefreshToken(user);

                        res.status(201).json({ accessToken, refreshToken });
                    }
                );
            }
        });
    } catch (err) {
        return res.status(401).json({ error: 'Token Google invalide' });
    }
};

// 🍏 Authentification avec Apple
exports.appleAuth = async (req, res) => {
    const { token } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.APPLE_PUBLIC_KEY, { algorithms: ['RS256'] });

        const email = decoded.email;
        const sub = decoded.sub; // ID unique Apple

        db.query('SELECT * FROM users WHERE provider = "apple" AND provider_id = ?', [sub], (err, results) => {
            if (err) return res.status(500).json({ error: 'Erreur serveur' });

            if (results.length > 0) {
                const user = results[0];
                const accessToken = generateAccessToken(user);
                const refreshToken = generateRefreshToken(user);
                return res.json({ accessToken, refreshToken });
            } else {
                db.query(
                    'INSERT INTO users (email, provider, provider_id) VALUES (?, "apple", ?)',
                    [email, sub],
                    (err, result) => {
                        if (err) return res.status(500).json({ error: 'Erreur serveur' });

                        const user = { id: result.insertId, email };
                        const accessToken = generateAccessToken(user);
                        const refreshToken = generateRefreshToken(user);

                        res.status(201).json({ accessToken, refreshToken });
                    }
                );
            }
        });
    } catch (err) {
        return res.status(401).json({ error: 'Token Apple invalide' });
    }
};

// 🔐 Inscription
exports.register = async (req, res) => {
    try {
        // 🔄 Fusionner les valeurs reçues avec les valeurs par défaut
        const userData = {...req.body };

        // 🛑 Vérification des champs obligatoires
        if (!userData.email || (!userData.password && userData.provider === 'local')) {
            return res.status(400).json({ error: 'Email et mot de passe requis' });
        }

        // 🔍 Vérifier si l'utilisateur existe déjà
        const [existingUser] = await db.promise().query('SELECT * FROM users WHERE email = ?', [userData.email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'Cet email est déjà utilisé' });
        }

        // 🔐 Hasher le mot de passe seulement si l'inscription est "local"
        if (userData.provider === 'local') {
            userData.password = await bcrypt.hash(userData.password, 10);
        } else {
            userData.password = null; // Pour Google/Apple, pas besoin de mot de passe
        }

        // 📝 Génération des clés et valeurs dynamiquement
        const columns = Object.keys(userData).join(', ');
        const placeholders = Object.keys(userData).map(() => '?').join(', ');
        const values = Object.values(userData);

        // 💾 Insertion dans la BDD
        const [result] = await db.promise().query(
            `INSERT INTO users (${columns}) VALUES (${placeholders})`,
            values
        );

        // 🔑 Génération des tokens
        const user = { id: result.insertId, email: userData.email, role: userData.role };
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        res.status(201).json({ accessToken, refreshToken });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// 🔑 Connexion
exports.login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (results.length === 0) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }

        const user = results[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        res.json({ accessToken, refreshToken });
    });
};

// 🔄 Rafraîchir un token
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
