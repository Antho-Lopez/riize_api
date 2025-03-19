const exerciseModel = require('../models/exerciseModel');

// 📌 Voir la liste des exercices d'un entraînement
exports.getExercisesByTrainingId = async (req, res) => {
    try {
        const trainingId = req.params.training_id;
        const userId = req.user.id;
        const userRole = req.user.role;

        const result = await exerciseModel.getExercisesByTrainingId(trainingId, userId, userRole);

        if (result.error) {
        return res.status(result.error === "Accès refusé." ? 403 : 404).json({ error: result.error });
        }
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur." });
    }
};


// 📌 Voir les détails d'un exercice
exports.getExerciseById = async (req, res) => {
    try {
        const exerciseId = req.params.id;
        const userId = req.user.id;
        const userRole = req.user.role;

        const exercise = await exerciseModel.getExerciseById(exerciseId, userId, userRole);
        if (!exercise) {
            return res.status(404).json({ error: "Exercice introuvable ou accès refusé." });
        }
        res.json(exercise);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur." });
    }
};

// 📌 Créer un exercice
exports.createExercise = async (req, res) => {
    try {
        const { muscle_id, training_id, name, default_weight } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;

        const newExercise = await exerciseModel.createExercise({ muscle_id, training_id, name, default_weight }, userId, userRole);
        if (!newExercise) {
            return res.status(403).json({ error: "Accès refusé. Vous ne pouvez pas ajouter un exercice à cet entraînement." });
        }
        res.status(201).json({ message: "Exercice créé avec succès.", id: newExercise });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur." });
    }
};

// 📌 Modifier un exercice
exports.updateExercise = async (req, res) => {
    try {
        const exerciseId = req.params.id;
        const updates = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;

        const updated = await exerciseModel.updateExercise(exerciseId, updates, userId, userRole);
        if (!updated) {
            return res.status(404).json({ error: "Exercice introuvable ou accès refusé." });
        }
        res.json({ message: "Exercice mis à jour avec succès." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur." });
    }
};

// 📌 Supprimer un exercice (soft delete)
exports.deleteExercise = async (req, res) => {
    try {
        const exerciseId = req.params.id;
        const userId = req.user.id;
        const userRole = req.user.role;

        const deleted = await exerciseModel.deleteExercise(exerciseId, userId, userRole);
        if (!deleted) {
            return res.status(404).json({ error: "Exercice introuvable ou accès refusé." });
        }
        res.json({ message: "Exercice supprimé avec succès (soft delete)." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur." });
    }
};
