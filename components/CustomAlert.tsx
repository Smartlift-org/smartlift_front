import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet
} from 'react-native';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  buttons?: Array<{
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>;
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  onClose,
  buttons = [{ text: 'OK' }]
}) => {

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalText}>{message}</Text>
          
          <View style={buttons.length > 1 ? styles.buttonRow : styles.buttonSingle}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  button.style === 'destructive' ? styles.buttonDanger : 
                  button.style === 'cancel' ? styles.buttonCancel : styles.buttonPrimary
                ]}
                onPress={() => {
                  if (button.onPress) {
                    button.onPress();
                  }
                  onClose();
                }}
              >
                <Text 
                  style={[
                    styles.buttonText,
                    button.style === 'cancel' ? styles.buttonTextDark : styles.buttonTextLight
                  ]}
                >
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
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
    width: '80%',
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
    elevation: 5
  },
  modalTitle: {
    marginTop: 20,
    marginHorizontal: 20,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#212529'
  },
  modalText: {
    marginTop: 10,
    marginBottom: 20,
    marginHorizontal: 20,
    textAlign: 'center',
    color: '#6c757d'
  },
  buttonRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#ced4da'
  },
  buttonSingle: {
    borderTopWidth: 1,
    borderTopColor: '#ced4da'
  },
  button: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonPrimary: {
    backgroundColor: 'white',
  },
  buttonCancel: {
    backgroundColor: 'white',
    borderLeftWidth: 1,
    borderLeftColor: '#ced4da'
  },
  buttonDanger: {
    backgroundColor: 'white',
    borderLeftWidth: 1,
    borderLeftColor: '#ced4da'
  },
  buttonText: {
    fontWeight: '500',
    fontSize: 16,
    textAlign: 'center'
  },
  buttonTextLight: {
    color: '#3a86ff'
  },
  buttonTextDark: {
    color: '#6c757d'
  }
});

export default CustomAlert;
