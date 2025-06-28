import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";

interface TermsOfServiceModalProps {
  visible: boolean;
  onClose: () => void;
}

const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({
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
              Términos de Servicio
            </Text>
            <Text className="text-sm text-center text-gray-500 mt-1">
              Última actualización: 28/05/2025
            </Text>
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={true}>
            <View className="p-5">
              <View className="mb-5">
                <Text className="text-lg font-bold text-gray-800 mb-2.5">
                  1. Aceptación de Términos
                </Text>
                <Text className="text-sm leading-[22px] text-gray-700">
                  Al acceder o utilizar SmartLift, usted acepta estar sujeto a
                  estos Términos de Servicio. Si no está de acuerdo con alguna
                  parte de estos términos, no podrá acceder al servicio.
                </Text>
              </View>

              <View className="mb-5">
                <Text className="text-lg font-bold text-gray-800 mb-2.5">
                  2. Descripción del Servicio
                </Text>
                <Text className="text-sm leading-[22px] text-gray-700">
                  SmartLift es una aplicación de seguimiento y comunidad
                  deportiva que permite a los usuarios registrar su progreso,
                  seguir rutinas de entrenamiento, conectar con entrenadores y
                  participar en una comunidad de fitness.
                </Text>
              </View>

              <View className="mb-5">
                <Text className="text-lg font-bold text-gray-800 mb-2.5">
                  3. Cuentas de Usuario
                </Text>
                <Text className="text-sm leading-[22px] text-gray-700">
                  3.1 Para utilizar ciertas funciones de SmartLift, debe crear
                  una cuenta y proporcionar información precisa y completa.
                  {"\n\n"}
                  3.2 Usted es responsable de mantener la confidencialidad de su
                  contraseña y de todas las actividades que ocurran bajo su
                  cuenta.{"\n\n"}
                  3.3 Debe notificarnos inmediatamente sobre cualquier uso no
                  autorizado de su cuenta o cualquier otra violación de
                  seguridad.
                </Text>
              </View>

              <View className="mb-5">
                <Text className="text-lg font-bold text-gray-800 mb-2.5">
                  4. Contenido del Usuario
                </Text>
                <Text className="text-sm leading-[22px] text-gray-700">
                  4.1 Al publicar contenido en SmartLift, usted otorga a la
                  aplicación una licencia mundial, no exclusiva y libre de
                  regalías para usar, reproducir y distribuir dicho contenido en
                  relación con el servicio.{"\n\n"}
                  4.2 Usted es el único responsable de todo el contenido que
                  publique y de cualquier consecuencia que resulte de dicho
                  contenido.{"\n\n"}
                  4.3 No publicará contenido que sea ilegal, ofensivo,
                  amenazante, difamatorio, invasivo de la privacidad, o que
                  infrinja derechos de propiedad intelectual.
                </Text>
              </View>

              <View className="mb-5">
                <Text className="text-lg font-bold text-gray-800 mb-2.5">
                  5. Conducta del Usuario
                </Text>
                <Text className="text-sm leading-[22px] text-gray-700">
                  5.1 Usted acepta no utilizar SmartLift para:{"\n"}• Violar
                  cualquier ley aplicable{"\n"}• Acosar, intimidar o amenazar a
                  otros usuarios{"\n"}• Publicar contenido falso o engañoso
                  {"\n"}• Interferir con el funcionamiento normal de la
                  aplicación{"\n"}• Acceder a áreas no públicas de la aplicación
                  {"\n"}• Sondear, escanear o probar la vulnerabilidad de la
                  aplicación{"\n\n"}
                  5.2 Nos reservamos el derecho de suspender o terminar su
                  cuenta si viola estas reglas.
                </Text>
              </View>

              <View className="mb-5">
                <Text className="text-lg font-bold text-gray-800 mb-2.5">
                  6. Propiedad Intelectual
                </Text>
                <Text className="text-sm leading-[22px] text-gray-700">
                  6.1 SmartLift y su contenido original, características y
                  funcionalidad son propiedad de la empresa y están protegidos
                  por derechos de autor, marcas registradas y otras leyes de
                  propiedad intelectual.{"\n\n"}
                  6.2 Nuestras marcas comerciales y elementos visuales no pueden
                  ser utilizados sin nuestro permiso previo por escrito.
                </Text>
              </View>

              <View className="mb-5">
                <Text className="text-lg font-bold text-gray-800 mb-2.5">
                  7. Limitación de Responsabilidad
                </Text>
                <Text className="text-sm leading-[22px] text-gray-700">
                  7.1 SmartLift se proporciona "tal cual" y "según
                  disponibilidad" sin garantías de ningún tipo.{"\n\n"}
                  7.2 En ningún caso seremos responsables por daños directos,
                  indirectos, incidentales, especiales o consecuentes que
                  resulten del uso o la imposibilidad de usar la aplicación.
                  {"\n\n"}
                  7.3 Usted reconoce que es responsable de consultar a un
                  profesional de la salud antes de comenzar cualquier programa
                  de ejercicio.
                </Text>
              </View>

              <View className="mb-5">
                <Text className="text-lg font-bold text-gray-800 mb-2.5">
                  8. Indemnización
                </Text>
                <Text className="text-sm leading-[22px] text-gray-700">
                  Usted acepta defender, indemnizar y mantener indemne a
                  SmartLift y sus afiliados de y contra cualquier reclamo, daño,
                  obligación, pérdida, responsabilidad, costo o deuda, y gastos
                  que surjan de: (i) su uso y acceso a la aplicación; (ii) su
                  violación de cualquier término de estos Términos de Servicio;
                  (iii) su violación de cualquier derecho de terceros,
                  incluidos, entre otros, derechos de autor, propiedad o
                  privacidad; o (iv) cualquier reclamo de que su contenido causó
                  daño a un tercero.
                </Text>
              </View>

              <View className="mb-5">
                <Text className="text-lg font-bold text-gray-800 mb-2.5">
                  9. Modificaciones del Servicio
                </Text>
                <Text className="text-sm leading-[22px] text-gray-700">
                  9.1 Nos reservamos el derecho de modificar o discontinuar,
                  temporal o permanentemente, la aplicación o cualquier servicio
                  relacionado con ella, con o sin previo aviso.{"\n\n"}
                  9.2 No seremos responsables ante usted o cualquier tercero por
                  cualquier modificación, suspensión o interrupción del
                  servicio.
                </Text>
              </View>

              <View className="mb-5">
                <Text className="text-lg font-bold text-gray-800 mb-2.5">
                  10. Cambios en los Términos
                </Text>
                <Text className="text-sm leading-[22px] text-gray-700">
                  Nos reservamos el derecho de modificar estos términos de
                  servicio en cualquier momento. Le notificaremos cualquier
                  cambio significativo a través de la aplicación o por correo
                  electrónico. El uso continuado de la aplicación después de
                  dichos cambios constituye su aceptación de los nuevos
                  términos.
                </Text>
              </View>

              <View className="mb-5">
                <Text className="text-lg font-bold text-gray-800 mb-2.5">
                  11. Ley Aplicable
                </Text>
                <Text className="text-sm leading-[22px] text-gray-700">
                  Estos términos se regirán e interpretarán de acuerdo con las
                  leyes del país de operación de SmartLift, sin tener en cuenta
                  sus disposiciones sobre conflictos de leyes.
                </Text>
              </View>

              <View className="mb-5">
                <Text className="text-lg font-bold text-gray-800 mb-2.5">
                  12. Contacto
                </Text>
                <Text className="text-sm leading-[22px] text-gray-700">
                  Para cualquier pregunta sobre estos Términos de Servicio,
                  contáctenos en: support@smartlift.com
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

export default TermsOfServiceModal;
