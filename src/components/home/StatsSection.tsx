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
    const duration = 2000;
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
      {count}{suffix}
    </span>
  );
}

export function StatsSection() {
  return (
    <section className="relative bg-brand-navy py-16 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(200,212,0,0.03)_50%,transparent_100%)]" />
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="text-center"
            >
              <p className="text-4xl md:text-5xl font-display font-semibold text-brand-accent mb-2">
                <Counter target={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-white/60 text-sm tracking-wide">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
