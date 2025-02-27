module.exports = (req, res, next) => {
    
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: "Accès interdit. Vous devez être administrateur." });
    }
    next();
};
