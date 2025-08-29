export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[\w+\-.]+@[a-z\d\-]+(\.[a-z\d\-]+)*\.[a-z]+$/i;
  return emailRegex.test(email);
};

export const isOnlyWhitespace = (str: string): boolean => {
  return str.trim().length === 0;
};

export const validatePassword = (password: string): string | null => {
  if (!password) {
    return "La contraseña es obligatoria";
  }
  if (password.length < 6) {
    return "La contraseña debe tener al menos 6 caracteres";
  }
  return null;
};

export const validatePasswordConfirmation = (
  password: string,
  confirmPassword: string
): string | null => {
  const passwordError = validatePassword(password);
  if (passwordError) return passwordError;

  const confirmError = validatePassword(confirmPassword);
  if (confirmError) return confirmError;

  if (password !== confirmPassword) {
    return "Las contraseñas no coinciden";
  }
  return null;
};

export const validateEmail = (email: string): string | null => {
  if (!email) {
    return "El correo electrónico es obligatorio";
  }
  if (!isValidEmail(email)) {
    return "Por favor ingrese una dirección de correo válida";
  }
  return null;
};

export const validateName = (
  name: string,
  fieldName: string
): string | null => {
  if (!name) {
    return `${fieldName} es obligatorio`;
  }
  if (isOnlyWhitespace(name)) {
    return `${fieldName} no puede estar vacío`;
  }
  return null;
};

export const sanitizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateLoginForm = (
  email: string,
  password: string
): ValidationResult => {
  if (!email || !password) {
    return { isValid: false, error: "Por favor complete todos los campos" };
  }

  const emailError = validateEmail(email);
  if (emailError) {
    return { isValid: false, error: emailError };
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    return { isValid: false, error: passwordError };
  }

  return { isValid: true };
};

export const validateRegisterForm = (
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  confirmPassword: string,
  acceptedTerms: boolean
): ValidationResult => {
  if (!firstName || !lastName || !email || !password || !confirmPassword) {
    return { isValid: false, error: "Por favor complete todos los campos" };
  }

  const firstNameError = validateName(firstName, "El nombre");
  if (firstNameError) {
    return { isValid: false, error: firstNameError };
  }

  const lastNameError = validateName(lastName, "El apellido");
  if (lastNameError) {
    return { isValid: false, error: lastNameError };
  }

  const emailError = validateEmail(email);
  if (emailError) {
    return { isValid: false, error: emailError };
  }

  const passwordError = validatePasswordConfirmation(password, confirmPassword);
  if (passwordError) {
    return { isValid: false, error: passwordError };
  }

  if (!acceptedTerms) {
    return {
      isValid: false,
      error: "Debe aceptar los términos y condiciones para continuar",
    };
  }

  return { isValid: true };
};
