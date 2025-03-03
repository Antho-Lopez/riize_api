require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const setupSwagger = require('./swagger');

const app = express();
const port = process.env.PORT || 3000;

// Middleware global
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', routes);

// Swagger
setupSwagger(app);

// Démarrer le serveur
app.listen(port, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${port}`);
});
