import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

export const HERO_SLIDES = [
  {
    id: "multivitamin",
    title: "Natural Source of Multivitamin Daily Nutritional Syrup 500ml",
    subtitle: "Complete Daily Nutrition for a Stronger & Healthier You",
    badge: "TOP SELLER",
    chipLabel: "Daily Multivitamin",
    image: "/banners/banner-multivitamin.jpg",
    productSlug: "ayurvedic-multivitamin-syrup",
    concernSlug: "immunity-vitality",
    alt: "Fibax Ayurveda Multivitamin Daily Nutritional Syrup 500ml Banner"
  },
  {
    id: "axe-ortho",
    title: "Axe Ortho+ Ayurvedic Care for Healthy Joints & Active Life",
    subtitle: "The power of Oil + Syrup + Capsules for complete joint support",
    badge: "TRIPLE THERAPY",
    chipLabel: "Axe Ortho+ Joint Care",
    image: "/banners/banner-axe-ortho.jpg",
    productSlug: "axe-ortho-oil",
    concernSlug: "pain-joint-care",
    alt: "Fibax Ayurveda Axe Ortho Joint Care Oil Syrup Capsules Banner"
  },
  {
    id: "triphala",
    title: "Ancient Herbal Care for Modern Life - Triphala Kashayam 500ml",
    subtitle: "Daily Cleansing. Natural Balance. 100% Pure Herbs",
    badge: "HERBAL DETOX",
    chipLabel: "Triphala Kashayam",
    image: "/banners/banner-triphala.jpg",
    productSlug: "fibax-triphala-juice",
    concernSlug: "digestion-gut-health",
    alt: "Fibax Ayurveda Triphala Kashayam Daily Cleansing 500ml Banner"
  }
];

export function HeroBannerSlider({
  products = [],
  onSelectProduct,
  onNavigate,
  onSelectConcern
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const autoPlayTimerRef = useRef(null);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  const goToSlide = useCallback((index) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  }, [currentIndex]);

  useEffect(() => {
    if (isPaused) return;

    autoPlayTimerRef.current = setInterval(() => {
      nextSlide();
    }, 5500);

    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
    };
  }, [isPaused, nextSlide]);

  const handleBannerClick = (slide) => {
    if (slide.productSlug && products && products.length > 0 && onSelectProduct) {
      const matched = products.find(
        (p) => p.slug === slide.productSlug || p.title?.toLowerCase().includes(slide.id)
      );
      if (matched) {
        onSelectProduct(matched);
        return;
      }
    }

    if (slide.concernSlug && onNavigate) {
      onNavigate("products", { concern: slide.concernSlug });
      return;
    }

    if (onNavigate) {
      onNavigate("products");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      prevSlide();
    } else if (e.key === "ArrowRight") {
      nextSlide();
    }
  };

  const currentSlide = HERO_SLIDES[currentIndex];

  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring", stiffness: 280, damping: 30 },
        opacity: { duration: 0.35 }
      }
    },
    exit: (dir) => ({
      x: dir < 0 ? "100%" : "-100%",
      opacity: 0,
      transition: {
        x: { type: "spring", stiffness: 280, damping: 30 },
        opacity: { duration: 0.35 }
      }
    })
  };

  return (
    <section
      className="relative py-3 sm:py-5 bg-[#fbf9f4] outline-none"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Promotional Banners Carousel"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-sand-border/80 bg-stone-900 group">
          <div className="relative w-full aspect-[2/1] sm:aspect-[2.1/1] overflow-hidden">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.8}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipeThreshold = 50;
                  if (offset.x > swipeThreshold || velocity.x > 300) {
                    prevSlide();
                  } else if (offset.x < -swipeThreshold || velocity.x < -300) {
                    nextSlide();
                  }
                }}
                onClick={() => handleBannerClick(currentSlide)}
                className="absolute inset-0 w-full h-full cursor-pointer select-none"
                title={currentSlide.title + " - Click to shop"}
              >
                <img
                  src={currentSlide.image}
                  alt={currentSlide.alt}
                  className="w-full h-full object-cover object-center pointer-events-none transition-transform duration-700 hover:scale-[1.01]"
                  loading="eager"
                  fetchPriority="high"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />
              </motion.div>
            </AnimatePresence>


            <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20">
              {HERO_SLIDES.map((slide, idx) => {
                const isActive = idx === currentIndex;
                return (
                  <button
                    key={slide.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      goToSlide(idx);
                    }}
                    className={"transition-all duration-300 rounded-full " + (isActive ? "w-6 sm:w-8 h-2 sm:h-2.5 bg-amber-400 shadow-md" : "w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white/60 hover:bg-white")}
                    aria-label={"Go to slide " + (idx + 1) + ": " + slide.chipLabel}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-3.5 grid grid-cols-3 gap-2 sm:gap-4">
          {HERO_SLIDES.map((slide, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={slide.id}
                onClick={() => goToSlide(idx)}
                className={"p-2 sm:p-3 rounded-xl sm:rounded-2xl text-left border transition-all duration-200 flex items-center justify-between " + (isActive ? "bg-white border-brand shadow-md shadow-brand/10 ring-1 ring-brand/30" : "bg-sand/60 hover:bg-white border-sand-border text-charcoal-muted hover:text-charcoal")}
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <span
                    className={"w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-black shrink-0 " + (isActive ? "bg-brand text-white" : "bg-sand-border text-charcoal-subtle")}
                  >
                    {idx + 1}
                  </span>
                  <div className="truncate">
                    <div
                      className={"text-[11px] sm:text-xs font-bold truncate " + (isActive ? "text-forest-deep" : "text-charcoal")}
                    >
                      {slide.chipLabel}
                    </div>
                    <div className="text-[10px] text-charcoal-muted truncate hidden md:block">
                      {slide.subtitle}
                    </div>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-brand shrink-0">
                  <span>View</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
