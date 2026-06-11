"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { HeroFeatureCards, type HeroFeatureCard } from "@/components/home/HeroFeatureCards";
import type { HeroSlideConfig } from "@/lib/site-config";

type HeroSlide =
  | { kind: "video"; key: string; src: string; poster?: string }
  | {
      kind: "image";
      key: string;
      image: string;
      title: string;
      subtitle?: string;
      description?: string;
      ctaText?: string;
      ctaLink?: string;
    }
  | {
      kind: "showcase";
      key: string;
      image: string;
      eyebrow: string;
      title: string;
      cards: readonly HeroFeatureCard[];
    }
  | {
      kind: "quote";
      key: string;
      image: string;
      eyebrow?: string;
      quote: string;
      quoteAuthor?: string;
    };

type HeroBannerProps = {
  slides: readonly HeroSlideConfig[];
};

const IMAGE_SLIDE_MS = 7000;

function normalizeSlides(slides: readonly HeroSlideConfig[]): HeroSlide[] {
  return slides.map((slide) => {
    const key = slide.id;
    if (slide.kind === "video") {
      return { kind: "video", key, src: slide.src, poster: slide.poster };
    }
    if (slide.kind === "showcase") {
      return {
        kind: "showcase",
        key,
        image: slide.image,
        eyebrow: slide.eyebrow,
        title: slide.title,
        cards: [...slide.cards],
      };
    }
    if (slide.kind === "quote") {
      return {
        kind: "quote",
        key,
        image: slide.image,
        eyebrow: slide.eyebrow,
        quote: slide.quote,
        quoteAuthor: slide.quoteAuthor,
      };
    }
    return {
      kind: "image",
      key,
      image: slide.image,
      title: slide.title,
      subtitle: slide.subtitle,
      description: slide.description,
      ctaText: slide.ctaText,
      ctaLink: slide.ctaLink,
    };
  });
}

