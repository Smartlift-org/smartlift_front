import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { AntDesign, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenHeader from '../components/ScreenHeader';
import workoutService from '../services/workoutService';
import { Workout } from '../types/workout';

// Formato para las fechas
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

// Formato para el tiempo de entrenamiento en hh:mm
const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes} min`;
  }
};

type WorkoutHistoryScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "WorkoutHistory">;
};

const WorkoutHistoryScreen: React.FC<WorkoutHistoryScreenProps> = ({ navigation }) => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWorkouts = async () => {
    try {
      const data = await workoutService.getWorkouts();
      // Ordenar por fecha, más recientes primero
      const completedWorkouts = data
        .filter(workout => workout.status === 'completed')
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setWorkouts(completedWorkouts);
    } catch (error) {
      console.error('Error al cargar entrenamientos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchWorkouts();
  };

  const renderWorkoutItem = ({ item }: { item: Workout }): React.ReactElement => (
    <TouchableOpacity
      style={styles.workoutCard}
      onPress={() => navigation.navigate('WorkoutTracker', { 
        routineId: item.routine_id, 
        viewMode: true
      })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.workoutName}>{item.routine?.name || 'Entrenamiento'}</Text>
        <Text style={styles.workoutDate}>{formatDate(item.created_at)}</Text>
      </View>

      <View style={styles.workoutDetails}>
        <View style={styles.detailItem}>
          <FontAwesome5 name="clock" size={16} color="#0066CC" style={styles.detailIcon} />
          <Text style={styles.detailText}>
            {formatDuration(item.routine?.duration || 0)}
          </Text>
        </View>
        
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="weight-lifter" size={18} color="#0066CC" style={styles.detailIcon} />
          <Text style={styles.detailText}>
            {item.completed_exercises || 0}/{item.routine?.exercises?.length || 0} ejercicios
          </Text>
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <Text style={styles.viewDetailsText}>
          Ver detalles <AntDesign name="right" size={12} color="#0066CC" />
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Cargando historial...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="Historial de Entrenamientos"
        onBack={() => navigation.goBack()}
      />

      {workouts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="history" size={80} color="#cccccc" />
          <Text style={styles.emptyText}>No tienes entrenamientos completados</Text>
          <Text style={styles.emptySubText}>
            Completa tu primer entrenamiento para verlo aquí
          </Text>
        </View>
      ) : (
        <FlatList
          data={workouts}
          renderItem={renderWorkoutItem}
          keyExtractor={item => `workout-${item.id}`}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  workoutCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  workoutDate: {
    fontSize: 14,
    color: '#666',
  },
  workoutDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    marginRight: 6,
  },
  detailText: {
    fontSize: 15,
    color: '#555',
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
    alignItems: 'flex-end',
  },
  viewDetailsText: {
    color: '#0066CC',
    fontSize: 14,
    fontWeight: '500',
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

export default WorkoutHistoryScreen;
