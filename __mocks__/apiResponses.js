export const mockApiResponses = {
  auth: {
    loginSuccess: {
      status: 200,
      data: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-token-data',
        user: {
          id: 1,
          email: 'test@example.com',
          role: 'user',
          first_name: 'Test',
          last_name: 'User',
          profile_picture_url: null,
          created_at: '2024-01-01T00:00:00.000Z'
        }
      }
    },
    loginCoachSuccess: {
      status: 200,
      data: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-coach-token',
        user: {
          id: 2,
          email: 'coach@example.com',
          role: 'coach',
          first_name: 'Coach',
          last_name: 'Test',
          profile_picture_url: null,
          created_at: '2024-01-01T00:00:00.000Z'
        }
      }
    },
    loginError: {
      response: {
        status: 401,
        data: { error: 'Credenciales incorrectas. Verifica tu email y contraseña.' }
      }
    },
    loginNotFound: {
      response: {
        status: 404,
        data: { error: 'Usuario no encontrado.' }
      }
    },
    profileData: {
      id: 1,
      email: 'test@example.com',
      role: 'user',
      first_name: 'Test',
      last_name: 'User',
      profile_picture_url: null
    }
  },
  routines: {
    list: [
      {
        id: 1,
        name: 'Rutina de Prueba',
        description: 'Descripción de rutina de prueba',
        difficulty: 'intermediate',
        duration: 45,
        exercises: [
          { 
            id: 1, 
            name: 'Push-ups', 
            sets: 3, 
            reps: 12, 
            rest_time: 60,
            video_url: 'https://example.com/video1'
          },
          { 
            id: 2, 
            name: 'Squats', 
            sets: 3, 
            reps: 15, 
            rest_time: 90,
            video_url: null
          }
        ],
        created_at: '2024-01-01T00:00:00.000Z'
      },
      {
        id: 2,
        name: 'Rutina Avanzada',
        description: 'Para usuarios experimentados',
        difficulty: 'advanced',
        duration: 60,
        exercises: [],
        created_at: '2024-01-02T00:00:00.000Z'
      }
    ],
    create: {
      id: 3,
      name: 'Nueva Rutina Test',
      description: 'Rutina creada en test',
      difficulty: 'beginner',
      duration: 30,
      exercises: []
    },
    update: {
      id: 1,
      name: 'Rutina Actualizada',
      description: 'Descripción actualizada',
      difficulty: 'intermediate',
      duration: 50
    }
  },
  workouts: {
    active: [
      {
        id: 1,
        routine_id: 1,
        routine_name: 'Rutina de Prueba',
        status: 'in_progress',
        started_at: '2024-01-01T10:00:00Z',
        completed_exercises: 1,
        total_exercises: 3
      }
    ],
    history: [
      {
        id: 1,
        routine_id: 1,
        routine_name: 'Rutina de Prueba',
        status: 'completed',
        started_at: '2024-01-01T09:00:00Z',
        finished_at: '2024-01-01T09:45:00Z',
        duration: 2700,
        exercises_completed: 3
      }
    ],
    start: {
      id: 2,
      routine_id: 1,
      status: 'in_progress',
      started_at: '2024-01-01T11:00:00Z'
    }
  },
  challenges: {
    list: [
      {
        id: 1,
        name: 'Desafío Push-ups',
        description: 'Completa 100 push-ups en una semana',
        exercise_name: 'Push-ups',
        target_value: 100,
        metric: 'reps',
        duration_days: 7,
        created_by: 'Coach Test',
        participants_count: 5,
        status: 'active'
      }
    ],
    leaderboard: [
      { user_name: 'Test User', progress: 85, position: 1 },
      { user_name: 'Another User', progress: 70, position: 2 }
    ]
  },
  userStats: {
    get: {
      id: 1,
      user_id: 1,
      weight: 70,
      height: 175,
      gender: 'Hombre',
      age: 25,
      activity_level: 'moderately_active',
      fitness_goal: 'weight_loss'
    },
    update: {
      id: 1,
      user_id: 1,
      weight: 72,
      height: 175,
      gender: 'Hombre',
      age: 25
    }
  },
  exercises: {
    list: [
      {
        id: 1,
        name: 'Push-ups',
        muscle_group: 'chest',
        equipment: 'bodyweight',
        video_url: 'https://example.com/pushups-video'
      },
      {
        id: 2,
        name: 'Squats',
        muscle_group: 'legs',
        equipment: 'bodyweight',
        video_url: null
      }
    ]
  },
  conversations: {
    list: [
      {
        id: 1,
        participant_name: 'Coach Test',
        last_message: 'Hola, ¿cómo va tu entrenamiento?',
        last_message_at: '2024-01-01T10:00:00Z',
        unread_count: 2
      }
    ]
  },
  messages: {
    list: [
      {
        id: 1,
        conversation_id: 1,
        sender_id: 2,
        sender_name: 'Coach Test',
        content: 'Hola, ¿cómo estás?',
        created_at: '2024-01-01T09:00:00Z',
        read: true
      },
      {
        id: 2,
        conversation_id: 1,
        sender_id: 1,
        sender_name: 'Test User',
        content: 'Muy bien, gracias!',
        created_at: '2024-01-01T09:01:00Z',
        read: true
      }
    ]
  },
  admin: {
    users: [
      {
        id: 1,
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        role: 'user',
        created_at: '2024-01-01T00:00:00.000Z'
      }
    ],
    coaches: [
      {
        id: 2,
        first_name: 'Coach',
        last_name: 'Test',
        email: 'coach@example.com',
        role: 'coach',
        created_at: '2024-01-01T00:00:00.000Z'
      }
    ]
  },
  errors: {
    networkError: new Error('Network request failed'),
    validationError: {
      response: {
        status: 422,
        data: { errors: ['Email ya está en uso', 'Contraseña muy corta'] }
      }
    },
    serverError: {
      response: {
        status: 500,
        data: { error: 'Error interno del servidor' }
      }
    },
    notFoundError: {
      response: {
        status: 404,
        data: { error: 'Recurso no encontrado' }
      }
    }
  }
};
