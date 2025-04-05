const db = require('../db');

// 📌 Créer une session d'entraînement
exports.createSession = async (trainingId, notes, start_time, end_time, training_date) => {
    const [result] = await db.promise().query(
        `INSERT INTO training_sessions (training_id, notes, start_time, end_time, training_date) 
        VALUES (?, ?, ?, ?, ?)`,
        [trainingId, notes, start_time, end_time, training_date]
    );
    return { id: result.insertId, training_id: trainingId, notes, start_time, end_time, training_date };
};

// 📌 Mettre à jour une session d'entraînement
exports.updateSession = async (sessionId, userId, userRole, updates) => {
    // Vérifier que la session existe et récupérer son training_id
    const [sessionRows] = await db.promise().query(
        `SELECT ts.training_id, t.user_id 
        FROM training_sessions ts
        JOIN trainings t ON ts.training_id = t.id
        WHERE ts.id = ? AND ts.deleted_at IS NULL`,
        [sessionId]
    );

    if (sessionRows.length === 0) {
        return { success: false, error: "Session introuvable ou déjà supprimée." };
    }

    const session = sessionRows[0];

    // Vérifier si l'utilisateur est propriétaire du training ou admin
    if (session.user_id !== userId && userRole !== 'admin') {
        return { success: false, error: "Accès refusé. Vous ne pouvez pas modifier cette session." };
    }

    // Liste des champs autorisés à être mis à jour
    const allowedFields = ["notes", "start_time", "end_time", "training_date"];
    
    // Construire la requête dynamiquement
    const fields = [];
    const values = [];

    allowedFields.forEach(field => {
        if (updates[field] !== undefined) {
            fields.push(`${field} = ?`);
            values.push(updates[field]);
        }
    });

    if (fields.length === 0) {
        return { success: false, error: "Aucune mise à jour fournie." };
    }

    values.push(sessionId); // Ajouter l'ID de la session à la fin

    const query = `UPDATE training_sessions SET ${fields.join(", ")} WHERE id = ?`;

    const [result] = await db.promise().query(query, values);

    return { success: result.affectedRows > 0 };
};

// 📌 Récupérer toutes les sessions d'un training (ignorer les supprimées)
exports.getSessionsByTrainingId = async (trainingId) => {
    const [sessions] = await db.promise().query(
        `SELECT id, training_id, notes, start_time, end_time, training_date, updated_at 
        FROM training_sessions WHERE training_id = ? AND deleted_at IS NULL`,
        [trainingId]
    );
    return sessions;
};

// 📌 Récupérer une session spécifique (ignorer les supprimées)
exports.getSessionById = async (sessionId, userId, userRole) => {
    // Récupérer la session avec l'info du propriétaire du training
    const [rows] = await db.promise().query(
        `SELECT ts.*, t.user_id AS training_owner_id 
        FROM training_sessions ts
        JOIN trainings t ON ts.training_id = t.id
        WHERE ts.id = ? AND ts.deleted_at IS NULL`,
        [sessionId]
    );

    if (rows.length === 0) {
        return { success: false, status: 404, error: "Session introuvable ou déjà supprimée." };
    }

    const session = rows[0];

    // Vérification des accès : propriétaire ou admin
    if (session.training_owner_id !== userId && userRole !== 'admin') {
        return { success: false, status: 403, error: "Accès refusé." };
    }

    return { success: true, status: 200, data: session };
};

