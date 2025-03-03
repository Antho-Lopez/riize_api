const db = require('../db');

// 📌 Voir la liste des exercices d'un entraînement
exports.getExercisesByTrainingId = async (trainingId, userId, userRole) => {
    // Vérifier si l'utilisateur a accès à l'entraînement
    const [training] = await db.promise().query(
        `SELECT user_id FROM trainings WHERE id = ? AND deleted_at IS NULL`,
        [trainingId]
    );

    if (training.length === 0) {
        return { error: "Entraînement introuvable." };
    }

    if (training[0].user_id !== userId && userRole !== 'admin') {
        return { error: "Accès refusé." };
    }

    // Récupérer les exercices si l'utilisateur a accès
    const [rows] = await db.promise().query(
        `SELECT * FROM exercises WHERE training_id = ? AND deleted_at IS NULL`,
        [trainingId]
    );

    return rows;
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
