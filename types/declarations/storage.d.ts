declare module "@react-native-async-storage/async-storage" {
  export * from "@react-native-async-storage/async-storage";
  const AsyncStorage: {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
    clear(): Promise<void>;
    getAllKeys(): Promise<string[]>;
  };
  export default AsyncStorage;
}