exports.getCurrentSession = async (userId) => {
    const [rows] = await db.promise().query(
        `SELECT 
            ts.id AS session_id,
            ts.start_time, ts.end_time, ts.training_date, ts.notes,
            t.id AS training_id, t.name AS training_name, t.training_img, t.recurrence_type, t.recurrence_value, t.start_date,
            e.id AS exercise_id, e.name AS exercise_name, e.default_weight,
            m.id AS muscle_id, m.name AS muscle_name,
            tse.id AS repetition_id, tse.reps, tse.weight AS rep_weight
        FROM training_sessions ts
        JOIN trainings t ON ts.training_id = t.id
        LEFT JOIN training_session_exercise tse ON tse.session_id = ts.id
        LEFT JOIN exercises e ON tse.exercise_id = e.id
        LEFT JOIN muscles m ON e.muscle_id = m.id
        WHERE t.user_id = ? 
            AND ts.start_time IS NOT NULL 
            AND ts.end_time IS NULL
        ORDER BY ts.start_time DESC`,
        [userId]
    );

    if (rows.length === 0) return null;

    // On prend le session_id du premier enregistrement (on suppose qu'il n'y a qu'une session en cours)
    const targetSessionId = rows[0].session_id;
    const filteredRows = rows.filter(row => row.session_id === targetSessionId);

    // Création de l'objet session avec les infos de la session et de l'entraînement
    const session = {
        session_id: filteredRows[0].session_id,
        start_time: filteredRows[0].start_time,
        end_time: filteredRows[0].end_time,
        training_date: filteredRows[0].training_date,
        notes: filteredRows[0].notes,
        training: {
        training_id: filteredRows[0].training_id,
        name: filteredRows[0].training_name,
        training_img: filteredRows[0].training_img,
        recurrence_type: filteredRows[0].recurrence_type,
        recurrence_value: filteredRows[0].recurrence_value,
        start_date: filteredRows[0].start_date,
        exercises: []
        }
    };

    // Agrégation des exercices et répétitions
    const exerciseMap = {};
    filteredRows.forEach(row => {
        if (row.exercise_id) {
        if (!exerciseMap[row.exercise_id]) {
            exerciseMap[row.exercise_id] = {
            exercise_id: row.exercise_id,
            name: row.exercise_name,
            default_weight: row.default_weight,
            muscle: row.muscle_id ? { muscle_id: row.muscle_id, name: row.muscle_name } : null,
            repetitions: []
            };
            session.training.exercises.push(exerciseMap[row.exercise_id]);
        }
        if (row.repetition_id) {
            exerciseMap[row.exercise_id].repetitions.push({
            repetition_id: row.repetition_id,
            reps: row.reps,
            weight: row.rep_weight
            });
        }
        }
    });

    return session;
};

exports.getTodayCompletedSession = async (userId) => {
    const query = `
        SELECT 
            t.id AS training_id,
            t.name AS training_name,
            t.training_img,
            t.recurrence_type,
            t.recurrence_value,
            t.start_date,
            ts.id AS session_id,
            ts.notes,
            ts.start_time,
            ts.end_time,
            ts.training_date,
            ts.updated_at
        FROM training_sessions ts
        JOIN trainings t ON ts.training_id = t.id
        WHERE t.user_id = ?
            AND ts.training_date = CURDATE()
            AND ts.end_time IS NOT NULL
            AND ts.deleted_at IS NULL
        ORDER BY ts.start_time DESC
        LIMIT 1
    `;

    const [rows] = await db.promise().query(query, [userId]);
    return rows.length > 0 ? rows[0] : null;
};

// 📌 Soft delete d'une session
exports.deleteSession = async (sessionId, userId, userRole) => {
    // Vérifier que la session existe et récupérer son owner
    const [rows] = await db.promise().query(
        `SELECT ts.id, t.user_id AS training_owner_id 
        FROM training_sessions ts
        JOIN trainings t ON ts.training_id = t.id
        WHERE ts.id = ? AND ts.deleted_at IS NULL`,
        [sessionId]
    );

    if (rows.length === 0) {
        return { success: false, status: 404, error: "Session introuvable ou déjà supprimée." };
    }

    const session = rows[0];

    // Vérification des accès : propriétaire ou admin
    if (session.training_owner_id !== userId && userRole !== 'admin') {
        return { success: false, status: 403, error: "Accès refusé." };
    }

    // Effectuer le soft delete
    const [result] = await db.promise().query(
        `UPDATE training_sessions SET deleted_at = NOW() WHERE id = ?`,
        [sessionId]
    );

    return result.affectedRows > 0
        ? { success: true, status: 200 }
        : { success: false, status: 500, error: "Erreur lors de la suppression." };
};

