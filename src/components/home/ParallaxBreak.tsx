"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { SITE } from "@/lib/site-config";

export function ParallaxBreak() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.4, 1, 1, 0.4]);

  return (
    <section ref={ref} className="relative h-[50vh] min-h-[400px] overflow-hidden flex items-center justify-center">
      <motion.div style={{ y }} className="absolute inset-0 scale-125">
        <Image
          src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1920"
          alt="Dentium clinical excellence"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-brand-navy/80" />
      </motion.div>
      <motion.div style={{ opacity }} className="relative z-10 text-center px-4 max-w-4xl">
        <p className="text-brand-accent text-xs tracking-[0.22em] uppercase mb-4 font-semibold">{SITE.brand} · India</p>
        <h2 className="font-display text-3xl md:text-5xl lg:text-[3.25rem] font-semibold text-white leading-tight text-balance tracking-tight">
          Where Uncertainty Becomes Possibility
        </h2>
        <p className="text-white/60 mt-5 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Confidence for clinicians. Comfort for patients. Innovation for every dental need.
        </p>
      </motion.div>
    </section>
  );
}
