const db = require('../db');

// 📌 Voir la liste des exercices d'un entraînement, regroupés par muscle, avec répétitions
exports.getExercisesByTrainingId = async (trainingId, userId, userRole) => {
    // Vérifier l'accès à l'entraînement
    const [trainingRows] = await db.promise().query(
        `SELECT user_id, name, training_img FROM trainings WHERE id = ? AND deleted_at IS NULL`,
        [trainingId]
    );
    if (trainingRows.length === 0) {
        return { error: "Entraînement introuvable." };
    }
    if (trainingRows[0].user_id !== userId && userRole !== 'admin') {
        return { error: "Accès refusé." };
    }
    const trainingInfo = trainingRows[0];

    // Récupérer les exercices, muscles et répétitions associés à l'entraînement
    const [rows] = await db.promise().query(
        `SELECT 
            e.id AS exercise_id,
            e.name AS exercise_name,
            e.default_weight,
            m.id AS muscle_id,
            m.name AS muscle_name,
            tse.id AS repetition_id,
            tse.reps,
            tse.weight AS rep_weight
        FROM exercises e
        JOIN muscles m ON e.muscle_id = m.id
        LEFT JOIN training_session_exercise tse ON tse.exercise_id = e.id
        WHERE e.training_id = ? AND e.deleted_at IS NULL`,
        [trainingId]
    );

    // Regrouper par muscle
    const exercisesByMuscle = {};
    rows.forEach(row => {
        // Créer le groupe pour ce muscle s'il n'existe pas encore
        if (!exercisesByMuscle[row.muscle_id]) {
        exercisesByMuscle[row.muscle_id] = {
            muscle: {
            id: row.muscle_id,
            name: row.muscle_name
            },
            exercises: {}
        };
        }
        // Ajouter l'exercice s'il n'est pas déjà ajouté
        if (row.exercise_id) {
        if (!exercisesByMuscle[row.muscle_id].exercises[row.exercise_id]) {
            exercisesByMuscle[row.muscle_id].exercises[row.exercise_id] = {
            id: row.exercise_id,
            name: row.exercise_name,
            default_weight: row.default_weight,
            repetitions: []
            };
        }
        // Ajouter la répétition si présente
        if (row.repetition_id) {
            exercisesByMuscle[row.muscle_id].exercises[row.exercise_id].repetitions.push({
            repetition_id: row.repetition_id,
            reps: row.reps,
            weight: row.rep_weight
            });
        }
        }
    });

    // Convertir l'objet en tableau pour le format de réponse souhaité
    const exercises_by_muscle = Object.values(exercisesByMuscle).map(group => {
        group.exercises = Object.values(group.exercises);
        return group;
    });

    return {
        training_id: trainingId,
        name: trainingInfo.name,
        training_img: trainingInfo.training_img,
        exercises_by_muscle: exercises_by_muscle
    };
};

// 📌 Voir les détails d'un exercice
exports.getExerciseById = async (exerciseId, userId, userRole) => {
    const query = `
        SELECT e.* FROM exercises e
        JOIN trainings t ON e.training_id = t.id
        WHERE e.id = ? AND e.deleted_at IS NULL
        AND (t.user_id = ? OR ? = 'admin')
    `;
    const [rows] = await db.promise().query(query, [exerciseId, userId, userRole]);
    return rows.length > 0 ? rows[0] : null;
};

// 📌 Créer un exercice
exports.createExercise = async ({ muscle_id, training_id, name, default_weight }, userId, userRole) => {
    // Vérifier si l'utilisateur possède cet entraînement
    const [training] = await db.promise().query(`SELECT user_id FROM trainings WHERE id = ?`, [training_id]);
    if (training.length === 0 || (training[0].user_id !== userId && userRole !== 'admin')) {
        return null; // Accès refusé
    }

    const [result] = await db.promise().query(
        `INSERT INTO exercises (muscle_id, training_id, name, default_weight) VALUES (?, ?, ?, ?)`,
        [muscle_id, training_id, name, default_weight]
    );
    return result.insertId;
};

// 📌 Modifier un exercice
exports.updateExercise = async (exerciseId, updates, userId, userRole) => {
    // Vérifier si l'utilisateur possède cet exercice
    const [exercise] = await db.promise().query(`
        SELECT t.user_id FROM exercises e
        JOIN trainings t ON e.training_id = t.id
        WHERE e.id = ?`, [exerciseId]);

    if (exercise.length === 0 || (exercise[0].user_id !== userId && userRole !== 'admin')) {
        return null; // Accès refusé
    }

    // Construire dynamiquement la requête
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined) {
            fields.push(`${key} = ?`);
            values.push(value);
        }
    }

    if (fields.length === 0) return null;

    values.push(exerciseId);
    const query = `UPDATE exercises SET ${fields.join(", ")} WHERE id = ? AND deleted_at IS NULL`;
    const [result] = await db.promise().query(query, values);
    return result.affectedRows > 0;
};

// 📌 Supprimer un exercice (soft delete)
exports.deleteExercise = async (exerciseId, userId, userRole) => {
    // Vérifier si l'utilisateur possède cet exercice
    const [exercise] = await db.promise().query(`
        SELECT t.user_id FROM exercises e
        JOIN trainings t ON e.training_id = t.id
        WHERE e.id = ?`, [exerciseId]);

    if (exercise.length === 0 || (exercise[0].user_id !== userId && userRole !== 'admin')) {
        return null; // Accès refusé
    }

    const [result] = await db.promise().query(
        `UPDATE exercises SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL`,
        [exerciseId]
    );
    return result.affectedRows > 0;
};
