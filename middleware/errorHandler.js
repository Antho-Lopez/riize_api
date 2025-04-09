module.exports = (err, req, res, next) => {
    // Si c'est une erreur d'API ou une erreur inattendue, on l'enregistre dans la base
    if (err) {
        const message = err.message || 'Erreur inconnue';
        const error_type = err.name || 'Erreur';
        const user_id = req.user ? req.user.id : null;  // Si un utilisateur est connecté, on récupère son ID
        const endpoint = req.originalUrl;
        const stack_trace = err.stack;

        // Enregistrer l'erreur dans la base de données
        db.promise().query(`
            INSERT INTO error_logs (message, error_type, user_id, endpoint, stack_trace)
            VALUES (?, ?, ?, ?, ?)
        `, [message, error_type, user_id, endpoint, stack_trace]);

        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    } else {
        next();
    }
};