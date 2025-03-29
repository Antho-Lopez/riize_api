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
exports.updateTraining = async (trainingId, updates) => {
    // Vérifier si l'objet updates est vide
    if (Object.keys(updates).length === 0) {
        return false;
    }

    // Construire dynamiquement la requête SQL
    const fields = Object.keys(updates).map(field => `${field} = ?`).join(', ');
    const values = Object.values(updates);

    const query = `UPDATE trainings SET ${fields} WHERE id = ? AND deleted_at IS NULL`;
    
    const [result] = await db.promise().query(query, [...values, trainingId]);
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

    if (training.length === 0) return null;
    const trainingData = training[0];

    // 1. Récupérer les sessions d'entraînement (triées de la plus récente à la plus ancienne)
    const [sessions] = await db.promise().query(
        `SELECT * FROM training_sessions WHERE training_id = ? AND deleted_at IS NULL ORDER BY training_date DESC`,
        [trainingId]
    );

    // 2. Récupérer les exercices associés à cet entraînement, groupés par muscle
    const [exercises] = await db.promise().query(
        `SELECT exercises.id, exercises.name, exercises.training_id, exercises.muscle_id, muscles.name AS muscle_name
        FROM exercises
        JOIN muscles ON exercises.muscle_id = muscles.id
        WHERE exercises.training_id = ? AND exercises.deleted_at IS NULL`,
        [trainingId]
    );

    // Grouper les exercices par muscle
    const exercisesGroupedByMuscle = exercises.reduce((acc, exercise) => {
        const muscleName = exercise.muscle_name;
        if (!acc[muscleName]) {
            acc[muscleName] = [];
        }
        acc[muscleName].push(exercise);
        return acc;
    }, {});

    // 3. Récupérer les exercices des sessions (groupés par session et exercice)
    const [sessionExercises] = await db.promise().query(
        `SELECT tse.id, tse.session_id, tse.exercise_id, tse.reps, tse.weight, es.name AS exercise_name, ts.training_date
        FROM training_session_exercise tse
        JOIN training_sessions ts ON tse.session_id = ts.id
        JOIN exercises es ON tse.exercise_id = es.id
        WHERE ts.training_id = ? AND ts.deleted_at IS NULL
        ORDER BY ts.training_date DESC`,
        [trainingId]
    );

    // Calculer le tonnage pour chaque exercice et grouper par session et exercice
    const sessionExercisesGrouped = sessions.map(session => {
        const exercisesForSession = sessionExercises.filter(se => se.session_id === session.id);
        const exercisesGrouped = exercisesForSession.reduce((acc, se) => {
            const exerciseName = se.exercise_name;
            const tonnage = se.reps * se.weight;  // Calcul du tonnage pour cette série (réps * poids)
            if (!acc[exerciseName]) {
                acc[exerciseName] = { total_tonnage: 0, sets: [] };
            }
            acc[exerciseName].sets.push({ reps: se.reps, weight: se.weight, tonnage });
            acc[exerciseName].total_tonnage += tonnage;  // Ajouter le tonnage de cette série au total
            return acc;
        }, {});

        // Calcul du tonnage total pour la session
        const totalSessionTonnage = exercisesForSession.reduce((total, se) => {
            return total + (se.reps * se.weight); // Somme de tous les tonnages pour cette session
        }, 0);

        return {
            ...session,
            exercises: exercisesGrouped,
            total_tonnage_session: totalSessionTonnage // Ajouter le tonnage total de la session
        };
    });

    // Construction de la réponse finale
    return {
        ...trainingData,
        training_sessions: sessionExercisesGrouped,
        exercises_by_muscle: exercisesGroupedByMuscle
    };
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
