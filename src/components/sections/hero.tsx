"use client";

import { motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { AvatarRing } from "@/components/sections/avatar-ring";
import { WaveDivider } from "@/components/ui/wave-divider";
import { fadeUp, staggerContainer } from "@/lib/motion";

const STACK = ["React", "React Native", "Node.js", "TypeScript"];

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
        className="bg-card px-6 py-16 sm:py-20"
      >
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-10 text-center md:flex-row md:items-center md:justify-center md:gap-14 md:text-left">
          <motion.div
            variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }}
            transition={{ duration: 0.6 }}
          >
            <AvatarRing size="size-36 sm:size-44" imgSize={176} />
          </motion.div>

          <div className="flex flex-col items-center gap-4 md:items-start">
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
              <Button className="rounded-sm" render={<Link href="/proyectos" />}>
                {heroTexts("cta")}
              </Button>
              <Button
                className="rounded-sm"
                variant="outline"
                render={<a href={`/cv/jhonier-santana-cv-${locale}.pdf`} download />}
              >
                {heroTexts("cvLabel")}
              </Button>
            </motion.div>
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="flex flex-wrap justify-center gap-x-5 gap-y-1 pt-1 font-data text-xs text-muted-foreground md:justify-start"
            >
              <a href="mailto:jhonier_2504@hotmail.com" className="hover:text-signal transition-colors">
                jhonier_2504@hotmail.com
              </a>
              <a href="tel:+573215477347" className="hover:text-signal transition-colors">
                +57 321 547 7347
              </a>
              <span>Socorro, Santander, CO</span>
            </motion.div>
          </div>
        </div>
      </motion.div>
      <WaveDivider flip animated />
    </section>
  );
}
