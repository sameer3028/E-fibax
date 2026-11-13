import { apiRequest } from "../../utils/api";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

export const HERO_SLIDES = [
  {
    id: "banner_multivitamin",
    title: "Natural Source of Multivitamin Daily Nutritional Syrup 500ml",
    subtitle: "Complete Daily Nutrition for a Stronger & Healthier You",
    badge: "TOP SELLER",
    chipLabel: "Daily Multivitamin",
    image: "/banners/banner-multivitamin.jpg",
    desktopImage: "/banners/banner-multivitamin.jpg",
    mobileImage: "",
    productSlug: "ayurvedic-multivitamin-syrup",
    concernSlug: "immunity-vitality",
    primaryBtnText: "Shop Now",
    primaryBtnUrl: "product/ayurvedic-multivitamin-syrup",
    alt: "Fibax Ayurveda Multivitamin Daily Nutritional Syrup 500ml Banner"
  },
  {
    id: "banner_axe_ortho",
    title: "Axe Ortho+ Ayurvedic Care for Healthy Joints & Active Life",
    subtitle: "The power of Oil + Syrup + Capsules for complete joint support",
    badge: "TRIPLE THERAPY",
    chipLabel: "Axe Ortho+ Joint Care",
    image: "/banners/banner-axe-ortho.jpg",
    desktopImage: "/banners/banner-axe-ortho.jpg",
    mobileImage: "",
    productSlug: "axe-ortho-oil",
    concernSlug: "pain-joint-care",
    primaryBtnText: "Shop Now",
    primaryBtnUrl: "product/axe-ortho-syrup",
    alt: "Fibax Ayurveda Axe Ortho Joint Care Oil Syrup Capsules Banner"
  },
  {
    id: "banner_triphala",
    title: "Ancient Herbal Care for Modern Life - Triphala Kashayam 500ml",
    subtitle: "Daily Cleansing. Natural Balance. 100% Pure Herbs",
    badge: "HERBAL DETOX",
    chipLabel: "Triphala Kashayam",
    image: "/banners/banner-triphala.jpg",
    desktopImage: "/banners/banner-triphala.jpg",
    mobileImage: "",
    productSlug: "fibax-triphala-juice",
    concernSlug: "digestion-gut-health",
    primaryBtnText: "Shop Now",
    primaryBtnUrl: "products?concern=digestion-gut-health",
    alt: "Fibax Ayurveda Triphala Kashayam Daily Cleansing 500ml Banner"
  }
];

/**
 * Isolated Slide Item with strict art-directed responsive picture selection
 * - Media Query max-width: 767px explicitly routes mobile devices to the uploaded mobile banner.
 * - Media Query min-width: 768px serves the high-resolution desktop banner.
 * - If no mobile image exists, the desktop image is safely contained (object-contain)
 *   on mobile with an ambient blurred glow so no product, text, or offer is cropped.
 * - Isolated keys ensure zero cross-slide image re-use or stale image flashing during transitions.
 */
const SlideItem = React.memo(function SlideItem({
  slide,
  direction,
  variants,
  onBannerClick,
  onPrev,
  onNext
}) {
  const rawMobile = typeof slide.mobileImage === 'string' ? slide.mobileImage.trim() : '';
  const rawDesktop = typeof slide.desktopImage === 'string'
    ? slide.desktopImage.trim()
    : (typeof slide.image === 'string' ? slide.image.trim() : '/banners/banner-multivitamin.jpg');

  const hasMobile = Boolean(rawMobile && rawMobile.length > 0);

  return (
    <motion.div
      key={slide.id}
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={(e, { offset, velocity }) => {
        const swipeThreshold = 50;
        if (offset.x > swipeThreshold || velocity.x > 300) {
          onPrev();
        } else if (offset.x < -swipeThreshold || velocity.x < -300) {
          onNext();
        }
      }}
      onClick={() => onBannerClick(slide)}
      className="absolute inset-0 w-full h-full cursor-pointer select-none"
      title={`${slide.title || 'Fibax Banner'} - Click to shop`}
    >
      {/* Ambient background for fallback desktop banner on mobile screens when no dedicated mobile banner exists */}
      {!hasMobile && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none md:hidden -z-10" aria-hidden="true">
          <img
            src={rawDesktop}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover blur-2xl opacity-40 scale-125"
          />
        </div>
      )}

      <picture className="w-full h-full block">
        {hasMobile && (
          <source
            media="(max-width: 767px)"
            srcSet={rawMobile}
          />
        )}
        <source
          media="(min-width: 768px)"
          srcSet={rawDesktop}
        />
        <img
          key={`img-${slide.id}-${hasMobile ? 'mob' : 'desk'}-${rawDesktop}`}
          src={rawDesktop}
          alt={slide.alt || slide.title || 'Fibax Ayurveda Promotional Banner'}
          className={`w-full h-full ${
            hasMobile ? 'object-cover' : 'max-md:object-contain md:object-cover'
          } object-center pointer-events-none transition-transform duration-700 hover:scale-[1.01]`}
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
      </picture>
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />
    </motion.div>
  );
});

