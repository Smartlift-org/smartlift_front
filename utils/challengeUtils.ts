export const formatTimeRemaining = (endDate: string): string => {
  const now = new Date();
  const end = new Date(endDate);
  const timeDiff = end.getTime() - now.getTime();

  if (timeDiff <= 0) return "Expirado";

  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );

  if (days > 0) return `${days}d ${hours}h restantes`;
  return `${hours}h restantes`;
};

export const getAttemptStatusColor = (status: string): string => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800";
    case "in_progress":
      return "bg-blue-100 text-blue-800";
    case "abandoned":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getAttemptStatusText = (status: string): string => {
  switch (status) {
    case "completed":
      return "Completado";
    case "in_progress":
      return "En Progreso";
    case "abandoned":
      return "Abandonado";
    default:
      return status;
  }
};

export const getAttemptStatusEmoji = (status: string): string => {
  switch (status) {
    case "completed":
      return "✅";
    case "in_progress":
      return "⏳";
    case "abandoned":
      return "❌";
    default:
      return "❓";
  }
};

export const getChallengeCardStatusColor = (
  endDate: string,
  isActiveNow: boolean
): string => {
  const timeRemaining = formatTimeRemaining(endDate);
  if (timeRemaining === "Expirado") return "bg-red-100 border-red-200";
  if (isActiveNow) return "bg-green-100 border-green-200";
  return "bg-gray-100 border-gray-200";
};

export const getMedalEmoji = (position: number): string => {
  switch (position) {
    case 1:
      return "🥇";
    case 2:
      return "🥈";
    case 3:
      return "🥉";
    default:
      return "🏃";
  }
};

export const getPositionColor = (position: number): string => {
  switch (position) {
    case 1:
      return "text-yellow-600";
    case 2:
      return "text-gray-500";
    case 3:
      return "text-orange-600";
    default:
      return "text-gray-700";
  }
};

export const formatChallengeDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatTime = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

export const calculateCompletionRate = (
  completedAttempts: number,
  totalAttempts: number
): number => {
  const completed = completedAttempts || 0;
  const total = totalAttempts || 0;

  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

export const getDifficultyColor = (level: number): string => {
  const colors = [
    "bg-green-500",
    "bg-green-400",
    "bg-yellow-500",
    "bg-orange-500",
    "bg-red-500",
  ];
  return colors[level - 1] || colors[0];
};

export const getDifficultyText = (level: number): string => {
  const difficulties = [
    "Muy Fácil",
    "Fácil",
    "Moderado",
    "Difícil",
    "Muy Difícil",
  ];
  return difficulties[level - 1] || difficulties[0];
};

export const formatSecondsToMinutesSeconds = (
  seconds: number | null | undefined
): string => {
  if (!seconds || seconds <= 0) return "--:--";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
};
