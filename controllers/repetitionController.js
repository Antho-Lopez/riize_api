const repetitionModel = require('../models/repetitionModel');
const db = require('../db');
// 📌 Créer une training_session_exercise
exports.createRepetition = async (req, res) => {
    try {
        const { session_id, exercise_id, reps, weight } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Vérifier l'accès à la session
        const accessCheckSession = await repetitionModel.checkAccessToSession(session_id, userId, userRole);
        if (accessCheckSession.error) {
            return res.status(accessCheckSession.error === "Accès refusé." ? 403 : 404).json({ error: accessCheckSession.error });
        }

        // Vérifier l'accès à la répétition
        const accessCheckExercise = await repetitionModel.checkAccessToExercise(exercise_id, userId, userRole);
        if (accessCheckExercise.error) {
            return res.status(accessCheckExercise.error === "Accès refusé à cette répétition." ? 403 : 404).json({ error: accessCheckExercise.error });
        }

        // Créer la répétition dans la session
        const newId = await repetitionModel.createRepetition(session_id, exercise_id, reps, weight);
        res.status(201).json({ message: "Répétition ajoutée à la session avec succès.", id: newId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur." });
    }
};

// 📌 Modifier une training_session_exercise
exports.updateRepetition = async (req, res) => {
    try {
        const sessionExerciseId = req.params.id;
        const { reps, weight, exercise_id } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Vérifier si l'enregistrement existe et récupérer `exercise_id`
        const [sessionExercise] = await db.promise().query(
            `SELECT exercise_id FROM training_session_exercise WHERE id = ?`,
            [sessionExerciseId]
        );

        if (sessionExercise.length === 0) {
            return res.status(404).json({ error: "Enregistrement introuvable." });
        }

        const exerciseIdToCheck = exercise_id || sessionExercise[0].exercise_id;

        // Vérifier l'accès à la répétition
        const accessCheckExercise = await repetitionModel.checkAccessToExercise(exerciseIdToCheck, userId, userRole);
        if (accessCheckExercise.error) {
            return res.status(accessCheckExercise.error === "Accès refusé à cette répétition." ? 403 : 404).json({ error: accessCheckExercise.error });
        }

        // Mise à jour de la répétition dans la session
        const updates = { reps, weight };
        const updated = await repetitionModel.updateRepetition(sessionExerciseId, updates);
        if (!updated) {
            return res.status(404).json({ error: "Aucune modification effectuée." });
        }

        res.json({ message: "Répétiton mise à jour avec succès." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur." });
    }
};

// 📌 Supprimer une training_session_exercise (soft delete)
// exports.deleteRepetition = async (req, res) => {
//     try {
//         const sessionExerciseId = req.params.id;
//         const userId = req.user.id;
//         const userRole = req.user.role;

//         // Vérifier si l'enregistrement existe et récupérer `exercise_id`
//         const [sessionExercise] = await db.promise().query(
//             `SELECT exercise_id FROM training_session_exercise WHERE id = ?`,
//             [sessionExerciseId]
//         );

//         if (sessionExercise.length === 0) {
//             return res.status(404).json({ error: "Enregistrement introuvable." });
//         }

//         const exerciseIdToCheck = sessionExercise[0].exercise_id;

//         // Vérifier l'accès à la répétition
//         const accessCheckExercise = await repetitionModel.checkAccessToExercise(exerciseIdToCheck, userId, userRole);
//         if (accessCheckExercise.error) {
//             return res.status(accessCheckExercise.error === "Accès refusé à cette répétition." ? 403 : 404).json({ error: accessCheckExercise.error });
//         }

//         // Suppression (soft delete)
//         const deleted = await repetitionModel.deleteRepetition(sessionExerciseId);
//         if (!deleted) {
//             return res.status(404).json({ error: "Enregistrement introuvable ou déjà supprimé." });
//         }

//         res.json({ message: "Répétition supprimée avec succès." });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: "Erreur serveur." });
//     }
// };

// 📌 Récupérer les répétitions d'une session
exports.getRepetitionsBySessionId = async (req, res) => {
    try {
        const sessionId = req.params.session_id;
        const userId = req.user.id;
        const userRole = req.user.role;

        const accessCheck = await repetitionModel.checkAccessToSession(sessionId, userId, userRole);
        if (accessCheck.error) {
            return res.status(accessCheck.error === "Accès refusé." ? 403 : 404).json({ error: accessCheck.error });
        }

        const exercises = await repetitionModel.getRepetitionsBySessionId(sessionId);
        res.json(exercises);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur." });
    }
};

// 📌 Récupérer les répétition associées à un exercice
exports.getRepetitionsByExerciseId = async (req, res) => {
    try {
        const exerciseId = req.params.exercise_id;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Vérifier l'accès à l'exercice
        const accessCheckExercise = await repetitionModel.checkAccessToExercise(exerciseId, userId, userRole);
        if (accessCheckExercise.error) {
            return res.status(accessCheckExercise.error === "Accès refusé à cette répétition." ? 403 : 404).json({ error: accessCheckExercise.error });
        }

        const exercises = await repetitionModel.getRepetitionsByExerciseId(exerciseId);
        res.json(exercises);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur." });
    }
};
