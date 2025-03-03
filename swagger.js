const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "API de gestion d'entraînements",
    description: "Documentation de l'API pour la gestion des entraînements, exercices, sessions, utilisateurs et autres entités.",
    version: "1.0.0",
  },
  servers: [
    {
      url: "http://localhost:3000/api",
      description: "Serveur local",
    },
  ],
  tags: [
    { name: "Authentification", description: "Routes pour l'authentification des utilisateurs" },
    { name: "Users", description: "Gestion des utilisateurs" },
    { name: "Trainings", description: "Gestion des entraînements" },
    { name: "Training Sessions", description: "Gestion des sessions d'entraînement" },
    { name: "Exercises", description: "Gestion des exercices" },
    { name: "Repetitions", description: "Gestion des répétitions" },
    { name: "Miscellaneous", description: "Autres données utilisées dans l'application" },
  ],
  paths: {
    "/auth/google": {
      post: {
        summary: "Connexion avec Google",
        tags: ["Authentification"],
        responses: {
          200: { description: "Connexion réussie" },
          400: { description: "Erreur lors de la connexion" },
        },
      },
    },
    "/auth/apple": {
      post: {
        summary: "Connexion avec Apple",
        tags: ["Authentification"],
        responses: {
          200: { description: "Connexion réussie" },
          400: { description: "Erreur lors de la connexion" },
        },
      },
    },
    "/auth/register": {
      post: {
        summary: "Inscription d'un utilisateur",
        tags: ["Authentification"],
        responses: {
          201: { description: "Utilisateur créé avec succès" },
          400: { description: "Erreur lors de l'inscription" },
        },
      },
    },
    "/auth/login": {
      post: {
        summary: "Connexion utilisateur",
        tags: ["Authentification"],
        responses: {
          200: { description: "Connexion réussie" },
          401: { description: "Identifiants incorrects" },
        },
      },
    },
    "/auth/refresh": {
      post: {
        summary: "Rafraîchir le token d'authentification",
        tags: ["Authentification"],
        responses: {
          200: { description: "Nouveau token généré" },
          401: { description: "Token invalide" },
        },
      },
    },
    "/users/{id}": {
      get: {
        summary: "Récupérer le profil d'un utilisateur",
        tags: ["Users"],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: { description: "Profil utilisateur récupéré" },
          403: { description: "Accès refusé" },
          404: { description: "Utilisateur non trouvé" },
        },
      },
    },
    "/users/edit/{id}": {
      put: {
        summary: "Modification d'un utilisateur",
        tags: ["Users"],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: { description: "Utilisateur modifié" },
          403: { description: "Accès refusé" },
          404: { description: "Utilisateur non trouvé" },
        },
      },
    },
    "/users/delete/{id}": {
      delete: {
        summary: "Suppression d'un utilisateur",
        tags: ["Users"],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: { description: "Utilisateur supprimé" },
          403: { description: "Accès refusé" },
          404: { description: "Utilisateur non trouvé" },
        },
      },
    },
    "/trainings": {
      get: {
        summary: "Récupérer les entraînements d'un utilisateur",
        tags: ["Trainings"],
        responses: {
          200: { description: "Liste des entraînements récupérée" },
          403: { description: "Accès refusé" },
        },
      },
    },
    "/trainings/create": {
      post: {
        summary: "Créer un entraînement",
        tags: ["Trainings"],
        responses: {
          201: { description: "Entraînement créé avec succès" },
          400: { description: "Erreur lors de la création" },
        },
      },
    },
    "/training-sessions/create": {
      post: {
        summary: "Créer une session d'entraînement",
        tags: ["Training Sessions"],
        responses: {
          201: { description: "Session créée avec succès" },
          400: { description: "Erreur lors de la création" },
        },
      },
    },
    "/exercises/create": {
      post: {
        summary: "Créer un exercice",
        tags: ["Exercises"],
        responses: {
          201: { description: "Exercice créé avec succès" },
          400: { description: "Erreur lors de la création" },
        },
      },
    },
    "/repetitions/create": {
      post: {
        summary: "Ajouter une répétition à un exercice",
        tags: ["Repetitions"],
        responses: {
          201: { description: "Répétition ajoutée" },
          400: { description: "Erreur lors de l'ajout" },
        },
      },
    },
    "/activity-frequency": {
      get: {
        summary: "Récupérer toutes les fréquences d'activité",
        tags: ["Miscellaneous"],
        responses: {
          200: { description: "Liste des fréquences d'activité récupérée" },
          500: { description: "Erreur serveur" },
        },
      },
    },
    "/muscles": {
      get: {
        summary: "Récupérer la liste des muscles",
        tags: ["Miscellaneous"],
        responses: {
          200: { description: "Liste des muscles récupérée" },
          500: { description: "Erreur serveur" },
        },
      },
    },
  },
};

module.exports = swaggerDefinition;
