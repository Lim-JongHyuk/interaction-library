import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/** True only after client hydration — avoids setState-in-effect. */
export function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
