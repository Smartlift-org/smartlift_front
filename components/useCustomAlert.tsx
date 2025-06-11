import React, { useState } from 'react';
import CustomAlert from './CustomAlert';

interface AlertOptions {
  title: string;
  message: string;
  primaryButtonText?: string;
  buttons?: Array<{
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>;
}

export const useCustomAlert = () => {
  const [visible, setVisible] = useState<boolean>(false);
  const [options, setOptions] = useState<AlertOptions>({
    title: '',
    message: '',
    buttons: [{ text: 'OK' }]
  });

  const showAlert = (alertOptions: AlertOptions) => {
    // If primaryButtonText is provided, create a button with it
    if (alertOptions.primaryButtonText) {
      alertOptions.buttons = [
        { 
          text: alertOptions.primaryButtonText,
          onPress: () => hideAlert()
        }
      ];
    }
    setOptions(alertOptions);
    setVisible(true);
  };

  const hideAlert = () => {
    setVisible(false);
  };

  const AlertComponent = () => (
    <CustomAlert
      visible={visible}
      title={options.title}
      message={options.message}
      buttons={options.buttons}
      onClose={hideAlert}
    />
  );

  return {
    showAlert,
    hideAlert,
    AlertComponent
  };
};

export default useCustomAlert;
