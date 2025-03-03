const db = require('../db');

// 📌 Vérifier l'accès à une session d'entraînement
exports.checkAccessToSession = async (sessionId, userId, userRole) => {
    const [result] = await db.promise().query(
        `SELECT trainings.user_id 
        FROM training_sessions 
        JOIN trainings ON training_sessions.training_id = trainings.id
        WHERE training_sessions.id = ? AND training_sessions.deleted_at IS NULL`,
        [sessionId]
    );

    if (result.length === 0) {
        return { error: "Session introuvable." };
    }

    if (result[0].user_id !== userId && userRole !== 'admin') {
        return { error: "Accès refusé." };
    }

    return { success: true };
};

// 📌 Vérifier si l'utilisateur a accès à un exercice
exports.checkAccessToExercise = async (exerciseId, userId, userRole) => {
    const [result] = await db.promise().query(
        `SELECT trainings.user_id 
        FROM exercises 
        JOIN trainings ON exercises.training_id = trainings.id
        WHERE exercises.id = ? AND exercises.deleted_at IS NULL`,
        [exerciseId]
    );

    if (result.length === 0) {
        return { error: "Exercice introuvable." };
    }

    if (result[0].user_id !== userId && userRole !== 'admin') {
        return { error: "Accès refusé à cet exercice." };
    }

    return { success: true };
};


// 📌 Créer une training_session_exercise
exports.createRepetition = async (sessionId, exerciseId, reps, weight) => {
    const [result] = await db.promise().query(
        `INSERT INTO training_session_exercise (session_id, exercise_id, reps, weight) 
        VALUES (?, ?, ?, ?)`,
        [sessionId, exerciseId, reps, weight]
    );
    return result.insertId;
};

// 📌 Modifier une training_session_exercise
exports.updateRepetition = async (id, updates) => {
    const fields = [];
    const values = [];

    Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) {
            fields.push(`${key} = ?`);
            values.push(value);
        }
    });

    if (fields.length === 0) return false;

    values.push(id);
    const [result] = await db.promise().query(
        `UPDATE training_session_exercise SET ${fields.join(', ')} WHERE id = ?`,
        values
    );
    return result.affectedRows > 0;
};

// 📌 Supprimer (soft delete)
exports.deleteRepetition = async (id) => {
    const [result] = await db.promise().query(
        `DELETE FROM training_session_exercise WHERE id = ?`,
        [id]
    );
    return result.affectedRows > 0;
};

// 📌 Récupérer les exercices d'une session
exports.getRepetitionsBySessionId = async (sessionId) => {
    const [rows] = await db.promise().query(
        `SELECT * FROM training_session_exercise WHERE session_id = ?`,
        [sessionId]
    );
    return rows;
};

// 📌 Récupérer les sessions associées à un exercice
exports.getRepetitionsByExerciseId = async (exerciseId) => {
    const [rows] = await db.promise().query(
        `SELECT * FROM training_session_exercise WHERE exercise_id = ?`,
        [exerciseId]
    );
    return rows;
};
