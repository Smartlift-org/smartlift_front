declare module "nativewind" {
  export function useColorScheme(): {
    colorScheme: string;
    setColorScheme: (colorScheme: string) => void;
    toggleColorScheme: () => void;
  };
}
