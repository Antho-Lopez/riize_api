const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Configuration Swagger
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Riize API Documentation',
            version: '1.0.0',
            description: 'Documentation de l\'API de Riize',
        },
        servers: [
            {
                url: 'http://localhost:3000', // Modifier selon environnement
            },
        ],
    },
    apis: ['./routes/*.js'], // Tous les fichiers pour documenter les routes
};

const swaggerSpec = swaggerJSDoc(options);

const setupSwagger = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log('📄 Documentation Swagger disponible sur http://localhost:3000/api-docs');
};

module.exports = setupSwagger;
