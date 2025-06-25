import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { AntDesign, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import workoutStatsService, { WorkoutStatsGeneral } from '../services/workoutStatsService';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import ScreenHeader from '../components/ScreenHeader';

// Para formatear el tiempo total
const formatTotalTime = (seconds: number): string => {
  if (!seconds) return '0h 0m';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  return `${hours}h ${minutes}m`;
};

type WorkoutStatsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "WorkoutStats">;
};

const WorkoutStatsScreen: React.FC<WorkoutStatsScreenProps> = ({ navigation }) => {
  const [stats, setStats] = useState<WorkoutStatsGeneral | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const data = await workoutStatsService.getGeneralStats();
      setStats(data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Cargando estadísticas...</Text>
      </View>
    );
  }

  // Si no hay estadísticas, mostrar mensaje
  if (!stats || (stats.totalWorkouts === 0)) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader
          title="Estadísticas de Entrenamiento"
          onBack={() => navigation.goBack()}
        />
        
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="weight-lifter" size={80} color="#cccccc" />
          <Text style={styles.emptyText}>Aún no tienes entrenamientos registrados</Text>
          <Text style={styles.emptySubText}>
            Completa tu primer entrenamiento para ver estadísticas
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="Estadísticas de Entrenamiento"
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Sección de estadísticas principales */}
        <View style={styles.statsMainContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalWorkouts}</Text>
            <Text style={styles.statLabel}>Total Workouts</Text>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="calendar-check" size={24} color="#0066cc" />
            </View>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{formatTotalTime(stats.totalTime)}</Text>
            <Text style={styles.statLabel}>Tiempo Total</Text>
            <View style={styles.iconContainer}>
              <AntDesign name="clockcircle" size={22} color="#0066cc" />
            </View>
          </View>
        </View>

        <View style={styles.statsMainContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.completedWorkouts}</Text>
            <Text style={styles.statLabel}>Completados</Text>
            <View style={styles.iconContainer}>
              <AntDesign name="checkcircle" size={22} color="#4CAF50" />
            </View>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.avgWorkoutsPerWeek}</Text>
            <Text style={styles.statLabel}>Por Semana</Text>
            <View style={styles.iconContainer}>
              <FontAwesome5 name="dumbbell" size={20} color="#FF9800" />
            </View>
          </View>
        </View>

        {/* Sección de rachas */}
        <Text style={styles.sectionTitle}>Rachas</Text>
        <View style={styles.streakContainer}>
          <View style={styles.streakCard}>
            <MaterialCommunityIcons 
              name="fire" 
              size={28} 
              color={stats.currentStreak > 0 ? "#FF5722" : "#cccccc"} 
              style={styles.streakIcon} 
            />
            <View>
              <Text style={styles.streakValue}>{stats.currentStreak}</Text>
              <Text style={styles.streakLabel}>Racha Actual</Text>
            </View>
          </View>
          
          <View style={styles.streakCard}>
            <MaterialCommunityIcons 
              name="trophy" 
              size={28} 
              color={stats.bestStreak > 0 ? "#FFC107" : "#cccccc"} 
              style={styles.streakIcon} 
            />
            <View>
              <Text style={styles.streakValue}>{stats.bestStreak}</Text>
              <Text style={styles.streakLabel}>Mejor Racha</Text>
            </View>
          </View>
        </View>

        {/* Sección de motivación */}
        <View style={styles.motivationContainer}>
          <Text style={styles.motivationText}>
            {getMotivationalMessage(stats)}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Función para mensajes motivacionales basados en las estadísticas
const getMotivationalMessage = (stats: WorkoutStatsGeneral): string => {
  if (stats.currentStreak >= 3) {
    return `¡Impresionante! Llevas ${stats.currentStreak} días seguidos. ¡Mantén el ritmo!`;
  } else if (stats.completedWorkouts > 10) {
    return `Has completado ${stats.completedWorkouts} entrenamientos. ¡Tu constancia está dando resultados!`;
  } else if (stats.totalWorkouts > 0) {
    return '¡Buen trabajo! Cada entrenamiento te acerca más a tus objetivos.';
  }
  return '¡Comienza tu viaje fitness hoy!';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  statsMainContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    position: 'relative',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  iconContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  streakContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  streakCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakIcon: {
    marginRight: 12,
  },
  streakValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  streakLabel: {
    fontSize: 14,
    color: '#666',
  },
  motivationContainer: {
    backgroundColor: '#e3f2fd',
    borderRadius: 10,
    padding: 16,
    marginTop: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  motivationText: {
    fontSize: 16,
    color: '#0066cc',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
    textAlign: 'center',
  },

});

export default WorkoutStatsScreen;
