const db = require('../db');

// 📌 Créer un training
exports.createTraining = async (userId, name, recurrence_type, recurrence_value, start_date, training_img) => {
    const [result] = await db.promise().query(
        `INSERT INTO trainings (user_id, name, recurrence_type, recurrence_value, start_date, training_img) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, name, recurrence_type, recurrence_value, start_date, training_img]
    );
    return { id: result.insertId, user_id: userId, name, recurrence_type, recurrence_value, start_date, training_img };
};

// 📌 Mettre à jour un training
exports.updateTraining = async (trainingId, name, recurrence_type, recurrence_value, start_date, training_img) => {
    const [result] = await db.promise().query(
        `UPDATE trainings SET name = ?, recurrence_type = ?, recurrence_value = ?, start_date = ?, training_img = ?
        WHERE id = ? AND deleted_at IS NULL`,
        [name, recurrence_type, recurrence_value, start_date, training_img, trainingId]
    );
    return result.affectedRows > 0;
};

// 📌 Récupérer la liste des trainings d'un utilisateur
exports.getUserTrainings = async (userId) => {
    const [trainings] = await db.promise().query(
        `SELECT id, name, recurrence_type, recurrence_value, start_date, training_img, created_at, updated_at 
        FROM trainings WHERE user_id = ? AND deleted_at IS NULL`,
        [userId]
    );
    return trainings;
};

// 📌 Récupérer un training par ID
exports.getTrainingById = async (trainingId) => {
    const [training] = await db.promise().query(
        `SELECT id, user_id, name, recurrence_type, recurrence_value, start_date, training_img, created_at, updated_at 
        FROM trainings WHERE id = ? AND deleted_at IS NULL`,
        [trainingId]
    );
    return training.length > 0 ? training[0] : null;
};

// 📌 Supprimer un training
exports.deleteTraining = async (trainingId) => {
    const [result] = await db.promise().query(
        `UPDATE trainings SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL`,
        [trainingId]
    );
    return result.affectedRows > 0;
};