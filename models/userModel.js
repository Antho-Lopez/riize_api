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
exports.updateWeightEntry = async (entryId, newWeight, userId) => {
    const [result] = await db.promise().query(
        'UPDATE user_weight_history SET weight = ? WHERE id = ?',
        [newWeight, entryId]
    );

    if (result.affectedRows > 0) {
        await db.promise().query(
            'UPDATE users SET weight = ? WHERE id = ?',
            [newWeight, userId]
        );
    }

    return result.affectedRows > 0;
};

// Ajoute une nouvelle entrée de poids
exports.addWeightEntry = async (userId, newWeight) => {
    const [result] = await db.promise().query(
        'INSERT INTO user_weight_history (user_id, weight) VALUES (?, ?)',
        [userId, newWeight]
    );
    
    if (result.insertId) {
        await db.promise().query(
            'UPDATE users SET weight = ? WHERE id = ?',
            [newWeight, userId]
        );
    }
    return result.insertId;
};

// Ajouter le poids initial lors de l'inscription
exports.addInitialWeight = async (userId, initialWeight) => {
    await db.promise().query(
        'INSERT INTO user_weight_history (user_id, weight) VALUES (?, ?)',
        [userId, initialWeight]
    );
};

// 📌 Récupérer l'historique des poids d'un utilisateur
exports.getUserWeightHistory = async (userId) => {
    const [history] = await db.promise().query(
        'SELECT weight, recorded_at FROM user_weight_history WHERE user_id = ? ORDER BY recorded_at DESC',
        [userId]
    );
    return history;
};

// 📌 Ajouter log à la streak de l'utilisateur 
exports.addUserStreak = async (userId) => {
    const timeZone = 'Europe/Paris';
    
    // Obtenir la date d'aujourd'hui au format YYYY-MM-DD en Europe/Paris
    const today = new Date();
    const todayStr = today.toLocaleDateString('en-CA', { timeZone });
    // Pour les calculs, créer un objet Date à minuit (heure locale) à partir de todayStr
    const todayObj = new Date(todayStr + 'T00:00:00');
    
    // Récupérer la dernière date de log depuis la BDD
    const [rows] = await db.promise().query(`
        SELECT DATE(date) AS date 
        FROM user_streak_logs
        WHERE user_id = ? 
        ORDER BY date DESC 
        LIMIT 1
    `, [userId]);
    
    const lastLog = rows[0];
    // lastDateStr sera au format "YYYY-MM-DD"
    const lastDateStr = lastLog ? lastLog.date : null;
    // Créer un objet Date pour la dernière date de log
    const lastDateObj = lastDateStr ? new Date(lastDateStr) : null;

    // Si la dernière séance est déjà aujourd'hui, on ne fait rien
    if (lastDateStr === todayStr) {
        return; 
    }
    
    let newStreak = 1;
    
    // Récupérer le streak actuel de l'utilisateur
    const [[user]] = await db.promise().query(`
        SELECT streak FROM users WHERE id = ?
    `, [userId]);
    
    if (lastDateObj) {
        // Calculer la différence en jours entre aujourd'hui et la dernière date de log
        const diffTime = todayObj - lastDateObj;
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        
        // Si la différence est comprise entre 1 et 3 jours, on augmente le streak,
        // autrement (gap > 3 jours) on le réinitialise à 1.
        if (diffDays >= 1 && diffDays <= 3) {
            newStreak = user.streak + 1;
        } else {
            newStreak = 1;
        }
    }
    // Mise à jour de la BDD (décommenter pour l'exécution réelle)
    await db.promise().query(`
        UPDATE users SET streak = ? WHERE id = ?
    `, [newStreak, userId]);

    await db.promise().query(`
        INSERT INTO user_streak_logs (user_id, streak_value, date)
        VALUES (?, ?, ?)
    `, [userId, newStreak, todayStr]);
};
