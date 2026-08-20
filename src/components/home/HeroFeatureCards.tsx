"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export type HeroFeatureCard = {
  title: string;
  description: string;
  highlight: string;
  image: string;
  cta: string;
  href: string;
};

function CardDescription({ text, highlight }: { text: string; highlight: string }) {
  const parts = text.split(highlight);
  if (parts.length === 1) {
    return <p className="text-white/70 text-sm leading-relaxed">{text}</p>;
  }

  return (
    <p className="text-white/70 text-sm leading-relaxed">
      {parts[0]}
      <span className="text-brand-accent font-medium">{highlight}</span>
      {parts[1]}
    </p>
  );
}

export function HeroFeatureCards({ cards }: { cards: readonly HeroFeatureCard[] }) {
  return (
    <div className="w-full max-w-full">
      <div className="flex gap-3 md:gap-4 justify-center lg:justify-end overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-hide">
        {cards.map((card, index) => (
          <motion.article
            key={card.title}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12 + index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="hero-feature-panel relative z-30 snap-center shrink-0 w-[200px] sm:w-[220px] md:w-[210px] lg:w-[200px] xl:w-[220px] 2xl:w-[240px] p-4 sm:p-5 flex flex-col min-h-[300px] sm:min-h-[340px]"
          >
            <h3 className="text-white font-semibold text-base tracking-tight mb-3">{card.title}</h3>
            <CardDescription text={card.description} highlight={card.highlight} />

            <div className="relative flex-1 my-4 min-h-[110px]">
              <Image
                src={card.image}
                alt={card.title}
                fill
                className="object-contain object-center"
                sizes="250px"
              />
            </div>

            <Link
              href={card.href}
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 border border-white/25 text-white text-sm font-semibold hover:bg-white/10 hover:border-white/45 transition-colors"
            >
              {card.cta}
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
