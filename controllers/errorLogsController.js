const db = require('../db');

exports.logError = async (req, res) => {
    const { message, error_type, user_id, endpoint, stack_trace } = req.body;

    // Vérification des données essentielles
    if (!message || !user_id) {
        return res.status(400).json({ error: 'Données manquantes : message et user_id sont obligatoires' });
    }

    try {
        // Vérification si une erreur identique a déjà été enregistrée récemment (ex : dans les 5 dernières secondes)
        const duplicateCheckQuery = `
            SELECT COUNT(*) as count FROM error_logs
            WHERE message = ? AND user_id = ? AND endpoint = ?
            AND created_at > NOW() - INTERVAL 5 SECOND
        `;
        const [rows] = await db.promise().query(duplicateCheckQuery, [message, user_id, endpoint || null]);

        if (rows[0].count > 0) {
            return res.status(200).json({ message: 'Erreur déjà enregistrée récemment' });
        }

        // Insertion de l'erreur dans la base de données
        const insertQuery = `
            INSERT INTO error_logs (message, error_type, user_id, endpoint, stack_trace)
            VALUES (?, ?, ?, ?, ?)
        `;
        await db.promise().query(insertQuery, [
            message,
            error_type || null,
            user_id,
            endpoint || null,
            stack_trace || null
        ]);

        return res.status(201).json({ message: 'Erreur enregistrée avec succès' });
    } catch (err) {
        console.error("Erreur lors de l'enregistrement dans la base de données :", err);
        return res.status(500).json({ error: 'Erreur serveur lors de l\'enregistrement de l\'erreur' });
    }
};