require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger");

const app = express();
const port = process.env.PORT || 3000;

// Middleware global
app.use(cors());
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// Routes
app.use('/api', routes);

// Démarrer le serveur
app.listen(port, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${port}`);
    console.log('📑 Documentation Swagger disponible sur http://localhost:3000/api-docs');
});
