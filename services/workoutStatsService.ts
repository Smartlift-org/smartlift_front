import { format, parseISO, startOfWeek, differenceInDays } from 'date-fns';
import routineService, { WorkoutSession } from './routineService';

export interface WorkoutStatsGeneral {
  totalWorkouts: number;
  totalTime: number; // en segundos
  completedWorkouts: number;
  avgWorkoutsPerWeek: number;
  currentStreak: number;
  bestStreak: number;
}

/**
 * Servicio para procesar y calcular estadísticas de workouts
 */
const workoutStatsService = {
  /**
   * Obtiene las estadísticas generales de entrenamientos
   */
  getGeneralStats: async (): Promise<WorkoutStatsGeneral> => {
    try {
      // Obtener todos los workouts del usuario
      const workouts = await routineService.getWorkouts();
      
      // Si no hay workouts, devolver estadísticas en cero
      if (!workouts || workouts.length === 0) {
        return {
          totalWorkouts: 0,
          totalTime: 0,
          completedWorkouts: 0,
          avgWorkoutsPerWeek: 0,
          currentStreak: 0,
          bestStreak: 0
        };
      }

      // Ordenar workouts por fecha (más reciente primero)
      const sortedWorkouts = [...workouts].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      // Filtrar solo los completados
      const completedWorkouts = sortedWorkouts.filter(w => w.status === 'completed');
      
      // Calcular tiempo total de entrenamiento (en segundos)
      const totalTime = completedWorkouts.reduce((total, w) => 
        total + (w.effective_duration || 0), 0
      );
      
      // Calcular promedio de workouts por semana
      const avgWorkoutsPerWeek = calculateAvgWorkoutsPerWeek(completedWorkouts);
      
      // Calcular rachas (streaks)
      const { currentStreak, bestStreak } = calculateStreaks(completedWorkouts);
      
      return {
        totalWorkouts: workouts.length,
        totalTime,
        completedWorkouts: completedWorkouts.length,
        avgWorkoutsPerWeek,
        currentStreak,
        bestStreak
      };
    } catch (error) {
      console.error("Error obteniendo estadísticas generales:", error);
      throw error;
    }
  },
};

/**
 * Calcula el promedio de entrenamientos por semana
 */
function calculateAvgWorkoutsPerWeek(workouts: WorkoutSession[]): number {
  if (workouts.length <= 1) return workouts.length;
  
  // Obtener fecha más antigua y más reciente
  const dates = workouts.map(w => new Date(w.date).getTime());
  const oldestDate = new Date(Math.min(...dates));
  const newestDate = new Date(Math.max(...dates));
  
  // Calcular número de semanas (si es menos de una semana, considerar como 1)
  const weeks = Math.max(1, differenceInDays(newestDate, oldestDate) / 7);
  
  return parseFloat((workouts.length / weeks).toFixed(1));
}

/**
 * Calcula las rachas (streaks) actuales y las mejores
 */
function calculateStreaks(workouts: WorkoutSession[]): { currentStreak: number, bestStreak: number } {
  if (workouts.length === 0) return { currentStreak: 0, bestStreak: 0 };
  
  // Convertir fechas a strings en formato YYYY-MM-DD para comparación
  const workoutDates = workouts.map(w => format(parseISO(w.date), 'yyyy-MM-dd'));
  
  // Eliminar duplicados (múltiples entrenamientos en el mismo día)
  const uniqueDates = [...new Set(workoutDates)].sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );
  
  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;
  
  // Obtener la fecha actual en formato YYYY-MM-DD
  const today = format(new Date(), 'yyyy-MM-dd');
  
  // Verificar si el entrenamiento más reciente es de hoy o ayer
  const mostRecentDate = uniqueDates[0];
  const daysSinceLastWorkout = differenceInDays(
    parseISO(today),
    parseISO(mostRecentDate)
  );
  
  // Si el último entrenamiento fue hace más de un día, la racha actual es 0
  if (daysSinceLastWorkout > 1) {
    currentStreak = 0;
  } else {
    // Calcular la racha actual
    let checkDate = daysSinceLastWorkout === 0 ? today : mostRecentDate;
    
    for (let i = 0; i < uniqueDates.length; i++) {
      const currentDate = uniqueDates[i];
      const prevDate = i > 0 ? uniqueDates[i - 1] : null;
      
      if (format(parseISO(currentDate), 'yyyy-MM-dd') === format(parseISO(checkDate), 'yyyy-MM-dd')) {
        tempStreak++;
        
        // Restar un día para el siguiente ciclo
        checkDate = format(
          new Date(parseISO(checkDate).getTime() - 86400000),
          'yyyy-MM-dd'
        );
      } else {
        break;
      }
    }
    
    currentStreak = tempStreak;
  }
  
  // Calcular la mejor racha
  tempStreak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const currentDate = parseISO(uniqueDates[i]);
    const prevDate = parseISO(uniqueDates[i - 1]);
    
    // Si la diferencia es de un día, continúa la racha
    if (differenceInDays(prevDate, currentDate) === 1) {
      tempStreak++;
    } else {
      // Reiniciar la racha
      tempStreak = 1;
    }
    
    // Actualizar la mejor racha si la actual es mayor
    bestStreak = Math.max(bestStreak, tempStreak);
  }
  
  // Si solo hay un entrenamiento, la mejor racha es 1
  bestStreak = Math.max(bestStreak, 1);
  
  return { currentStreak, bestStreak };
}

export default workoutStatsService;
