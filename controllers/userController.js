const userModel = require('../models/userModel');
const db = require('../db');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const sharp = require('sharp');

// Récupérer le profil d'un utilisateur connecté
exports.getUserProfile = async (req, res) => {
    try {
        const userIdFromToken = req.user.id; // ID du token (utilisateur connecté)
        const user = await userModel.findById(userIdFromToken);

        if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// Mettre à jour un utilisateur
exports.updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const updatedData = req.body;
        const updatedUser = await userModel.updateById(userId, updatedData);

        if (!updatedUser) return res.status(404).json({ error: "Utilisateur non trouvé" });

        res.json({ message: "Utilisateur mis à jour avec succès" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// Supprimer un utilisateur
exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const deleted = await userModel.deleteById(userId);

        if (!deleted) return res.status(404).json({ error: "Utilisateur non trouvé" });

        res.json({ message: "Utilisateur supprimé avec succès" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

exports.updateWeight = async (req, res) => {
    try {
        const userId = req.params.id; 
        const { newWeight } = req.body;

        if (!newWeight) {
            return res.status(400).json({ error: "Le poids est requis." });
        }

        // Vérifie si une entrée existe pour aujourd'hui
        const existingEntryId = await userModel.getTodayWeightEntry(userId);

        if (existingEntryId) {
            await userModel.updateWeightEntry(existingEntryId, newWeight, userId);
        } else {
            await userModel.addWeightEntry(userId, newWeight);
        }

        res.json({ success: true, message: "Poids mis à jour avec succès." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur." });
    }
};

// Récupérer l'historique des poids d'un utilisateur
exports.getUserWeightHistory = async (req, res) => {
    try {
        const userId = req.params.id;

        // Vérifier si l'utilisateur existe
        const userExists = await userModel.findById(userId);
        if (!userExists) {
            return res.status(404).json({ error: "Utilisateur non trouvé." });
        }

        // Récupérer l'historique des poids
        const weightHistory = await userModel.getUserWeightHistory(userId);
        res.json(weightHistory);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur." });
    }
};

// Récupérer seulement la streak de l'utilisateur
exports.getUserStreak = (req, res) => {
    const { id } = req.params;

    db.query("SELECT streak FROM users WHERE id = ?", [id], (err, results) => {
        if (err) {
            console.error("Erreur SQL :", err);
            return res.status(500).json({ error: "Erreur serveur" });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        const currentStreak = results[0].streak;

        db.query(`
            SELECT date 
            FROM user_streak_logs 
            WHERE user_id = ? 
            ORDER BY date DESC 
            LIMIT 7
        `, [id], (logErr, logs) => {
            if (logErr) {
                console.error("Erreur SQL (logs) :", logErr);
                return res.status(500).json({ error: "Erreur lors de la récupération de l'historique de streak" });
            }

            const timeZone = 'Europe/Paris';
            const dates = logs.map(log => 
                new Date(log.date).toLocaleDateString('en-CA', { timeZone })
            );

            res.json({
                streak: currentStreak,
                history: dates
            });
        });
    });
};


exports.addUserStreak = async (req, res) => {
    try {
        const userId = req.user.id;

        await userModel.addUserStreak(userId);

        res.status(200).json({ message: "Streak mis à jour avec succès." });
    } catch (err) {
        console.error("Erreur lors de la mise à jour du streak :", err);
        res.status(500).json({ error: "Erreur serveur lors de la mise à jour du streak." });
    }
};

exports.uploadProfilePicture = async (req, res) => {
    try {
        const userId = req.params.id;
        const uploadedFile = req.file && req.file[0];

        if (!uploadedFile || !uploadedFile.filepath) {
            return res.status(400).json({ error: 'Fichier non valide' });
        }

        // Réduire l'image avec sharp
        const resizedPath = uploadedFile.filepath.replace(/(\.\w+)$/, '-resized$1');
        await sharp(uploadedFile.filepath)
            .resize({ width: 800 }) // adapte la largeur max (800px ici)
            .jpeg({ quality: 70 }) // compression JPEG à 70%
            .toFile(resizedPath);

        // Envoi vers Hostinger
        const formData = new FormData();
        formData.append('file', fs.createReadStream(resizedPath));

        const uploadResponse = await axios.post(
            'https://app.riize.eu/upload.php',
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                    'X-Upload-Key': process.env.SECRET_UPLOAD_KEY
                }
            }
        );

        const imageUrl = uploadResponse.data.url;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé." });
        }
        // Mettre à jour l'utilisateur avec le nouveau lien
        user.profilePicture = imageUrl;
        const data = { profile_picture: imageUrl };
        const updateResult = await userModel.updateById(userId, data);

        if (!updateResult) {
            return res.status(500).json({ error: "Erreur lors de la mise à jour du profil." });
        }

        res.status(200).json({ message: 'Photo de profil mise à jour avec succès.', imageUrl });
    } catch (error) {
        console.error("Erreur lors de l'upload :", error.message);
        res.status(500).json({ error: "Erreur interne du serveur." });
    }
};
