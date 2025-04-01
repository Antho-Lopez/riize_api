const userModel = require('../models/userModel');
const db = require('../db');
const fs = require('fs');
const path = require('path');

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

// Récupérer tous les utilisateurs
exports.getAllUsers = async (req, res) => {
    try {
        const users = await userModel.findAll();
        res.json(users);
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

        res.json({ streak: results[0].streak });
    });
};

// Dans ton contrôleur
exports.uploadProfilePicture = async (req, res) => {
    try {

        const userId = req.params.id;

        // Vérifie si req.file est un tableau et accède au premier fichier
        const uploadedFile = req.file && req.file[0];

        if (!uploadedFile || !uploadedFile.filepath) {
            return res.status(400).json({ error: 'Fichier non valide' });
        }

        // Chemin de l'image dans le dossier 'uploads'
        const imagePath = `/uploads/${path.basename(uploadedFile.filepath)}`;

        // 🔄 Mise à jour du profil utilisateur
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé." });
        }

        // Suppression de l'ancienne image si elle existe
        if (user.profilePicture) {
            const oldImagePath = path.join(__dirname, '..', user.profilePicture);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }

        // Mise à jour de l'utilisateur avec le nouveau chemin d'image
        user.profilePicture = imagePath;
        
        // Mettre à jour l'utilisateur dans la base de données
        const data = { profile_picture: imagePath };
        const updateResult = await userModel.updateById(userId, data);

        if (!updateResult) {
            return res.status(500).json({ error: "Erreur lors de la mise à jour du profil." });
        }

        res.status(200).json({ message: 'Photo de profil mise à jour avec succès.' });
    } catch (error) {
        console.error("Erreur lors de l'upload :", error);
        res.status(500).json({ error: "Erreur interne du serveur." });
    }
};
