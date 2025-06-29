import { format, parseISO, startOfWeek, differenceInDays } from "date-fns";
import routineService, { WorkoutSession } from "./routineService";

export interface WorkoutStatsGeneral {
  totalWorkouts: number;
  totalTime: number;
  completedWorkouts: number;
  avgWorkoutsPerWeek: number;
  currentStreak: number;
  bestStreak: number;
}

const workoutStatsService = {
  getGeneralStats: async (): Promise<WorkoutStatsGeneral> => {
    try {
      const workouts = await routineService.getWorkouts();

      if (!workouts || workouts.length === 0) {
        return {
          totalWorkouts: 0,
          totalTime: 0,
          completedWorkouts: 0,
          avgWorkoutsPerWeek: 0,
          currentStreak: 0,
          bestStreak: 0,
        };
      }

      const sortedWorkouts = [...workouts].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      const completedWorkouts = sortedWorkouts.filter(
        (w) => w.status === "completed"
      );

      const totalTime = completedWorkouts.reduce(
        (total, w) => total + (w.effective_duration || 0),
        0
      );

      const avgWorkoutsPerWeek = calculateAvgWorkoutsPerWeek(completedWorkouts);
      const { currentStreak, bestStreak } = calculateStreaks(completedWorkouts);

      return {
        totalWorkouts: workouts.length,
        totalTime,
        completedWorkouts: completedWorkouts.length,
        avgWorkoutsPerWeek,
        currentStreak,
        bestStreak,
      };
    } catch (error) {
      throw error;
    }
  },
};

function calculateAvgWorkoutsPerWeek(workouts: WorkoutSession[]): number {
  if (workouts.length <= 1) return workouts.length;

  const dates = workouts.map((w) => new Date(w.date).getTime());
  const oldestDate = new Date(Math.min(...dates));
  const newestDate = new Date(Math.max(...dates));

  const weeks = Math.max(1, differenceInDays(newestDate, oldestDate) / 7);

  return parseFloat((workouts.length / weeks).toFixed(1));
}

function calculateStreaks(workouts: WorkoutSession[]): {
  currentStreak: number;
  bestStreak: number;
} {
  if (workouts.length === 0) return { currentStreak: 0, bestStreak: 0 };

  const workoutDates = workouts.map((w) =>
    format(parseISO(w.date), "yyyy-MM-dd")
  );

  const uniqueDates = [...new Set(workoutDates)].sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;

  const today = format(new Date(), "yyyy-MM-dd");

  const mostRecentDate = uniqueDates[0];
  const daysSinceLastWorkout = differenceInDays(
    parseISO(today),
    parseISO(mostRecentDate)
  );

  if (daysSinceLastWorkout > 1) {
    currentStreak = 0;
  } else {
    let checkDate = daysSinceLastWorkout === 0 ? today : mostRecentDate;

    for (let i = 0; i < uniqueDates.length; i++) {
      const currentDate = uniqueDates[i];
      const prevDate = i > 0 ? uniqueDates[i - 1] : null;

      if (
        format(parseISO(currentDate), "yyyy-MM-dd") ===
        format(parseISO(checkDate), "yyyy-MM-dd")
      ) {
        tempStreak++;

        checkDate = format(
          new Date(parseISO(checkDate).getTime() - 86400000),
          "yyyy-MM-dd"
        );
      } else {
        break;
      }
    }
    currentStreak = tempStreak;
  }

  tempStreak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const currentDate = parseISO(uniqueDates[i]);
    const prevDate = parseISO(uniqueDates[i - 1]);

    if (differenceInDays(prevDate, currentDate) === 1) {
      tempStreak++;
    } else {
      tempStreak = 1;
    }

    bestStreak = Math.max(bestStreak, tempStreak);
  }

  bestStreak = Math.max(bestStreak, 1);

  return { currentStreak, bestStreak };
}

export default workoutStatsService;
