import React, { useState } from 'react';
import CustomAlert from './CustomAlert';

interface AlertOptions {
  title: string;
  message: string;
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