export function HeroBannerSlider({
  products = [],
  onSelectProduct,
  onNavigate,
  onSelectConcern
}) {
  const [slides, setSlides] = useState(HERO_SLIDES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const autoPlayTimerRef = useRef(null);

  // Fetch active Home Page Hero Banners from Admin with cache-busting
  useEffect(() => {
    let isMounted = true;
    const fetchBanners = async () => {
      try {
        const res = await apiRequest(`/api/website/home-banners/active?_t=${Date.now()}`);
        if (isMounted && res.success && Array.isArray(res.data) && res.data.length > 0) {
          const formatted = res.data.map((b, idx) => ({
            id: b.id || ('slide-' + idx),
            title: b.heading || b.title || 'Fibax Ayurveda',
            subtitle: b.description || b.subtitle || '',
            badge: b.badge || '',
            chipLabel: b.chipLabel || b.title || ('Banner ' + (idx + 1)),
            image: (b.desktopImage || b.image || '/banners/banner-multivitamin.jpg').trim(),
            desktopImage: (b.desktopImage || b.image || '/banners/banner-multivitamin.jpg').trim(),
            mobileImage: (b.mobileImage || '').trim(),
            productSlug: b.productSlug || '',
            concernSlug: b.concernSlug || '',
            primaryBtnText: b.primaryBtnText || 'Shop Now',
            primaryBtnUrl: b.primaryBtnUrl || 'products',
            alt: b.altText || b.heading || b.title || 'Fibax Ayurveda Banner',
            updatedAt: b.updatedAt || ''
          }));
          setSlides(formatted);
        } else if (isMounted) {
          setSlides(HERO_SLIDES);
        }
      } catch (err) {
        if (isMounted) setSlides(HERO_SLIDES);
      }
    };
    fetchBanners();
    return () => { isMounted = false; };
  }, []);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % (slides.length || 1));
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + (slides.length || 1)) % (slides.length || 1));
  }, [slides.length]);

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
    if (!slide) return;

    if (slide.primaryBtnUrl) {
      const url = slide.primaryBtnUrl.trim();
      if (url.startsWith('http://') || url.startsWith('https://')) {
        window.open(url, '_blank', 'noopener,noreferrer');
        return;
      }
      if (url.startsWith('products') || url.startsWith('contact') || url.startsWith('about') || url.startsWith('blogs')) {
        const [page, query] = url.split('?');
        const params = {};
        if (query) {
          new URLSearchParams(query).forEach((v, k) => { params[k] = v; });
        }
        if (onNavigate) {
          onNavigate(page, params);
          return;
        }
      }
    }

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

  const currentSlide = slides[currentIndex] || slides[0] || HERO_SLIDES[0];

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
          {/*
            Responsive Aspect Ratio Container:
            - Mobile (< 768px portrait): aspect-[4/5] (1080x1350)
            - Mobile landscape: landscape:aspect-[2.1/1] prevents vertical screen overflow
            - Tablet & Desktop (>= 768px): md:aspect-[2.1/1] (original 1920x650 / 2.1:1 ratio preserved 100%)
          */}
          <div className="relative w-full aspect-[4/5] landscape:aspect-[2.1/1] md:aspect-[2.1/1] overflow-hidden">
            <AnimatePresence initial={false} custom={direction}>
              <SlideItem
                key={currentSlide.id || `slide-${currentIndex}`}
                slide={currentSlide}
                direction={direction}
                variants={slideVariants}
                onBannerClick={handleBannerClick}
                onPrev={prevSlide}
                onNext={nextSlide}
              />
            </AnimatePresence>

            {slides.length > 1 && (
            <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20">
              {slides.map((slide, idx) => {
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
          )}
          </div>
        </div>

        {slides.length > 1 && (
        <div className={`mt-3.5 grid gap-2 sm:gap-4 ${slides.length === 2 ? 'grid-cols-2' : slides.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
          {slides.map((slide, idx) => {
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
        )}
      </div>
    </section>
  );
}
