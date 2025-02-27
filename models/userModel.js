const db = require('../db');

// Trouver un utilisateur par ID
exports.findById = async (id) => {
    const [rows] = await db.promise().query(
        'SELECT * FROM users WHERE id = ?',
        [id]
    );
    return rows.length > 0 ? rows[0] : null;
};

// Mettre à jour un utilisateur
exports.updateById = async (id, data) => {
    const [result] = await db.promise().query(
        'UPDATE users SET ? WHERE id = ?',
        [data, id]
    );
    return result.affectedRows > 0;
};

// Supprimer un utilisateur
exports.deleteById = async (id) => {
    const [result] = await db.promise().query(
        'DELETE FROM users WHERE id = ?',
        [id]
    );
    return result.affectedRows > 0;
};

// Récupérer tous les utilisateurs
exports.findAll = async () => {
    const [rows] = await db.promise().query(
        'SELECT id, name, lastname, email, role FROM users'
    );
    return rows;
};

// Gestion de l'historique de poid des utilisateurs 
// Vérifie si une entrée existe déjà aujourd'hui
exports.getTodayWeightEntry = async (userId) => {
    const [rows] = await db.promise().query(
        'SELECT id FROM user_weight_history WHERE user_id = ? AND DATE(recorded_at) = CURDATE()',
        [userId]
    );
    return rows.length > 0 ? rows[0].id : null;
};

// Met à jour le poids existant pour aujourd'hui
exports.updateWeightEntry = async (entryId, newWeight) => {
    const [result] = await db.promise().query(
        'UPDATE user_weight_history SET weight = ? WHERE id = ?',
        [newWeight, entryId]
    );
    return result.affectedRows > 0;
};

// Ajoute une nouvelle entrée de poids
exports.addWeightEntry = async (userId, newWeight) => {
    const [result] = await db.promise().query(
        'INSERT INTO user_weight_history (user_id, weight) VALUES (?, ?)',
        [userId, newWeight]
    );
    return result.insertId;
};

// Ajouter le poids initial lors de l'inscription
exports.addInitialWeight = async (userId, initialWeight) => {
    await db.promise().query(
        'INSERT INTO user_weight_history (user_id, weight) VALUES (?, ?)',
        [userId, initialWeight]
    );
};
