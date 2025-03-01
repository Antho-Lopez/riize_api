const trainingModel = require('../models/trainingModel');

// 📌 Créer un training
exports.createTraining = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, recurrence_type, recurrence_value, start_date, training_img } = req.body;

        const newTraining = await trainingModel.createTraining(userId, name, recurrence_type, recurrence_value, start_date, training_img);
        res.status(201).json(newTraining);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur." });
    }
};

// 📌 Mettre à jour un training
exports.updateTraining = async (req, res) => {
    try {
        const trainingId = req.params.id;
        const { name, recurrence_type, recurrence_value, start_date, training_img } = req.body;

        const updated = await trainingModel.updateTraining(trainingId, name, recurrence_type, recurrence_value, start_date, training_img);
        if (!updated) {
            return res.status(404).json({ error: "Training non trouvé." });
        }

        res.json({ message: "Training mis à jour avec succès." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur." });
    }
};

// 📌 Voir la liste des trainings d’un utilisateur
exports.getUserTrainings = async (req, res) => {
    try {
        const userId = req.user.id;
        const trainings = await trainingModel.getUserTrainings(userId);
        res.json(trainings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur." });
    }
};

// 📌 Voir un training en détail
exports.getTrainingById = async (req, res) => {
    try {
        const trainingId = req.params.id;
        const training = await trainingModel.getTrainingById(trainingId);
        if (!training) {
            return res.status(404).json({ error: "Training non trouvé." });
        }

        res.json(training);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur." });
    }
};

// 📌 Supprimer un training
exports.deleteTraining = async (req, res) => {
    try {
        const trainingId = req.params.id;
        const deleted = await trainingModel.deleteTraining(trainingId);
        if (!deleted) {
            return res.status(404).json({ error: "Training non trouvé ou déjà supprimé." });
        }

        res.json({ message: "Training supprimé avec succès (soft delete)." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur." });
    }
};
