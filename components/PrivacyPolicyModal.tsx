import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";

interface PrivacyPolicyModalProps {
  visible: boolean;
  onClose: () => void;
}

const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  visible,
  onClose,
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 justify-center items-center bg-black/50">
        <View className="w-[90%] h-[90%] bg-white rounded-3xl overflow-hidden shadow-lg flex flex-col">
          <View className="p-5 border-b border-gray-200">
            <Text className="text-2xl font-bold text-center text-gray-800">
              Política de Privacidad
            </Text>
            <Text className="text-sm text-center text-gray-500 mt-1">
              Última actualización: 28/05/2025
            </Text>
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={true}>
            <View className="p-5">
              <View className="mb-5">
                <Text className="text-lg font-bold text-gray-800 mb-2.5">
                  1. Introducción
                </Text>
                <Text className="text-sm leading-[22px] text-gray-700">
                  Bienvenido a nuestra aplicación de seguimiento y comunidad
                  deportiva. Esta Política de Privacidad explica cómo
                  recopilamos, utilizamos, divulgamos y protegemos su
                  información personal cuando utiliza nuestra aplicación.
                </Text>
              </View>

              <View className="mb-5">
                <Text className="text-lg font-bold text-gray-800 mb-2.5">
                  2. Información que Recopilamos
                </Text>
                <Text className="text-base font-semibold text-gray-800 mt-2.5 mb-1.5">
                  2.1 Información de Registro
                </Text>
                <Text className="text-sm leading-[22px] text-gray-700">
                  • Dirección de correo electrónico{"\n"}• Contraseña
                  (almacenada de forma segura y encriptada){"\n"}• Tipo de
                  cuenta (Socio o Entrenador)
                </Text>

                <Text className="text-base font-semibold text-gray-800 mt-2.5 mb-1.5">
                  2.2 Información del Perfil
                </Text>
                <Text className="text-sm leading-[22px] text-gray-700">
                  • Nombre visible (opcional){"\n"}• Objetivos de entrenamiento
                  {"\n"}• Nivel de experiencia{"\n"}• Días disponibles para
                  entrenamiento{"\n"}• Equipamiento disponible{"\n"}•
                  Información adicional que decida compartir
                </Text>

                <Text className="text-base font-semibold text-gray-800 mt-2.5 mb-1.5">
                  2.3 Datos de Actividad Física
                </Text>
                <Text className="text-sm leading-[22px] text-gray-700">
                  • Rutinas de entrenamiento{"\n"}• Registro de progreso (pesos,
                  repeticiones, tiempo, distancia){"\n"}• Estadísticas de
                  entrenamiento{"\n"}• Historial de sesiones completadas
                </Text>

                <Text className="text-base font-semibold text-gray-800 mt-2.5 mb-1.5">
                  2.4 Datos de Uso
                </Text>
                <Text className="text-sm leading-[22px] text-gray-700">
                  • Interacciones con la aplicación{"\n"}• Preferencias de
                  configuración{"\n"}• Datos de rendimiento de la aplicación
                  {"\n"}• Información del dispositivo
                </Text>
              </View>

              <View className="mb-5">
                <Text className="text-lg font-bold text-gray-800 mb-2.5">
                  3. Uso de la Información
                </Text>
                <Text className="text-sm leading-[22px] text-gray-700">
                  Utilizamos su información para:{"\n\n"}• Proporcionar y
                  mantener nuestros servicios{"\n"}• Personalizar su experiencia
                  de entrenamiento{"\n"}• Generar rutinas de entrenamiento
                  adaptadas a sus objetivos{"\n"}• Mostrar su progreso y
                  estadísticas{"\n"}• Facilitar la comunicación entre socios y
                  entrenadores{"\n"}• Mejorar nuestros servicios{"\n"}• Enviar
                  notificaciones relevantes
                </Text>
              </View>

              <View className="mb-5">
                <Text className="text-lg font-bold text-gray-800 mb-2.5">
                  4. Compartir Información
                </Text>
                <Text className="text-base font-semibold text-gray-800 mt-2.5 mb-1.5">
                  4.1 Compartir con Entrenadores
                </Text>
                <Text className="text-sm leading-[22px] text-gray-700">
                  • Los entrenadores asignados pueden ver su perfil, rutinas y
                  progreso{"\n"}• Pueden acceder a sus estadísticas y datos de
                  entrenamiento
                </Text>

                <Text className="text-base font-semibold text-gray-800 mt-2.5 mb-1.5">
                  4.2 Compartir en la Comunidad
                </Text>
                <Text className="text-sm leading-[22px] text-gray-700">
                  • Las publicaciones en el feed social pueden incluir
                  información sobre su progreso (sujeto a su configuración de
                  privacidad){"\n"}• Participación en desafíos y rankings
                  (configurable)
                </Text>

                <Text className="text-base font-semibold text-gray-800 mt-2.5 mb-1.5">
                  4.3 Proveedores de Servicios
                </Text>
                <Text className="text-sm leading-[22px] text-gray-700">
                  Utilizamos servicios de terceros para:{"\n"}• Almacenamiento
                  de datos{"\n"}• Análisis de uso{"\n"}• Generación de rutinas
                  por IA{"\n"}• Alojamiento de videos
                </Text>
              </View>

              <View className="mb-5">
                <Text className="text-lg font-bold text-gray-800 mb-2.5">
                  5. Seguridad de Datos
                </Text>
                <Text className="text-sm leading-[22px] text-gray-700">
                  Implementamos medidas de seguridad técnicas y organizativas
                  para proteger su información, incluyendo:{"\n\n"}•
                  Encriptación de datos sensibles{"\n"}• Acceso restringido a la
                  información personal{"\n"}• Monitoreo regular de seguridad
                  {"\n"}• Copias de seguridad regulares
                </Text>
              </View>

              <View className="mb-5">
                <Text className="text-lg font-bold text-gray-800 mb-2.5">
                  6. Sus Derechos
                </Text>
                <Text className="text-sm leading-[22px] text-gray-700">
                  Usted tiene derecho a:{"\n\n"}• Acceder a sus datos personales
                  {"\n"}• Corregir información inexacta{"\n"}• Solicitar la
                  eliminación de sus datos{"\n"}• Exportar sus datos{"\n"}•
                  Limitar el procesamiento de sus datos{"\n"}• Oponerse al
                  procesamiento de sus datos
                </Text>
              </View>

              <View className="mb-5">
                <Text className="text-lg font-bold text-gray-800 mb-2.5">
                  7. Retención de Datos
                </Text>
                <Text className="text-sm leading-[22px] text-gray-700">
                  Conservamos su información mientras:{"\n\n"}• Mantenga una
                  cuenta activa{"\n"}• Sea necesario para proporcionar nuestros
                  servicios{"\n"}• Sea requerido por obligaciones legales
                </Text>
              </View>

              <View className="mb-5">
                <Text className="text-lg font-bold text-gray-800 mb-2.5">
                  8. Cambios en la Política de Privacidad
                </Text>
                <Text className="text-sm leading-[22px] text-gray-700">
                  Nos reservamos el derecho de modificar esta política. Le
                  notificaremos cualquier cambio significativo a través de la
                  aplicación o por correo electrónico.
                </Text>
              </View>

              <View className="mb-5">
                <Text className="text-lg font-bold text-gray-800 mb-2.5">
                  9. Contacto
                </Text>
                <Text className="text-sm leading-[22px] text-gray-700">
                  Para preguntas sobre esta política o sus datos personales,
                  contáctenos en: support@smartlift.com
                </Text>
              </View>

              <View className="mb-5">
                <Text className="text-lg font-bold text-gray-800 mb-2.5">
                  10. Consentimiento
                </Text>
                <Text className="text-sm leading-[22px] text-gray-700">
                  Al utilizar nuestra aplicación, usted acepta los términos de
                  esta Política de Privacidad. Si no está de acuerdo con estos
                  términos, por favor no utilice la aplicación.
                </Text>
              </View>
            </View>
          </ScrollView>

          <View className="p-4 border-t border-gray-200 items-center">
            <TouchableOpacity
              className="bg-blue-500 py-3 px-8 rounded-xl min-w-[120px] items-center"
              onPress={onClose}
            >
              <Text className="text-white text-base font-semibold">Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default PrivacyPolicyModal;
