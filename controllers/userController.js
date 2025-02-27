const userModel = require('../models/userModel');

// 📌 Récupérer le profil d'un utilisateur connecté
exports.getUserProfile = async (req, res) => {
    try {
        const userIdFromToken = req.user.id; // ID du token (utilisateur connecté)
        const userRole = req.user.role; // Rôle de l'utilisateur
        const requestedUserId = parseInt(req.params.id); // ID dans l'URL

        // Seul l'utilisateur lui-même ou un admin peut voir un profil
        if (userIdFromToken !== requestedUserId && userRole !== 'admin') {
            return res.status(403).json({ error: "Accès interdit." });
        }

        const user = await userModel.findById(requestedUserId);

        if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// 📌 Mettre à jour un utilisateur
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

// 📌 Supprimer un utilisateur
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

// 📌 Récupérer tous les utilisateurs
exports.getAllUsers = async (req, res) => {
    try {
        const users = await userModel.findAll();
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
};
