"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const stats = [
  { value: 80, suffix: "+", label: "Countries Served" },
  { value: 20, suffix: "+", label: "Years of Clinical Data" },
  { value: 2, suffix: "M+", label: "Implants Worldwide" },
  { value: 100, suffix: "%", label: "Genuine Products" },
];

function Counter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 1600;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <span ref={ref} className="tabular-nums">
      {count}
      {suffix}
    </span>
  );
}

export function StatsSection() {
  return (
    <section className="relative bg-brand-navy py-14 md:py-16 border-y border-brand-ink">
      <div className="absolute inset-0 bg-surface-grid bg-grid-sm opacity-20" aria-hidden />
      <div className="container relative mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.45 }}
              className="text-center lg:border-l lg:border-white/10 lg:first:border-l-0"
            >
              <p className="text-3xl md:text-4xl font-display font-semibold text-brand-accent mb-2 tracking-tight">
                <Counter target={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-white/55 text-xs md:text-sm tracking-[0.08em] uppercase">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
