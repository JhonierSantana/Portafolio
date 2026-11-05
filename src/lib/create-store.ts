export type Store<State extends object> = {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => State;
  getServerSnapshot: () => State;
  setState: (patch: Partial<State>) => void;
  reset: () => void;
};

/**
 * Minimal external store for state shared by distant components (no context or prop drilling).
 * Read it with `useStore`; updates that change nothing do not notify subscribers.
 */
export function createStore<State extends object>(initialState: State): Store<State> {
  let state = initialState;
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((listener) => listener());

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => state,
    getServerSnapshot: () => initialState,
    setState(patch) {
      const changed = (Object.keys(patch) as (keyof State)[]).some((key) => !Object.is(patch[key], state[key]));
      if (!changed) return;
      state = { ...state, ...patch };
      notify();
    },
    reset() {
      state = initialState;
      notify();
    },
  };
}