function SplitTitle({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold text-white leading-[1.08] overflow-hidden">
      {words.map((word, i) => (
        <span key={i} className="inline-block mr-[0.25em] overflow-hidden">
          <motion.span
            className="inline-block"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.15 + i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </h1>
  );
}

function getSlideImage(slide: HeroSlide): string | undefined {
  if (slide.kind === "video") return slide.poster;
  return slide.image;
}

export function HeroBanner({ slides: slideConfig }: HeroBannerProps) {
  const slides = normalizeSlides(slideConfig);
  const slideCount = slides.length;

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  const activeSlide = slides[current];
  const isVideoSlide = activeSlide?.kind === "video";
  const isContentSlide = activeSlide?.kind !== "video";

  const goTo = (index: number, dir: number) => {
    setDirection(dir);
    setCurrent(index);
  };

  const goNext = () => goTo((current + 1) % slideCount, 1);
  const goPrev = () => goTo((current - 1 + slideCount) % slideCount, -1);

  useEffect(() => {
    if (slideCount <= 1 || isVideoSlide) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % slideCount);
    }, IMAGE_SLIDE_MS);
    return () => clearInterval(timer);
  }, [current, slideCount, isVideoSlide]);

  useEffect(() => {
    if (!isVideoSlide || !videoRef.current || activeSlide.kind !== "video") return;
    videoRef.current.currentTime = 0;
    videoRef.current.play().catch(() => {});
  }, [current, isVideoSlide, activeSlide]);

  const handleVideoEnded = () => {
    if (current + 1 < slideCount) goTo(current + 1, 1);
  };

  if (slideCount === 0) return null;

  const bgImage = getSlideImage(activeSlide);

  return (
    <section ref={ref} className="relative w-full h-svh min-h-svh overflow-hidden">
      <motion.div style={{ y }} className="absolute inset-0 scale-110">
        <AnimatePresence mode="wait" custom={direction}>
          {isVideoSlide && activeSlide.kind === "video" ? (
            <motion.div
              key={activeSlide.key}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0"
            >
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                poster={activeSlide.poster}
                onEnded={handleVideoEnded}
                className="absolute inset-0 w-full h-full object-cover"
              >
                <source src={activeSlide.src} type="video/mp4" />
              </video>
              {activeSlide.poster && (
                <Image src={activeSlide.poster} alt="" fill className="object-cover -z-10" priority />
              )}
            </motion.div>
          ) : (
            isContentSlide && (
              <motion.div
                key={activeSlide.key}
                custom={direction}
                initial={{ opacity: 0, x: direction >= 0 ? 80 : -80 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction >= 0 ? -80 : 80 }}
                transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="absolute inset-0"
              >
                <div className="absolute inset-0 animate-ken-burns">
                  <Image
                    src={bgImage!}
                    alt=""
                    fill
                    className="object-cover"
                    priority={current <= 1}
                  />
                </div>
              </motion.div>
            )
          )}
        </AnimatePresence>

        <div
          className={`absolute inset-0 transition-opacity duration-700 ${
            isVideoSlide
              ? "bg-gradient-to-t from-brand-navy/40 via-transparent to-transparent"
              : activeSlide.kind === "quote"
                ? "bg-gradient-to-r from-brand-navy/90 via-brand-navy/60 to-brand-navy/30"
                : "bg-gradient-to-r from-brand-navy/92 via-brand-navy/55 to-brand-navy/25"
          }`}
        />
        {isContentSlide && activeSlide.kind !== "quote" && (
          <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/70 via-transparent to-brand-navy/20" />
        )}
      </motion.div>

      {isContentSlide && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-brand-accent/5 blur-3xl"
          />
        </div>
      )}

      {isContentSlide && activeSlide.kind === "image" && (
        <motion.div
          key={`overlay-${activeSlide.key}`}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0 z-20 pt-28 pb-20 lg:pb-16 lg:pt-24 pointer-events-none"
        >
          <div className="container mx-auto px-4 lg:px-8 h-full flex items-end lg:items-center pointer-events-auto">
            <div className="max-w-2xl lg:max-w-[40%] xl:max-w-[38%]">
              {activeSlide.subtitle && (
                <p className="text-white/90 text-sm tracking-[0.2em] uppercase mb-4 font-medium">
                  {activeSlide.subtitle}
                </p>
              )}
              <SplitTitle text={activeSlide.title} />
              {activeSlide.description && (
                <p className="text-white/75 text-lg md:text-xl mt-6 mb-8 leading-relaxed max-w-xl">
                  {activeSlide.description}
                </p>
              )}
              {activeSlide.ctaText && activeSlide.ctaLink && (
                <Link href={activeSlide.ctaLink}>
                  <Button size="lg" className="group mt-6 shadow-lg shadow-brand-accent/20">
                    {activeSlide.ctaText}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {isContentSlide && activeSlide.kind === "showcase" && (
        <motion.div
          key={`overlay-${activeSlide.key}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0 z-20 pt-28 pb-28 lg:pb-24 lg:pt-24"
        >
          <div className="container mx-auto px-4 lg:px-8 h-full flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-10">
            <div className="shrink-0 lg:w-[36%] xl:w-[34%]">
              <p className="text-white/90 text-sm tracking-[0.2em] uppercase mb-4 font-medium">
                {activeSlide.eyebrow}
              </p>
              <SplitTitle text={activeSlide.title} />
            </div>

            {activeSlide.cards.length > 0 && (
              <div className="flex-1 min-w-0 flex justify-center lg:justify-end lg:translate-x-8 xl:translate-x-12">
                <HeroFeatureCards cards={activeSlide.cards} />
              </div>
            )}
          </div>
        </motion.div>
      )}

      {isContentSlide && activeSlide.kind === "quote" && (
        <motion.div
          key={`overlay-${activeSlide.key}`}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0 z-20 pt-28 pb-20 lg:pb-16 lg:pt-24 flex items-center"
        >
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl">
              {activeSlide.eyebrow && (
                <p className="text-brand-accent text-sm tracking-[0.2em] uppercase mb-6 font-medium">
                  {activeSlide.eyebrow}
                </p>
              )}
              <blockquote className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium text-white leading-snug">
                &ldquo;{activeSlide.quote}&rdquo;
              </blockquote>
              {activeSlide.quoteAuthor && (
                <p className="mt-8 text-white/70 text-lg tracking-wide">— {activeSlide.quoteAuthor}</p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {slideCount > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/10 hover:bg-brand-accent/20 backdrop-blur-md rounded-full text-white transition-all border border-white/10"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/10 hover:bg-brand-accent/20 backdrop-blur-md rounded-full text-white transition-all border border-white/10"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex gap-3">
            {slides.map((slide, i) => (
              <button
                key={slide.key}
                onClick={() => goTo(i, i > current ? 1 : -1)}
                className="group relative h-1 w-12 bg-white/20 rounded-full overflow-hidden"
                aria-label={slide.kind === "video" ? "Video slide" : "Image slide"}
              >
                <motion.span
                  className="absolute inset-y-0 left-0 bg-brand-accent rounded-full"
                  initial={false}
                  animate={{ width: i === current ? "100%" : "0%" }}
                  transition={{
                    duration: i === current && slide.kind !== "video" ? IMAGE_SLIDE_MS / 1000 : 0.3,
                  }}
                />
              </button>
            ))}
          </div>
        </>
      )}

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 right-6 lg:right-10 z-20 hidden sm:flex flex-col items-center gap-2 text-white/50"
      >
        <span className="text-[10px] tracking-[0.3em] uppercase">Scroll</span>
        <ChevronDown className="w-5 h-5" />
      </motion.div>
    </section>
  );
}
