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
    { name: "Register infos", description: "Autres données utilisées dans l'application" },
    { name: "Users", description: "Gestion des utilisateurs" },
    { name: "Trainings", description: "Gestion des entraînements" },
    { name: "Training Sessions", description: "Gestion des sessions d'entraînement" },
    { name: "Exercises", description: "Gestion des exercices" },
    { name: "Repetitions", description: "Gestion des répétitions" },
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
    
    "/activity-frequency": {
      get: {
        summary: "Récupérer toutes les fréquences d'activité",
        tags: ["Register infos"],
        responses: {
          200: { description: "Liste des fréquences d'activité récupérée" },
          500: { description: "Erreur serveur" },
        },
      },
    },
    "/download-from": {
      get: {
        summary: "Récupérer toutes les fréquences d'activité",
        tags: ["Register infos"],
        responses: {
          200: { description: "Liste des différentes fréquences d'activité possible" },
          500: { description: "Erreur serveur" },
        },
      },
    },
    "/download-reason": {
      get: {
        summary: "Récupérer toutes les raisons de téléchargement de l'application",
        tags: ["Register infos"],
        responses: {
          200: { description: "Liste des raisons de téléchargement" },
          500: { description: "Erreur serveur" },
        },
      },
    },
    "/final-goal": {
      get: {
        summary: "Récupérer les objectifs disponibles pour les utilisateurs",
        tags: ["Register infos"],
        responses: {
          200: { description: "Liste des objectifs disponibles" },
          500: { description: "Erreur serveur" },
        },
      },
    },
    "/muscles": {
      get: {
        summary: "Récupérer la liste des muscles",
        tags: ["Register infos"],
        responses: {
          200: { description: "Liste des muscles récupérée" },
          500: { description: "Erreur serveur" },
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
    "/users/weight-history/{id}": {
      get: {
        summary: "Récupérer l'historique de poids d'un utilisateur",
        tags: ["Users"],
        security: [
          {
            bearerAuth: []
          }
        ],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: { description: "Liste de l'historique de poids récupéré" },
          403: { description: "Accès refusé" },
        },
      },
    },
    "/users/update-weight/{id}": {
      post: {
        summary: "Ajout d'une nouvelle valeur de poids ",
        tags: ["Users"],
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
                required: ["newWeight"],
                properties: {
                  newWeight: { type: "float", example: 54.20 }
                }
              }
            }
          }
        },
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          201: { description: "Entraînement créé avec succès" },
          400: { description: "Erreur lors de la création" },
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
                  start_date: { type: "string", format: "date", example: "2024-03-10" },
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

    "/training-sessions/by-training/{training_id}": {
      get: {
        summary: "Récupérer toutes les sessions d'un entraînement",
        tags: ["Training Sessions"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "training_id",
            in: "path",
            required: true,
            schema: { type: "integer" }
          }
        ],
        responses: {
          200: { description: "Liste des sessions récupérée" },
          403: { description: "Accès refusé (Token manquant ou invalide)" },
          404: { description: "Entraînement non trouvé" }
        }
      }
    },
    "/training-sessions/{id}": {
      get: {
        summary: "Récupérer les détails d'une session d'entraînement",
        tags: ["Training Sessions"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" }
          }
        ],
        responses: {
          200: { description: "Détails de la session récupérés" },
          403: { description: "Accès refusé (Token manquant ou invalide)" },
          404: { description: "Session non trouvée" }
        }
      }
    },
    "/training-sessions/create": {
      post: {
        summary: "Créer une session d'entraînement",
        tags: ["Training Sessions"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["training_id"],
                properties: {
                  training_id: { type: "integer", example: 1 },
                  notes: { type: "string", example: "Super séance aujourd'hui !" },
                  start_time: { type: "string", format: "time", example: "10:00:00" },
                  end_time: { type: "string", format: "time", example: "11:00:00" },
                  training_date: { type: "string", format: "date", example: "2024-03-10" }
                }
              }
            }
          }
        },
        responses: {
          201: { description: "Session créée avec succès" },
          400: { description: "Erreur lors de la création" },
          403: { description: "Accès refusé (Token manquant ou invalide)" }
        }
      }
    },
    "/training-sessions/edit/{id}": {
      put: {
        summary: "Modifier une session d'entraînement",
        tags: ["Training Sessions"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  notes: { type: "string", example: "Ajout de notes supplémentaires" },
                  start_time: { type: "string", format: "time", example: "09:30:00" },
                  end_time: { type: "string", format: "time", example: "10:30:00" },
                  training_date: { type: "string", format: "date", example: "2024-03-12" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Session mise à jour avec succès" },
          400: { description: "Erreur lors de la mise à jour" },
          403: { description: "Accès refusé (Token manquant ou invalide)" },
          404: { description: "Session non trouvée" }
        }
      }
    },
    "/training-sessions/delete/{id}": {
      delete: {
        summary: "Supprimer une session d'entraînement (soft delete)",
        tags: ["Training Sessions"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" }
          }
        ],
        responses: {
          200: { description: "Session supprimée avec succès" },
          403: { description: "Accès refusé (Token manquant ou invalide)" },
          404: { description: "Session non trouvée" }
        }
      }
    },

    "/exercises/by-training/{training_id}": {
      get: {
        summary: "Récupérer la liste des exercices d'un entraînement",
        tags: ["Exercises"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "training_id",
            in: "path",
            required: true,
            schema: { type: "integer" }
          }
        ],
        responses: {
          200: { description: "Liste des exercices récupérée" },
          403: { description: "Accès refusé (Token manquant ou invalide)" },
          404: { description: "Entraînement non trouvé" }
        }
      }
    },
    "/exercises/{id}": {
      get: {
        summary: "Récupérer les détails d'un exercice",
        tags: ["Exercises"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" }
          }
        ],
        responses: {
          200: { description: "Détails de l'exercice récupérés" },
          403: { description: "Accès refusé (Token manquant ou invalide)" },
          404: { description: "Exercice non trouvé" }
        }
      }
    },
    "/exercises/create": {
      post: {
        summary: "Créer un exercice",
        tags: ["Exercises"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["training_id", "name"],
                properties: {
                  training_id: { type: "integer", example: 1 },
                  muscle_id: { type: "integer", example: 5 },
                  name: { type: "string", example: "Développé couché" },
                  default_weight: { type: "number", format: "decimal", example: 80.5 }
                }
              }
            }
          }
        },
        responses: {
          201: { description: "Exercice créé avec succès" },
          400: { description: "Erreur lors de la création" },
          403: { description: "Accès refusé (Token manquant ou invalide)" }
        }
      }
    },
    "/exercises/edit/{id}": {
      put: {
        summary: "Modifier un exercice",
        tags: ["Exercises"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  muscle_id: { type: "integer", example: 3 },
                  name: { type: "string", example: "Développé militaire" },
                  default_weight: { type: "number", format: "decimal", example: 60.0 }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Exercice mis à jour avec succès" },
          400: { description: "Erreur lors de la mise à jour" },
          403: { description: "Accès refusé (Token manquant ou invalide)" },
          404: { description: "Exercice non trouvé" }
        }
      }
    },
    "/exercises/delete/{id}": {
      delete: {
        summary: "Supprimer un exercice (soft delete)",
        tags: ["Exercises"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" }
          }
        ],
        responses: {
          200: { description: "Exercice supprimé avec succès" },
          403: { description: "Accès refusé (Token manquant ou invalide)" },
          404: { description: "Exercice non trouvé" }
        }
      }
    },

    "/repetitions/create": {
      post: {
        summary: "Créer une répétition",
        tags: ["Repetitions"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["session_id", "exercise_id", "reps"],
                properties: {
                  session_id: { type: "integer", example: 2 },
                  exercise_id: { type: "integer", example: 5 },
                  reps: { type: "integer", example: 10 },
                  weight: { type: "number", format: "decimal", example: 80.5 }
                }
              }
            }
          }
        },
        responses: {
          201: { description: "Répétition créée avec succès" },
          400: { description: "Erreur lors de la création" },
          403: { description: "Accès refusé (Token manquant ou invalide)" }
        }
      }
    },
    "/repetitions/edit/{id}": {
      put: {
        summary: "Modifier une répétition",
        tags: ["Repetitions"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  reps: { type: "integer", example: 12 },
                  weight: { type: "number", format: "decimal", example: 85.0 }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Répétition mise à jour avec succès" },
          400: { description: "Erreur lors de la mise à jour" },
          403: { description: "Accès refusé (Token manquant ou invalide)" },
          404: { description: "Répétition non trouvée" }
        }
      }
    },
    "/repetitions/delete/{id}": {
      delete: {
        summary: "Supprimer une répétition",
        tags: ["Repetitions"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" }
          }
        ],
        responses: {
          200: { description: "Répétition supprimée avec succès" },
          403: { description: "Accès refusé (Token manquant ou invalide)" },
          404: { description: "Répétition non trouvée" }
        }
      }
    },
    "/repetitions/by-session/{session_id}": {
      get: {
        summary: "Récupérer la liste des répétitions d'une session",
        tags: ["Repetitions"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "session_id",
            in: "path",
            required: true,
            schema: { type: "integer" }
          }
        ],
        responses: {
          200: { description: "Liste des répétitions récupérée" },
          403: { description: "Accès refusé (Token manquant ou invalide)" },
          404: { description: "Session non trouvée" }
        }
      }
    },
    "/repetitions/by-exercise/{exercise_id}": {
      get: {
        summary: "Récupérer la liste des répétitions d'un exercice",
        tags: ["Repetitions"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "exercise_id",
            in: "path",
            required: true,
            schema: { type: "integer" }
          }
        ],
        responses: {
          200: { description: "Liste des répétitions récupérée" },
          403: { description: "Accès refusé (Token manquant ou invalide)" },
          404: { description: "Exercice non trouvé" }
        }
      }
    }
  },
};

module.exports = swaggerDefinition;
