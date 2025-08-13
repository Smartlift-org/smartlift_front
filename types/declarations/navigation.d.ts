declare module "@react-navigation/native" {
  export * from "@react-navigation/native";
  export function NavigationContainer(props: any): any;
  export type NavigationContainerRef<T = any> = any;
  export function useRoute(): any;
  export type RouteProp<T, K extends keyof T> = any;
  export function useFocusEffect(callback: () => void | (() => void)): void;
}

declare module "@react-navigation/native-stack" {
  export * from "@react-navigation/native-stack";
  export function createNativeStackNavigator<T = any>(): any;
  export type NativeStackNavigationProp<T, K extends keyof T> = any;
}
