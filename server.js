require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Import des routes
const downloadReasonRoutes = require('./routes/downloadReason');
const downloadFromRoutes = require('./routes/downloadFrom');
const finalGoalRoutes = require('./routes/finalGoal');
const activityFrequencyRoute = require('./routes/activityFrequency');

app.use('/api/download-reason', downloadReasonRoutes);
app.use('/api/download-from',  downloadFromRoutes);
app.use('/api/final-goal', finalGoalRoutes);
app.use('/api/activity-frequency', activityFrequencyRoute);

// Démarrer le serveur
app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});
