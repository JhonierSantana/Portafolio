import { useSyncExternalStore } from "react";

const subscribeToNothing = () => () => {};

/** False during the server render and hydration, true afterwards (and on any later client-side mount). */
export function useIsClient() {
  return useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
}
