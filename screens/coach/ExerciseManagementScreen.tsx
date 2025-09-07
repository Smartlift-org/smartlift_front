import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../types";
import { Exercise } from "../../types/exercise";
import exerciseService from "../../services/exerciseService";
import VideoUrlEditor from "../../components/VideoUrlEditor";
import ScreenHeader from "../../components/ScreenHeader";
import { useLoadingState } from "../../hooks/useLoadingState";

type ExerciseManagementScreenProps = {
  navigation: NativeStackNavigationProp<
    RootStackParamList,
    "ExerciseManagement"
  >;
  route: RouteProp<RootStackParamList, "ExerciseManagement">;
};

const ExerciseManagementScreen: React.FC<ExerciseManagementScreenProps> = ({
  navigation,
}) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );
  const [isEditorVisible, setIsEditorVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { isLoading, withLoading } = useLoadingState(true);

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    filterExercises();
  }, [exercises, searchQuery]);

  const loadExercises = async () => {
    await withLoading(async () => {
      try {
        const data = await exerciseService.getExercises();
        setExercises(data);
      } catch (error: any) {
        Alert.alert("Error", error.message || "Error al cargar ejercicios");
      }
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const data = await exerciseService.getExercises();
      setExercises(data);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Error al cargar ejercicios");
    } finally {
      setIsRefreshing(false);
    }
  };

  const filterExercises = () => {
    if (!searchQuery.trim()) {
      setFilteredExercises(exercises);
      return;
    }

    const filtered = exercises.filter(
      (exercise) =>
        exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exercise.primary_muscles.some((muscle) =>
          muscle.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );
    setFilteredExercises(filtered);
  };

  const handleEditVideo = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setIsEditorVisible(true);
  };

  const handleVideoUpdate = (updatedExercise: Exercise) => {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === updatedExercise.id ? updatedExercise : ex))
    );
    setIsEditorVisible(false);
    setSelectedExercise(null);
  };

  const handleCancelEdit = () => {
    setIsEditorVisible(false);
    setSelectedExercise(null);
  };

  const renderExerciseItem = ({ item }: { item: Exercise }) => (
    <View className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-200">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1 mr-3">
          <Text className="text-lg font-semibold text-gray-800 mb-1">
            {item.name}
          </Text>
          <Text className="text-sm text-gray-600 mb-2">
            {item.primary_muscles.join(", ")}
          </Text>
          <View className="flex-row items-center">
            <View
              className={`px-2 py-1 rounded-full ${
                item.level === "beginner"
                  ? "bg-green-100"
                  : item.level === "intermediate"
                  ? "bg-yellow-100"
                  : "bg-red-100"
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  item.level === "beginner"
                    ? "text-green-800"
                    : item.level === "intermediate"
                    ? "text-yellow-800"
                    : "text-red-800"
                }`}
              >
                {item.level === "beginner"
                  ? "Principiante"
                  : item.level === "intermediate"
                  ? "Intermedio"
                  : "Experto"}
              </Text>
            </View>
            {item.video_url && (
              <View className="ml-2 flex-row items-center">
                <Ionicons name="videocam" size={16} color="#3B82F6" />
                <Text className="text-xs text-blue-600 ml-1">Video</Text>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity
          onPress={() => handleEditVideo(item)}
          className="bg-blue-500 px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-medium text-sm">
            {item.video_url ? "Editar Video" : "Agregar Video"}
          </Text>
        </TouchableOpacity>
      </View>

      {item.video_url && (
        <View className="mt-2 p-2 bg-blue-50 rounded border-l-4 border-blue-500">
          <Text className="text-xs text-blue-700 font-medium mb-1">
            URL del Video:
          </Text>
          <Text className="text-xs text-blue-600" numberOfLines={1}>
            {item.video_url}
          </Text>
        </View>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-2 text-gray-600">Cargando ejercicios...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScreenHeader
        title="Gestión de Ejercicios"
        onBack={() => navigation.goBack()}
      />

      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            className="flex-1 ml-2 text-gray-800"
            placeholder="Buscar ejercicios..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#6B7280" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row justify-between">
          <View className="items-center">
            <Text className="text-2xl font-bold text-blue-600">
              {filteredExercises.length}
            </Text>
            <Text className="text-xs text-gray-600">Total</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-green-600">
              {filteredExercises.filter((ex) => ex.video_url).length}
            </Text>
            <Text className="text-xs text-gray-600">Con Video</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-orange-600">
              {filteredExercises.filter((ex) => !ex.video_url).length}
            </Text>
            <Text className="text-xs text-gray-600">Sin Video</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={filteredExercises}
        renderItem={renderExerciseItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={["#3B82F6"]}
          />
        }
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-12">
            <Ionicons name="fitness" size={64} color="#D1D5DB" />
            <Text className="text-gray-500 text-lg font-medium mt-4">
              {searchQuery
                ? "No se encontraron ejercicios"
                : "No hay ejercicios"}
            </Text>
            <Text className="text-gray-400 text-center mt-2">
              {searchQuery
                ? "Intenta con otros términos de búsqueda"
                : "Los ejercicios aparecerán aquí"}
            </Text>
          </View>
        }
      />

      <Modal
        visible={isEditorVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelEdit}
      >
        {selectedExercise && (
          <VideoUrlEditor
            exercise={selectedExercise}
            onUpdate={handleVideoUpdate}
            onCancel={handleCancelEdit}
            isVisible={isEditorVisible}
          />
        )}
      </Modal>
    </SafeAreaView>
  );
};

export default ExerciseManagementScreen;
