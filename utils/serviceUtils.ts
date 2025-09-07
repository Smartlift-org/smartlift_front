/**
 * Utilities para servicios - manejo centralizado de errores y respuestas
 */

/**
 * Maneja errores comunes de API con mensajes en español
 */
export const handleApiError = (error: any, customMessages?: Record<number, string>) => {
  const status = error.response?.status;
  const errorMessage = error.response?.data?.error || error.response?.data?.message;
  
  // Mensajes personalizados por código de estado
  if (customMessages && customMessages[status]) {
    throw new Error(customMessages[status]);
  }
  
  // Mensajes estándar por código de estado
  switch (status) {
    case 401:
      throw new Error("No estás autorizado");
    case 403:
      throw new Error("No tienes permisos para realizar esta acción");
    case 404:
      throw new Error("Recurso no encontrado");
    case 409:
      throw new Error("Conflicto en el recurso");
    case 422:
      if (error.response?.data?.errors) {
        const errors = Array.isArray(error.response.data.errors)
          ? error.response.data.errors
          : [error.response.data.errors];
        throw new Error(errors.join(", "));
      }
      throw new Error("Datos inválidos");
    default:
      throw new Error(errorMessage || "Error de conexión");
  }
};

/**
 * Procesa respuestas de API que incluyen un campo 'success'
 */
export const handleApiResponse = <T>(response: any, errorMessage: string = "Error en la operación"): T => {
  if (response.data.success) {
    return response.data.data;
  }
  throw new Error(response.data.message || errorMessage);
};

/**
 * Wrapper para ejecutar llamadas de API con manejo centralizado de errores
 */
export const executeApiCall = async <T>(
  apiCall: () => Promise<any>,
  customErrorMessages?: Record<number, string>
): Promise<T> => {
  try {
    return await apiCall();
  } catch (error: any) {
    handleApiError(error, customErrorMessages);
    throw error; // Este throw nunca se ejecutará debido a handleApiError, pero TypeScript lo requiere
  }
};
