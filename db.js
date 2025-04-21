const mysql = require('mysql2');
require('dotenv').config(); // Charger les variables d'environnement

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Vérifier la connexion
db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Erreur de connexion à la base de données :', err);
    } else {
        console.log('✅ Connexion MySQL réussie');
        connection.release();
    }
    });

module.exports = db;
