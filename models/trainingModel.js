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

// Récupérer le training du jour
exports.getTodayTraining = async (userId) => {
    const query = `
        SELECT 
        t.id AS training_id,
        t.user_id,
        t.name AS training_name,
        t.recurrence_type,
        t.recurrence_value,
        t.start_date,
        t.training_img,
        t.created_at,
        t.updated_at,
        IFNULL(
            JSON_ARRAYAGG(
            CASE 
                WHEN e.id IS NOT NULL THEN JSON_OBJECT(
                'exercise_id', e.id,
                'exercise_name', e.name,
                'default_weight', e.default_weight,
                'muscle', JSON_OBJECT(
                    'muscle_id', m.id,
                    'muscle_name', m.name
                )
                )
            END
            ),
            JSON_ARRAY()
        ) AS exercises
        FROM trainings t
        LEFT JOIN exercises e ON e.training_id = t.id AND e.deleted_at IS NULL
        LEFT JOIN muscles m ON e.muscle_id = m.id
        WHERE t.user_id = ?
        AND t.deleted_at IS NULL
        AND t.start_date IS NOT NULL
        AND CURDATE() >= t.start_date
        AND (
            (t.recurrence_type = 'daily' 
            AND DATEDIFF(CURDATE(), t.start_date) % IFNULL(CAST(t.recurrence_value AS UNSIGNED), 1) = 0
            )
            OR
            (t.recurrence_type = 'weekly' 
            AND WEEKDAY(CURDATE()) = WEEKDAY(t.start_date)
            )
        )
        GROUP BY t.id
        LIMIT 1
    `;

    const [rows] = await db.promise().query(query, [userId]);
    return rows.length > 0 ? rows[0] : null;
};
