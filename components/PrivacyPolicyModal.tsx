import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  ScrollView,
  SafeAreaView
} from 'react-native';

interface PrivacyPolicyModalProps {
  visible: boolean;
  onClose: () => void;
}

const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  visible,
  onClose
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.header}>
            <Text style={styles.modalTitle}>Política de Privacidad</Text>
            <Text style={styles.modalSubtitle}>Última actualización: 28/05/2025</Text>
          </View>
          
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={true}>
            <View style={styles.contentContainer}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>1. Introducción</Text>
                <Text style={styles.sectionText}>
                  Bienvenido a nuestra aplicación de seguimiento y comunidad deportiva. Esta Política de Privacidad explica cómo recopilamos, utilizamos, divulgamos y protegemos su información personal cuando utiliza nuestra aplicación.
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>2. Información que Recopilamos</Text>
                <Text style={styles.subSectionTitle}>2.1 Información de Registro</Text>
                <Text style={styles.sectionText}>
                  • Dirección de correo electrónico{'\n'}
                  • Contraseña (almacenada de forma segura y encriptada){'\n'}
                  • Tipo de cuenta (Socio o Entrenador)
                </Text>

                <Text style={styles.subSectionTitle}>2.2 Información del Perfil</Text>
                <Text style={styles.sectionText}>
                  • Nombre visible (opcional){'\n'}
                  • Objetivos de entrenamiento{'\n'}
                  • Nivel de experiencia{'\n'}
                  • Días disponibles para entrenamiento{'\n'}
                  • Equipamiento disponible{'\n'}
                  • Información adicional que decida compartir
                </Text>

                <Text style={styles.subSectionTitle}>2.3 Datos de Actividad Física</Text>
                <Text style={styles.sectionText}>
                  • Rutinas de entrenamiento{'\n'}
                  • Registro de progreso (pesos, repeticiones, tiempo, distancia){'\n'}
                  • Estadísticas de entrenamiento{'\n'}
                  • Historial de sesiones completadas
                </Text>

                <Text style={styles.subSectionTitle}>2.4 Datos de Uso</Text>
                <Text style={styles.sectionText}>
                  • Interacciones con la aplicación{'\n'}
                  • Preferencias de configuración{'\n'}
                  • Datos de rendimiento de la aplicación{'\n'}
                  • Información del dispositivo
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>3. Uso de la Información</Text>
                <Text style={styles.sectionText}>
                  Utilizamos su información para:{'\n\n'}
                  • Proporcionar y mantener nuestros servicios{'\n'}
                  • Personalizar su experiencia de entrenamiento{'\n'}
                  • Generar rutinas de entrenamiento adaptadas a sus objetivos{'\n'}
                  • Mostrar su progreso y estadísticas{'\n'}
                  • Facilitar la comunicación entre socios y entrenadores{'\n'}
                  • Mejorar nuestros servicios{'\n'}
                  • Enviar notificaciones relevantes
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>4. Compartir Información</Text>
                <Text style={styles.subSectionTitle}>4.1 Compartir con Entrenadores</Text>
                <Text style={styles.sectionText}>
                  • Los entrenadores asignados pueden ver su perfil, rutinas y progreso{'\n'}
                  • Pueden acceder a sus estadísticas y datos de entrenamiento
                </Text>

                <Text style={styles.subSectionTitle}>4.2 Compartir en la Comunidad</Text>
                <Text style={styles.sectionText}>
                  • Las publicaciones en el feed social pueden incluir información sobre su progreso (sujeto a su configuración de privacidad){'\n'}
                  • Participación en desafíos y rankings (configurable)
                </Text>

                <Text style={styles.subSectionTitle}>4.3 Proveedores de Servicios</Text>
                <Text style={styles.sectionText}>
                  Utilizamos servicios de terceros para:{'\n'}
                  • Almacenamiento de datos{'\n'}
                  • Análisis de uso{'\n'}
                  • Generación de rutinas por IA{'\n'}
                  • Alojamiento de videos
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>5. Seguridad de Datos</Text>
                <Text style={styles.sectionText}>
                  Implementamos medidas de seguridad técnicas y organizativas para proteger su información, incluyendo:{'\n\n'}
                  • Encriptación de datos sensibles{'\n'}
                  • Acceso restringido a la información personal{'\n'}
                  • Monitoreo regular de seguridad{'\n'}
                  • Copias de seguridad regulares
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>6. Sus Derechos</Text>
                <Text style={styles.sectionText}>
                  Usted tiene derecho a:{'\n\n'}
                  • Acceder a sus datos personales{'\n'}
                  • Corregir información inexacta{'\n'}
                  • Solicitar la eliminación de sus datos{'\n'}
                  • Exportar sus datos{'\n'}
                  • Limitar el procesamiento de sus datos{'\n'}
                  • Oponerse al procesamiento de sus datos
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>7. Retención de Datos</Text>
                <Text style={styles.sectionText}>
                  Conservamos su información mientras:{'\n\n'}
                  • Mantenga una cuenta activa{'\n'}
                  • Sea necesario para proporcionar nuestros servicios{'\n'}
                  • Sea requerido por obligaciones legales
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>8. Cambios en la Política de Privacidad</Text>
                <Text style={styles.sectionText}>
                  Nos reservamos el derecho de modificar esta política. Le notificaremos cualquier cambio significativo a través de la aplicación o por correo electrónico.
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>9. Contacto</Text>
                <Text style={styles.sectionText}>
                  Para preguntas sobre esta política o sus datos personales, contáctenos en: support@smartlift.com
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>10. Consentimiento</Text>
                <Text style={styles.sectionText}>
                  Al utilizar nuestra aplicación, usted acepta los términos de esta Política de Privacidad. Si no está de acuerdo con estos términos, por favor no utilice la aplicación.
                </Text>
              </View>
            </View>
          </ScrollView>
          
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.button}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  modalView: {
    width: '90%',
    height: '90%',
    backgroundColor: 'white',
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ced4da'
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#212529'
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#6c757d',
    marginTop: 5
  },
  scrollView: {
    flex: 1
  },
  contentContainer: {
    padding: 20
  },
  section: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 10
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginTop: 10,
    marginBottom: 5
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#495057'
  },
  footer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#ced4da',
    alignItems: 'center'
  },
  button: {
    backgroundColor: '#3a86ff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    minWidth: 120,
    alignItems: 'center'
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  }
});

export default PrivacyPolicyModal;
