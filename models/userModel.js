const db = require('../db');

// 📌 Trouver un utilisateur par ID
exports.findById = async (id) => {
    const [rows] = await db.promise().query(
        'SELECT * FROM users WHERE id = ?',
        [id]
    );
    return rows.length > 0 ? rows[0] : null;
};

// 📌 Mettre à jour un utilisateur
exports.updateById = async (id, data) => {
    const [result] = await db.promise().query(
        'UPDATE users SET ? WHERE id = ?',
        [data, id]
    );
    return result.affectedRows > 0;
};

// 📌 Supprimer un utilisateur
exports.deleteById = async (id) => {
    const [result] = await db.promise().query(
        'DELETE FROM users WHERE id = ?',
        [id]
    );
    return result.affectedRows > 0;
};

// 📌 Récupérer tous les utilisateurs
exports.findAll = async () => {
    const [rows] = await db.promise().query(
        'SELECT id, name, lastname, email, role FROM users'
    );
    return rows;
};
