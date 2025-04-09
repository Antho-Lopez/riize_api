const db = require('../db');

exports.logError = async (req, res) => {
    const { message, error_type, user_id, endpoint, stack_trace } = req.body;

    // Vérification de la présence des données essentielles (message et user_id)
    if (!message || !user_id) {
        return res.status(400).json({ error: 'Données manquantes : message et user_id sont obligatoires' });
    }

    // Requête pour insérer l'erreur dans la base de données
    const query = `
        INSERT INTO error_logs (message, error_type, user_id, endpoint, stack_trace)
        VALUES (?, ?, ?, ?, ?)
    `;

    try {
        // Insertion de l'erreur dans la base de données
        await db.promise().query(query, [message, error_type || null, user_id, endpoint || null, stack_trace || null]);

        return res.status(201).json({ message: 'Erreur enregistrée avec succès' });
    } catch (err) {
        console.error('Erreur lors de l\'enregistrement dans la base de données:', err);
        return res.status(500).json({ error: 'Erreur serveur lors de l\'enregistrement de l\'erreur' });
    }
};