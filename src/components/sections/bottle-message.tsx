"use client";

import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { SCROLLING_WAVE_PATH, SCROLLING_WAVE_VIEWBOX } from "@/lib/wave-paths";

const DROP_SECONDS = 0.8;
const DRIFT_SECONDS = 3.2;
const ARRIVED_AT_SECONDS = DROP_SECONDS + DRIFT_SECONDS - 0.4;

function Bottle() {
  return (
    <svg viewBox="0 0 120 48" className="h-12 w-30" aria-hidden>
      {/* glass */}
      <path
        d="M8 12 Q4 12 4 24 Q4 36 8 36 L78 36 Q86 36 90 31 L100 29 L100 19 L90 17 Q86 12 78 12 Z"
        className="fill-signal/20 stroke-signal"
        strokeWidth="1.5"
      />
      {/* rolled message */}
      <rect x="20" y="17" width="50" height="14" rx="7" className="fill-foreground/85" />
      <path d="M28 21 H62 M28 24 H58 M28 27 H54" className="stroke-background/60" strokeWidth="1" />
      {/* cork */}
      <rect x="100" y="18" width="12" height="12" rx="2" className="fill-[#b08657]" />
      {/* glint */}
      <path d="M12 16 Q9 24 12 32" className="fill-none stroke-foreground/50" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Shown after the contact form is sent: the message, rolled up in a bottle, drops onto the
 * waves and drifts away. Screen readers get the confirmation right away.
 */
export function BottleMessage({ onSendAnother }: { onSendAnother: () => void }) {
  const contactTexts = useTranslations("contact");
  const reducedMotion = useReducedMotion();

  return (
    <div className="mt-5 flex flex-col gap-5">
      <p role="status" className="sr-only">
        {contactTexts("bottle.arrived")}
      </p>

      <div aria-hidden className="relative h-48 overflow-hidden rounded-md border border-border bg-background">
        {reducedMotion ? (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
            <Bottle />
          </div>
        ) : (
          <motion.div
            className="absolute bottom-9 left-[6%]"
            initial={{ x: 0, opacity: 1 }}
            animate={{ x: [0, 0, 340], opacity: [1, 1, 0] }}
            transition={{ duration: DROP_SECONDS + DRIFT_SECONDS, times: [0, DROP_SECONDS / (DROP_SECONDS + DRIFT_SECONDS), 1], ease: "easeIn" }}
          >
            <motion.div
              initial={{ y: -150, rotate: -60 }}
              animate={{ y: [-150, 6, 0], rotate: [-60, -4, -8] }}
              transition={{ duration: DROP_SECONDS, ease: "easeOut" }}
            >
              <motion.div
                animate={{ y: [0, -5, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: DROP_SECONDS }}
              >
                <Bottle />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
        <svg
          viewBox={SCROLLING_WAVE_VIEWBOX}
          preserveAspectRatio="none"
          className="absolute bottom-0 left-0 h-14 w-[200%] animate-wave-drift fill-signal/15"
        >
          <path d={SCROLLING_WAVE_PATH} />
        </svg>
      </div>

      <div aria-hidden className="grid text-sm">
        <motion.p
          className="col-start-1 row-start-1 text-muted-foreground"
          initial={{ opacity: 1 }}
          animate={{ opacity: reducedMotion ? 0 : [1, 1, 0] }}
          transition={{ duration: ARRIVED_AT_SECONDS, times: [0, 0.85, 1] }}
        >
          {contactTexts("bottle.sailing")}
        </motion.p>
        <motion.p
          className="col-start-1 row-start-1 text-signal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reducedMotion ? 0 : ARRIVED_AT_SECONDS, duration: 0.5 }}
        >
          {contactTexts("bottle.arrived")}
        </motion.p>
      </div>

      <button
        type="button"
        onClick={onSendAnother}
        className="min-h-11 cursor-pointer self-start font-data text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-signal hover:underline"
      >
        {contactTexts("bottle.again")}
      </button>
    </div>
  );
}
