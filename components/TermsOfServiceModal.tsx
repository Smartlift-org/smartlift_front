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

interface TermsOfServiceModalProps {
  visible: boolean;
  onClose: () => void;
}

const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({
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
            <Text style={styles.modalTitle}>Términos de Servicio</Text>
            <Text style={styles.modalSubtitle}>Última actualización: 28/05/2025</Text>
          </View>
          
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={true}>
            <View style={styles.contentContainer}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>1. Aceptación de Términos</Text>
                <Text style={styles.sectionText}>
                  Al acceder o utilizar SmartLift, usted acepta estar sujeto a estos Términos de Servicio. Si no está de acuerdo con alguna parte de estos términos, no podrá acceder al servicio.
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>2. Descripción del Servicio</Text>
                <Text style={styles.sectionText}>
                  SmartLift es una aplicación de seguimiento y comunidad deportiva que permite a los usuarios registrar su progreso, seguir rutinas de entrenamiento, conectar con entrenadores y participar en una comunidad de fitness.
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>3. Cuentas de Usuario</Text>
                <Text style={styles.sectionText}>
                  3.1 Para utilizar ciertas funciones de SmartLift, debe crear una cuenta y proporcionar información precisa y completa.{'\n\n'}
                  3.2 Usted es responsable de mantener la confidencialidad de su contraseña y de todas las actividades que ocurran bajo su cuenta.{'\n\n'}
                  3.3 Debe notificarnos inmediatamente sobre cualquier uso no autorizado de su cuenta o cualquier otra violación de seguridad.
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>4. Contenido del Usuario</Text>
                <Text style={styles.sectionText}>
                  4.1 Al publicar contenido en SmartLift, usted otorga a la aplicación una licencia mundial, no exclusiva y libre de regalías para usar, reproducir y distribuir dicho contenido en relación con el servicio.{'\n\n'}
                  4.2 Usted es el único responsable de todo el contenido que publique y de cualquier consecuencia que resulte de dicho contenido.{'\n\n'}
                  4.3 No publicará contenido que sea ilegal, ofensivo, amenazante, difamatorio, invasivo de la privacidad, o que infrinja derechos de propiedad intelectual.
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>5. Conducta del Usuario</Text>
                <Text style={styles.sectionText}>
                  5.1 Usted acepta no utilizar SmartLift para:{'\n'}
                  • Violar cualquier ley aplicable{'\n'}
                  • Acosar, intimidar o amenazar a otros usuarios{'\n'}
                  • Publicar contenido falso o engañoso{'\n'}
                  • Interferir con el funcionamiento normal de la aplicación{'\n'}
                  • Acceder a áreas no públicas de la aplicación{'\n'}
                  • Sondear, escanear o probar la vulnerabilidad de la aplicación{'\n\n'}
                  5.2 Nos reservamos el derecho de suspender o terminar su cuenta si viola estas reglas.
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>6. Propiedad Intelectual</Text>
                <Text style={styles.sectionText}>
                  6.1 SmartLift y su contenido original, características y funcionalidad son propiedad de la empresa y están protegidos por derechos de autor, marcas registradas y otras leyes de propiedad intelectual.{'\n\n'}
                  6.2 Nuestras marcas comerciales y elementos visuales no pueden ser utilizados sin nuestro permiso previo por escrito.
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>7. Limitación de Responsabilidad</Text>
                <Text style={styles.sectionText}>
                  7.1 SmartLift se proporciona "tal cual" y "según disponibilidad" sin garantías de ningún tipo.{'\n\n'}
                  7.2 En ningún caso seremos responsables por daños directos, indirectos, incidentales, especiales o consecuentes que resulten del uso o la imposibilidad de usar la aplicación.{'\n\n'}
                  7.3 Usted reconoce que es responsable de consultar a un profesional de la salud antes de comenzar cualquier programa de ejercicio.
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>8. Indemnización</Text>
                <Text style={styles.sectionText}>
                  Usted acepta defender, indemnizar y mantener indemne a SmartLift y sus afiliados de y contra cualquier reclamo, daño, obligación, pérdida, responsabilidad, costo o deuda, y gastos que surjan de: (i) su uso y acceso a la aplicación; (ii) su violación de cualquier término de estos Términos de Servicio; (iii) su violación de cualquier derecho de terceros, incluidos, entre otros, derechos de autor, propiedad o privacidad; o (iv) cualquier reclamo de que su contenido causó daño a un tercero.
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>9. Modificaciones del Servicio</Text>
                <Text style={styles.sectionText}>
                  9.1 Nos reservamos el derecho de modificar o discontinuar, temporal o permanentemente, la aplicación o cualquier servicio relacionado con ella, con o sin previo aviso.{'\n\n'}
                  9.2 No seremos responsables ante usted o cualquier tercero por cualquier modificación, suspensión o interrupción del servicio.
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>10. Cambios en los Términos</Text>
                <Text style={styles.sectionText}>
                  Nos reservamos el derecho de modificar estos términos de servicio en cualquier momento. Le notificaremos cualquier cambio significativo a través de la aplicación o por correo electrónico. El uso continuado de la aplicación después de dichos cambios constituye su aceptación de los nuevos términos.
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>11. Ley Aplicable</Text>
                <Text style={styles.sectionText}>
                  Estos términos se regirán e interpretarán de acuerdo con las leyes del país de operación de SmartLift, sin tener en cuenta sus disposiciones sobre conflictos de leyes.
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>12. Contacto</Text>
                <Text style={styles.sectionText}>
                  Para cualquier pregunta sobre estos Términos de Servicio, contáctenos en: support@smartlift.com
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

export default TermsOfServiceModal;
