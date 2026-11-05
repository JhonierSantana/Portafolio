"use client";

import { motion } from "motion/react";
import { ArrowRight, Download } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Avatar3D } from "@/components/sections/avatar-3d";
import { StatusBadge } from "@/components/ui/status-badge";
import { WeatherBadge } from "@/components/ambience/weather-badge";
import { createRainLayer } from "@/components/ambience/rain-layer";
import { WaveDivider } from "@/components/ui/wave-divider";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { cvHref } from "@/lib/contact-info";

const STACK = ["React", "React Native", "Node.js", "TypeScript"];

/** The hero card is opaque and would hide the background rain, so it gets its own, fainter layer. */
const HeroRain = createRainLayer({ count: 36, seed: 4096 });

export function Hero() {
  const heroTexts = useTranslations("hero");
  const locale = useLocale();

  return (
    <section className="relative left-1/2 right-1/2 -mx-[50vw] -mt-6 w-screen">
      <WaveDivider animated />
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer(0.07, 0.05)}
        className="relative overflow-hidden bg-card px-6 py-16 sm:py-20"
      >
        <HeroRain className="absolute inset-0 opacity-60" />
        <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-10 text-center md:flex-row md:items-center md:justify-center md:gap-14 md:text-left">
          <motion.div
            variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }}
            transition={{ duration: 0.6 }}
          >
            <Avatar3D label={heroTexts("avatarLabel")} className="h-72 w-[min(20rem,calc(100vw-3rem))] sm:h-[22rem] sm:w-[24rem]" />
          </motion.div>

          <div className="flex flex-col items-center gap-4 md:items-start">
            <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
              <StatusBadge>{heroTexts("availability")}</StatusBadge>
            </motion.div>
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.4 }}
              className="font-data text-sm text-signal"
            >
              {heroTexts("greeting")}
            </motion.p>
            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="font-display text-5xl font-medium leading-[1.05] tracking-tight sm:text-7xl"
            >
              {heroTexts("name")}
            </motion.h1>
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="text-xl text-muted-foreground sm:text-2xl"
            >
              {heroTexts("role")}
            </motion.p>
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="flex flex-wrap justify-center gap-x-3 gap-y-1 font-data text-xs text-muted-foreground md:justify-start"
            >
              {STACK.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </motion.div>
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="max-w-md text-base leading-relaxed text-muted-foreground"
            >
              {heroTexts("summary")}
            </motion.p>
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="flex flex-wrap justify-center gap-3 pt-2 md:justify-start"
            >
              <Button variant="signal" size="cta" nativeButton={false} render={<Link href="/proyectos" />}>
                {heroTexts("cta")}
                <ArrowRight data-icon="inline-end" aria-hidden className="transition-transform group-hover/button:translate-x-1" />
              </Button>
              <Button
                variant="signal-outline"
                size="cta"
                nativeButton={false}
                render={<a href={cvHref(locale)} download />}
              >
                <Download data-icon="inline-start" aria-hidden />
                {heroTexts("cvLabel")}
              </Button>
            </motion.div>
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="flex justify-center md:justify-start">
              <WeatherBadge />
            </motion.div>
          </div>
        </div>
      </motion.div>
      <WaveDivider flip animated />
    </section>
  );
}
