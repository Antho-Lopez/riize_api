const db = require('../db');

module.exports = (resourceTable, resourceUserIdField, idParam = "id") => {
    return async (req, res, next) => {
        try {
            const userIdFromToken = req.user.id; // ID utilisateur connecté
            const userRole = req.user.role; // Rôle de l'utilisateur
            const resourceId = parseInt(req.params[idParam], 10); // ID de la ressource demandée
            console.log('je passe ?');
            if (isNaN(resourceId)) {
                return res.status(400).json({ error: "ID invalide." });
            }

            // Si l'utilisateur est admin, il a accès à tout
            if (userRole === 'admin') {
                return next();
            }

            // Vérifier si l'utilisateur accède à sa propre ressource
            const query = `SELECT ${resourceUserIdField} FROM ${resourceTable} WHERE id = ?`;
            const [rows] = await db.promise().query(query, [resourceId]);

            if (rows.length === 0) {
                return res.status(404).json({ error: "Ressource introuvable." });
            }

            const resourceOwnerId = rows[0][resourceUserIdField];

            if (userIdFromToken === resourceOwnerId) {
                return next();
            }

            return res.status(403).json({ error: "Accès refusé. Vous ne pouvez pas gérer cette ressource." });

        } catch (err) {
            console.error("Erreur dans canAccessResource:", err);
            res.status(500).json({ error: "Erreur serveur." });
        }
    };
};
