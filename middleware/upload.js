const formidable = require('formidable');
const path = require('path');

const upload = (req, res, next) => {
    const form = new formidable.IncomingForm();

    // Définir le répertoire où les fichiers seront stockés
    form.uploadDir = path.join(__dirname, '..', 'uploads');
    form.keepExtensions = true; // Garder les extensions de fichiers
    form.maxFileSize = 10 * 1024 * 1024; // Limite de taille de fichier (10 Mo)

    // Personnaliser le nom du fichier
    form.on('fileBegin', (name, file) => {
        const ext = path.extname(file.originalFilename);  // Extension du fichier
        const newFilename = `${Date.now()}-${file.originalFilename}`;  // Ajouter un timestamp au nom du fichier
        file.filepath = path.join(form.uploadDir, newFilename);  // Modifier le chemin du fichier avec le nouveau nom
    });

    form.parse(req, (err, fields, files) => {
        if (err) {
            console.log('Erreur formidable:', err);
            return res.status(400).json({ error: 'Erreur lors du traitement du fichier' });
        }

        // Assigner le fichier à req.file pour le transmettre au contrôleur
        req.file = files.profile_picture;
        req.fields = fields;
        next();
    });
};

module.exports = upload;
