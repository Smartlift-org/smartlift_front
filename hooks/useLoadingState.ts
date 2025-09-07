import { useState, useCallback } from "react";

/**
 * Hook personalizado para manejar estados de carga de forma consistente
 * Evita la duplicación de setIsLoading(false) en múltiples lugares
 */
export const useLoadingState = (initialState: boolean = false) => {
  const [isLoading, setIsLoading] = useState<boolean>(initialState);

  const withLoading = useCallback(
    async <T>(asyncFunction: () => Promise<T>): Promise<T | null> => {
      try {
        setIsLoading(true);
        const result = await asyncFunction();
        return result;
      } catch (error) {
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  return {
    isLoading,
    setLoading,
    withLoading,
  };
};
