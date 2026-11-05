"use client";

import { useIsClient } from "@/hooks/use-is-client";
import { INTRO_SEEN_KEY } from "@/lib/intro-store";

const SCRIPT = `try{if(sessionStorage.getItem("${INTRO_SEEN_KEY}"))document.documentElement.dataset.introSeen=""}catch(e){}`;

/**
 * Hides the intro overlay before the first paint on repeat visits (see `.intro-overlay` in globals.css).
 * It only matters in the server HTML, where the browser runs it while parsing. Client renders (such as
 * the layout remounting on a locale switch) skip it: React never executes scripts it creates itself.
 */
export function IntroSeenScript() {
  const isClient = useIsClient();
  if (isClient) return null;
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
