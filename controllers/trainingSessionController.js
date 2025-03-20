const trainingSessionModel = require('../models/trainingSessionModel');
const trainingModel = require('../models/trainingModel');

// 📌 Créer une session
exports.createSession = async (req, res) => {
    try {
        const { training_id, notes, start_time, end_time, training_date } = req.body;
        const userId = req.user.id; // ID de l'utilisateur connecté
        const userRole = req.user.role; // Rôle de l'utilisateur (admin ou non)

        // 📌 Vérifier si le training appartient bien à l'utilisateur
        const training = await trainingModel.getTrainingById(training_id);
        if (!training) {
            return res.status(404).json({ error: "Training introuvable." });
        }

        if (training.user_id !== userId && userRole !== 'admin') {
            return res.status(403).json({ error: "Accès refusé. Vous ne pouvez pas ajouter une session à ce training." });
        }

        // 📌 Créer la session
        const newSession = await trainingSessionModel.createSession(training_id, notes, start_time, end_time, training_date);
        res.status(201).json(newSession);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur." });
    }
};

// 📌 Modifier une session
exports.updateSession = async (req, res) => {
    try {
        const sessionId = req.params.id;
        const userId = req.user.id; // Utilisateur connecté
        const userRole = req.user.role; 
        const updates = req.body; 

        const result = await trainingSessionModel.updateSession(sessionId, userId, userRole, updates);

        if (!result.success) {
            return res.status(result.error === "Accès refusé. Vous ne pouvez pas modifier cette session."
                ? 403 : 404).json({ error: result.error });
        }

        res.json({ message: "Session mise à jour avec succès." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur." });
    }
};



// 📌 Récupérer toutes les sessions d’un training
exports.getSessionsByTrainingId = async (req, res) => {
    try {
        const trainingId = req.params.training_id;
        const sessions = await trainingSessionModel.getSessionsByTrainingId(trainingId);
        res.json(sessions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur." });
    }
};

// 📌 Récupérer une session spécifique
exports.getSessionById = async (req, res) => {
    try {
        const sessionId = req.params.id;
        const userId = req.user.id;
        const userRole = req.user.role;

        const session = await trainingSessionModel.getSessionById(sessionId, userId, userRole);

        if (!session.success) {
            return res.status(session.status).json({ error: session.error });
        }

        res.json(session.data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur." });
    }
};

exports.getCurrentSession = async (req, res) => {
    try {
        const userId = req.user.id;
        const currentSession = await trainingSessionModel.getCurrentSession(userId);

        if (!currentSession) {
            return res.json([]); // Retourne un tableau vide si pas d'entraînement en cours
        }

        res.json(currentSession);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur serveur." });
    }
};

exports.getTodayCompletedSession = async (req, res) => {
    try {
        const userId = req.user.id;
        const completedSession = await trainingSessionModel.getTodayCompletedSession(userId);
        
        if (!completedSession) {
            return res.json([]);
        }
        
        res.json(completedSession);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur." });
    }
};
// 📌 Supprimer une session (soft delete)
exports.deleteSession = async (req, res) => {
    try {
        const sessionId = req.params.id;
        const userId = req.user.id;
        const userRole = req.user.role;

        const deleted = await trainingSessionModel.deleteSession(sessionId, userId, userRole);

        if (!deleted.success) {
            return res.status(deleted.status).json({ error: deleted.error });
        }

        res.json({ message: "Session supprimée avec succès (soft delete)." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur." });
    }
};

