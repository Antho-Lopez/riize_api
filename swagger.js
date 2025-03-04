const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "API de gestion d'entraînements",
    description: "Documentation de l'API pour la gestion des entraînements, exercices, sessions, utilisateurs et autres entités.",
    version: "1.0.0",
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    }
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
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "John" },
                  lastname: { type: "string", example: "Doe" },
                  email: { type: "string", format: "email", example: "john.doe@example.com" },
                  password: { type: "string", format: "password", example: "SuperSecret123" },
                  role: { type: "string", enum: ["admin", "user"], default: "user", example: "user" },
                  goal_weight: { type: "number", format: "decimal", example: 70.5 },
                  weight: { type: "number", format: "decimal", example: 75.0 },
                  weight_unit: { type: "string", enum: ["kg", "lb"], default: "kg", example: "kg" },
                  height: { type: "number", format: "decimal", example: 180.0 },
                  height_unit: { type: "string", enum: ["cm", "ft-in"], default: "cm", example: "cm" },
                  birth_date: { type: "string", format: "date", example: "1995-08-15" },
                  sex: { type: "string", enum: ["male", "female"], example: "male" },
                  city: { type: "string", example: "Paris" },
                  streak: { type: "integer", default: 0, example: 0 },
                  profile_picture: { type: "string", format: "url", example: "https://example.com/profile.jpg" },
                  provider: { type: "string", enum: ["local", "google", "apple"], default: "local", example: "local" },
                  provider_id: { type: "string", nullable: true, example: "123456789" },
                  activity_frequency_id: { type: "integer", nullable: true, example: 1 },
                  final_goal_id: { type: "integer", nullable: true, example: 2 },
                  download_reason_id: { type: "integer", nullable: true, example: 3 },
                  download_from_id: { type: "integer", nullable: true, example: 4 }
                },
                required: ["name", "lastname", "email", "password", "sex"]
              }
            }
          }
        },
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
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string", format: "email", example: "john.doe@example.com" },
                  password: { type: "string", format: "password", example: "SuperSecret123" },
                },
                required: ["email", "password"]
              }
            }
          }
        },
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
        security: [
          {
            bearerAuth: []
          }
        ],
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
        security: [
          {
            bearerAuth: []
          }
        ],
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
        security: [
          {
            bearerAuth: []
          }
        ],
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
        security: [
          {
            bearerAuth: []
          }
        ],
        responses: {
          200: { description: "Liste des entraînements récupérée" },
          403: { description: "Accès refusé" },
        },
      },
    },
    "/trainings/{id}": {
      get: {
        summary: "Détails d'un entraînement",
        tags: ["Trainings"],
        security: [
          {
            bearerAuth: []
          }
        ],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          201: { description: "Détails de l'entrainement" },
          400: { description: "Erreur lors de la récupération" },
        },
      },
    },
    "/trainings/create": {
      post: {
        summary: "Créer un entraînement",
        tags: ["Trainings"],
        security: [
          {
            bearerAuth: []
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "recurrence_type"],
                properties: {
                  name: { type: "string", example: "Full Body Workout" },
                  recurrence_type: { type: "string", enum: ["daily", "weekly"], example: "weekly" },
                  recurrence_value: { type: "string", example: "Monday, Wednesday, Friday" },
                  daily_start_date: { type: "string", format: "date", example: "2024-03-10" },
                  training_img: { type: "string", example: "image.jpg" }
                }
              }
            }
          }
        },
        responses: {
          201: { description: "Entraînement créé avec succès" },
          400: { description: "Erreur lors de la création" },
        },
      },
    },
    "/trainings/edit/{id}": {
      put: {
        summary: "Créer un entraînement",
        tags: ["Trainings"],
        security: [
          {
            bearerAuth: []
          }
        ],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          201: { description: "Entraînement créé avec succès" },
          400: { description: "Erreur lors de la création" },
        },
      },
    },
    "/trainings/delete/{id}": {
      delete: {
        summary: "Suppression d'un entrainement",
        tags: ["Trainings"],
        security: [
          {
            bearerAuth: []
          }
        ],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          201: { description: "Entraînement supprimé avec succès" },
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
