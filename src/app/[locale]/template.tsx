import { PageTransition } from "@/components/motion/page-transition";

/** Unlike the layout, a template remounts on every navigation, which is what retriggers the transition. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
