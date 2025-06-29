declare module "react" {
  export * from "react";
  export interface FC<P = {}> {
    (props: P): React.ReactElement | null;
  }
  export type ReactElement = any;
  export function useState<T>(
    initialState: T | (() => T)
  ): [T, (newState: T) => void];
  export function useLayoutEffect(
    effect: () => void | (() => void),
    deps?: ReadonlyArray<any>
  ): void;
  export function useEffect(
    effect: () => void | (() => void),
    deps?: ReadonlyArray<any>
  ): void;
  export function useRef<T>(initialValue: T): { current: T };
  export function useRef<T = undefined>(): { current: T | undefined };
}
