import {
  isValidEmail,
  isOnlyWhitespace,
  validatePassword,
  validatePasswordConfirmation,
  validateEmail,
  validateName,
  sanitizeEmail,
  validateLoginForm,
  validateRegisterForm,
  ValidationResult
} from "../../utils/authValidation";

describe("authValidation", () => {
  describe("isValidEmail", () => {
    it("should return true for valid email addresses", () => {
      const validEmails = [
        "test@example.com",
        "user.name@domain.co.uk",
        "firstname+lastname@example.com",
        "1234567890@example.com",
        "email@example-one.com",
        "_______@example.com",
        "email@example.name",
        "email@example.museum",
        "email@example.co.jp",
        "firstname-lastname@example.com"
      ];

      validEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(true);
      });
    });

    it("should return false for invalid email addresses", () => {
      const invalidEmails = [
        "plainaddress",
        "@missingdomain.com",
        "missing@.com",
        "missing.domain@.com",
        "spaces in@email.com",
        "email@",
        "@domain.com",
        ""
      ];

      invalidEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(false);
      });
    });
  });

  describe("isOnlyWhitespace", () => {
    it("should return true for strings with only whitespace", () => {
      expect(isOnlyWhitespace("   ")).toBe(true);
      expect(isOnlyWhitespace("\t")).toBe(true);
      expect(isOnlyWhitespace("\n")).toBe(true);
      expect(isOnlyWhitespace(" \t\n ")).toBe(true);
      expect(isOnlyWhitespace("")).toBe(true);
    });

    it("should return false for strings with actual content", () => {
      expect(isOnlyWhitespace("hello")).toBe(false);
      expect(isOnlyWhitespace(" hello ")).toBe(false);
      expect(isOnlyWhitespace("a")).toBe(false);
      expect(isOnlyWhitespace("123")).toBe(false);
    });
  });

  describe("validatePassword", () => {
    it("should return null for valid passwords", () => {
      expect(validatePassword("123456")).toBeNull();
      expect(validatePassword("password123")).toBeNull();
      expect(validatePassword("verylongpassword")).toBeNull();
      expect(validatePassword("!@#$%^")).toBeNull();
    });

    it("should return error message for empty password", () => {
      expect(validatePassword("")).toBe("La contraseña es obligatoria");
      expect(validatePassword(null as any)).toBe("La contraseña es obligatoria");
      expect(validatePassword(undefined as any)).toBe("La contraseña es obligatoria");
    });

    it("should return error message for short passwords", () => {
      expect(validatePassword("12345")).toBe("La contraseña debe tener al menos 6 caracteres");
      expect(validatePassword("a")).toBe("La contraseña debe tener al menos 6 caracteres");
      expect(validatePassword("")).toBe("La contraseña es obligatoria");
    });
  });

  describe("validatePasswordConfirmation", () => {
    it("should return null when passwords match and are valid", () => {
      expect(validatePasswordConfirmation("123456", "123456")).toBeNull();
      expect(validatePasswordConfirmation("password123", "password123")).toBeNull();
    });

    it("should return error when password is invalid", () => {
      expect(validatePasswordConfirmation("12345", "12345")).toBe("La contraseña debe tener al menos 6 caracteres");
      expect(validatePasswordConfirmation("", "")).toBe("La contraseña es obligatoria");
    });

    it("should return error when confirmation password is invalid", () => {
      expect(validatePasswordConfirmation("123456", "12345")).toBe("La contraseña debe tener al menos 6 caracteres");
      expect(validatePasswordConfirmation("123456", "")).toBe("La contraseña es obligatoria");
    });

    it("should return error when passwords don't match", () => {
      expect(validatePasswordConfirmation("123456", "654321")).toBe("Las contraseñas no coinciden");
      expect(validatePasswordConfirmation("password", "different")).toBe("Las contraseñas no coinciden");
    });
  });

  describe("validateEmail", () => {
    it("should return null for valid emails", () => {
      expect(validateEmail("test@example.com")).toBeNull();
      expect(validateEmail("user@domain.org")).toBeNull();
    });

    it("should return error for empty email", () => {
      expect(validateEmail("")).toBe("El correo electrónico es obligatorio");
      expect(validateEmail(null as any)).toBe("El correo electrónico es obligatorio");
      expect(validateEmail(undefined as any)).toBe("El correo electrónico es obligatorio");
    });

    it("should return error for invalid email format", () => {
      expect(validateEmail("invalid-email")).toBe("Por favor ingrese una dirección de correo válida");
      expect(validateEmail("@domain.com")).toBe("Por favor ingrese una dirección de correo válida");
    });
  });

  describe("validateName", () => {
    it("should return null for valid names", () => {
      expect(validateName("John", "Nombre")).toBeNull();
      expect(validateName("María José", "Nombre")).toBeNull();
      expect(validateName("O'Connor", "Apellido")).toBeNull();
    });

    it("should return error for empty name", () => {
      expect(validateName("", "Nombre")).toBe("Nombre es obligatorio");
      expect(validateName(null as any, "Apellido")).toBe("Apellido es obligatorio");
      expect(validateName(undefined as any, "Nombre")).toBe("Nombre es obligatorio");
    });

    it("should return error for whitespace-only name", () => {
      expect(validateName("   ", "Nombre")).toBe("Nombre no puede estar vacío");
      expect(validateName("\t\n", "Apellido")).toBe("Apellido no puede estar vacío");
    });
  });

  describe("sanitizeEmail", () => {
    it("should trim and lowercase email addresses", () => {
      expect(sanitizeEmail("  TEST@EXAMPLE.COM  ")).toBe("test@example.com");
      expect(sanitizeEmail("User@Domain.ORG")).toBe("user@domain.org");
      expect(sanitizeEmail("\temail@test.com\n")).toBe("email@test.com");
    });

    it("should handle already clean emails", () => {
      expect(sanitizeEmail("test@example.com")).toBe("test@example.com");
      expect(sanitizeEmail("user@domain.org")).toBe("user@domain.org");
    });
  });

  describe("validateLoginForm", () => {
    it("should return valid result for correct login data", () => {
      const result = validateLoginForm("test@example.com", "123456");
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should return error when email is missing", () => {
      const result = validateLoginForm("", "123456");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Por favor complete todos los campos");
    });

    it("should return error when password is missing", () => {
      const result = validateLoginForm("test@example.com", "");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Por favor complete todos los campos");
    });

    it("should return error when both fields are missing", () => {
      const result = validateLoginForm("", "");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Por favor complete todos los campos");
    });

    it("should return email validation error", () => {
      const result = validateLoginForm("invalid-email", "123456");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Por favor ingrese una dirección de correo válida");
    });

    it("should return password validation error", () => {
      const result = validateLoginForm("test@example.com", "123");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("La contraseña debe tener al menos 6 caracteres");
    });
  });

  describe("validateRegisterForm", () => {
    const validFormData = {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "123456",
      confirmPassword: "123456",
      acceptedTerms: true
    };

    it("should return valid result for correct registration data", () => {
      const result = validateRegisterForm(
        validFormData.firstName,
        validFormData.lastName,
        validFormData.email,
        validFormData.password,
        validFormData.confirmPassword,
        validFormData.acceptedTerms
      );
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should return error when any required field is missing", () => {
      const testCases = [
        { ...validFormData, firstName: "" },
        { ...validFormData, lastName: "" },
        { ...validFormData, email: "" },
        { ...validFormData, password: "" },
        { ...validFormData, confirmPassword: "" }
      ];

      testCases.forEach(testCase => {
        const result = validateRegisterForm(
          testCase.firstName,
          testCase.lastName,
          testCase.email,
          testCase.password,
          testCase.confirmPassword,
          testCase.acceptedTerms
        );
        expect(result.isValid).toBe(false);
        expect(result.error).toBe("Por favor complete todos los campos");
      });
    });

    it("should return first name validation error", () => {
      const result = validateRegisterForm(
        "   ",
        validFormData.lastName,
        validFormData.email,
        validFormData.password,
        validFormData.confirmPassword,
        validFormData.acceptedTerms
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("El nombre no puede estar vacío");
    });

    it("should return last name validation error", () => {
      const result = validateRegisterForm(
        validFormData.firstName,
        "   ",
        validFormData.email,
        validFormData.password,
        validFormData.confirmPassword,
        validFormData.acceptedTerms
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("El apellido no puede estar vacío");
    });

    it("should return email validation error", () => {
      const result = validateRegisterForm(
        validFormData.firstName,
        validFormData.lastName,
        "invalid-email",
        validFormData.password,
        validFormData.confirmPassword,
        validFormData.acceptedTerms
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Por favor ingrese una dirección de correo válida");
    });

    it("should return password validation error", () => {
      const result = validateRegisterForm(
        validFormData.firstName,
        validFormData.lastName,
        validFormData.email,
        "123",
        "123",
        validFormData.acceptedTerms
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("La contraseña debe tener al menos 6 caracteres");
    });

    it("should return password mismatch error", () => {
      const result = validateRegisterForm(
        validFormData.firstName,
        validFormData.lastName,
        validFormData.email,
        "123456",
        "654321",
        validFormData.acceptedTerms
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Las contraseñas no coinciden");
    });

    it("should return terms acceptance error", () => {
      const result = validateRegisterForm(
        validFormData.firstName,
        validFormData.lastName,
        validFormData.email,
        validFormData.password,
        validFormData.confirmPassword,
        false
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Debe aceptar los términos y condiciones para continuar");
    });
  });
});
