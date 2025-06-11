import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList, User } from "../types";
import authService from "../services/authService";
import useCustomAlert from "../components/useCustomAlert";

type BasicProfileScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "BasicProfile">;
};

const BasicProfileScreen: React.FC<BasicProfileScreenProps> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Form fields
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  
  // Password change fields
  const [showPasswordFields, setShowPasswordFields] = useState<boolean>(false);
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  
  const { showAlert, AlertComponent } = useCustomAlert();

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        setFirstName(user.first_name || "");
        setLastName(user.last_name || "");
        setEmail(user.email || "");
      } else {
        showAlert({
          title: "Error",
          message: "No se pudo cargar la información del usuario.",
          primaryButtonText: "Aceptar"
        });
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
      showAlert({
        title: "Error",
        message: "Ocurrió un error al cargar tu información.",
        primaryButtonText: "Aceptar"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordChange = (): void => {
    setShowPasswordFields(!showPasswordFields);
    // Reset password fields when toggling
    if (!showPasswordFields) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const validateForm = (): boolean => {
    // Basic validation for user info
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      showAlert({
        title: "Error de validación",
        message: "Nombre, apellido y correo son campos requeridos.",
        primaryButtonText: "Entendido"
      });
      return false;
    }

    // Email validation
    const emailRegex = /^[\w+\-.]+@[a-z\d\-]+(\.[a-z\d\-]+)*\.[a-z]+$/i;
    if (!emailRegex.test(email)) {
      showAlert({
        title: "Error de validación",
        message: "El formato del correo electrónico es inválido.",
        primaryButtonText: "Entendido"
      });
      return false;
    }

    // Password validation if changing password
    if (showPasswordFields) {
      if (!currentPassword) {
        showAlert({
          title: "Error de validación",
          message: "Debe ingresar su contraseña actual.",
          primaryButtonText: "Entendido"
        });
        return false;
      }

      if (!newPassword || newPassword.length < 6) {
        showAlert({
          title: "Error de validación",
          message: "La nueva contraseña debe tener al menos 6 caracteres.",
          primaryButtonText: "Entendido"
        });
        return false;
      }

      if (newPassword !== confirmPassword) {
        showAlert({
          title: "Error de validación",
          message: "La confirmación de contraseña no coincide con la nueva contraseña.",
          primaryButtonText: "Entendido"
        });
        return false;
      }
    }

    return true;
  };

  const handleSaveProfile = async (): Promise<void> => {
    if (!validateForm()) return;

    setIsSaving(true);

    try {
      // In a real implementation, you would call the API here to update the user's profile
      // For now, we'll just simulate the API call with a delay
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
        };
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update password if needed
        if (showPasswordFields) {
          // This is where you would call the API to update the password
          // authService.updatePassword(currentPassword, newPassword);
          showAlert({
            title: "Contraseña actualizada",
            message: "La contraseña ha sido actualizada correctamente.",
            primaryButtonText: "Aceptar"
          });
          setShowPasswordFields(false);
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        }
        
        setCurrentUser(updatedUser);
        setIsEditing(false);
        
        showAlert({
          title: "¡Actualizado!",
          message: "Tu información personal ha sido actualizada correctamente.",
          primaryButtonText: "Aceptar"
        });
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      showAlert({
        title: "Error",
        message: "No se pudo actualizar tu información. Inténtalo más tarde.",
        primaryButtonText: "Aceptar"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text className="mt-4 text-gray-600 font-medium">Cargando perfil...</Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#f3f4f6" />
      <SafeAreaView className="flex-1 bg-gray-100" style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
        <View className="flex-1">
          {/* Header */}
          <View className="flex-row justify-between items-center p-4 bg-white border-b border-gray-200">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text className="text-indigo-600 font-semibold">← Volver</Text>
            </TouchableOpacity>
            
            {!isEditing && (
              <TouchableOpacity 
                className="bg-indigo-600 rounded-lg py-2 px-4 shadow-sm"
                onPress={() => setIsEditing(true)}
              >
                <Text className="text-white text-center font-medium">
                  Editar Perfil
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView className="flex-1 p-4">
            <Text className="text-2xl font-bold text-indigo-900 mb-6">Información Personal</Text>

            {/* Basic Information Card */}
            <View className="bg-white rounded-xl shadow-sm p-5 mb-5">
              <Text className="text-lg font-semibold text-gray-800 mb-4">Datos Básicos</Text>
              
              {!isEditing ? (
                <View>
                  <View className="mb-4">
                    <Text className="text-gray-600 mb-1">Nombre</Text>
                    <Text className="text-gray-800 font-medium">{currentUser?.first_name || ""}</Text>
                  </View>
                  <View className="mb-4">
                    <Text className="text-gray-600 mb-1">Apellido</Text>
                    <Text className="text-gray-800 font-medium">{currentUser?.last_name || ""}</Text>
                  </View>
                  <View className="mb-4">
                    <Text className="text-gray-600 mb-1">Correo Electrónico</Text>
                    <Text className="text-gray-800 font-medium">{currentUser?.email || ""}</Text>
                  </View>
                </View>
              ) : (
                <View>
                  <View className="mb-4">
                    <Text className="text-gray-600 mb-1">Nombre *</Text>
                    <TextInput
                      className="bg-gray-50 border border-gray-300 rounded-md p-2.5 text-gray-700"
                      value={firstName}
                      onChangeText={setFirstName}
                      placeholder="Nombre"
                    />
                  </View>
                  <View className="mb-4">
                    <Text className="text-gray-600 mb-1">Apellido *</Text>
                    <TextInput
                      className="bg-gray-50 border border-gray-300 rounded-md p-2.5 text-gray-700"
                      value={lastName}
                      onChangeText={setLastName}
                      placeholder="Apellido"
                    />
                  </View>
                  <View className="mb-4">
                    <Text className="text-gray-600 mb-1">Correo Electrónico *</Text>
                    <TextInput
                      className="bg-gray-50 border border-gray-300 rounded-md p-2.5 text-gray-700"
                      value={email}
                      onChangeText={setEmail}
                      placeholder="correo@ejemplo.com"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>
              )}
            </View>
            
            {/* Password Change - only displayed during edit mode */}
            {isEditing && (
              <View className="bg-white rounded-xl shadow-sm p-5 mb-5">
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-lg font-semibold text-gray-800">Cambiar Contraseña</Text>
                  <TouchableOpacity 
                    onPress={togglePasswordChange}
                    className="bg-gray-200 py-1 px-3 rounded-lg"
                  >
                    <Text className="text-gray-700">
                      {showPasswordFields ? "Cancelar" : "Cambiar"}
                    </Text>
                  </TouchableOpacity>
                </View>
                
                {showPasswordFields && (
                  <View>
                    <View className="mb-4">
                      <Text className="text-gray-600 mb-1">Contraseña Actual *</Text>
                      <TextInput
                        className="bg-gray-50 border border-gray-300 rounded-md p-2.5 text-gray-700"
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        placeholder="Contraseña actual"
                        secureTextEntry={true}
                      />
                    </View>
                    <View className="mb-4">
                      <Text className="text-gray-600 mb-1">Nueva Contraseña *</Text>
                      <TextInput
                        className="bg-gray-50 border border-gray-300 rounded-md p-2.5 text-gray-700"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        placeholder="Nueva contraseña"
                        secureTextEntry={true}
                      />
                    </View>
                    <View className="mb-4">
                      <Text className="text-gray-600 mb-1">Confirmar Contraseña *</Text>
                      <TextInput
                        className="bg-gray-50 border border-gray-300 rounded-md p-2.5 text-gray-700"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="Confirmar nueva contraseña"
                        secureTextEntry={true}
                      />
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Logout Button - Only displayed when not in editing mode */}
            {!isEditing && (
              <TouchableOpacity
                className="bg-red-100 rounded-xl shadow-sm p-4 mb-5"
                onPress={async () => {
                  showAlert({
                    title: "Cerrar Sesión",
                    message: "¿Estás seguro de que deseas cerrar la sesión?",
                    buttons: [
                      {
                        text: "Cancelar",
                        style: "cancel",
                      },
                      {
                        text: "Cerrar Sesión",
                        onPress: async () => {
                          await authService.logout();
                          navigation.reset({
                            index: 0,
                            routes: [{ name: "Login" }],
                          });
                        },
                      },
                    ],
                  });
                }}
              >
                <Text className="text-center text-red-600 font-semibold">
                  Cerrar Sesión
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
          
          {/* Fixed buttons at the bottom when in edit mode */}
          {isEditing && (
            <View className="p-4 bg-white border-t border-gray-200 shadow-lg">
              <View className="flex-row justify-between">
                <TouchableOpacity 
                  className="bg-gray-300 py-3 px-6 rounded-lg flex-1 mr-2"
                  onPress={() => {
                    setIsEditing(false);
                    loadUserProfile(); // Reset to original values
                    setShowPasswordFields(false);
                  }}
                >
                  <Text className="text-gray-700 text-center font-semibold">Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-indigo-600 rounded-lg py-3 px-6 shadow-sm flex-1 ml-2"
                  onPress={handleSaveProfile}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text className="text-white text-center font-medium">
                      Guardar
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
      <AlertComponent />
    </>
  );
};

export default BasicProfileScreen;
