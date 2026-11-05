import { createStore } from "@/lib/create-store";

/** Session flag so the intro only plays on the first page load of a visit. */
export const INTRO_SEEN_KEY = "portfolio-intro-seen";

export type IntroState = {
  /** The hero avatar finished loading (or fell back to the photo). */
  avatarReady: boolean;
  /** The intro overlay is gone (finished, skipped or already seen). */
  dismissed: boolean;
};

const store = createStore<IntroState>({ avatarReady: false, dismissed: false });

/** Shared by the avatar and the intro loader, so neither needs the other as a prop. */
export const introStore = {
  ...store,
  markAvatarReady: () => store.setState({ avatarReady: true }),
  dismiss: () => store.setState({ dismissed: true }),
};
