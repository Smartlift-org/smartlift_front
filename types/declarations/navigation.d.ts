declare module '@react-navigation/native' {
  export * from '@react-navigation/native';
  export function NavigationContainer(props: any): any;
  export type NavigationContainerRef<T = any> = any;
}

declare module '@react-navigation/native-stack' {
  export * from '@react-navigation/native-stack';
  export function createNativeStackNavigator<T = any>(): any;
  export type NativeStackNavigationProp<T, K extends keyof T> = any;
}
