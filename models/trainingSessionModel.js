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

