import { useSyncExternalStore } from "react";
import type { Store } from "@/lib/create-store";

export function useStore<State extends object>(store: Store<State>) {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
}
