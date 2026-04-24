'use client'
import { useState, useEffect, useRef } from 'react';
import { Home, Building2, Users, ChevronRight, Sparkles, ChevronDown } from 'lucide-react';
import PropertySearch from '../search/propertysearch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

const DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1920&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1920&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1565008576549-57569a49371d?w=1920&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1553413077-190dd305871c?w=1920&q=80&auto=format&fit=crop'
];

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=20&q=10&auto=format&fit=crop&blur=10',
  'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=20&q=10&auto=format&fit=crop&blur=10',
  'https://images.unsplash.com/photo-1565008576549-57569a49371d?w=20&q=10&auto=format&fit=crop&blur=10',
  'https://images.unsplash.com/photo-1553413077-190dd305871c?w=20&q=10&auto=format&fit=crop&blur=10'
];

const CINEMATIC_PRESETS = [
  { startZoom: 1.15, endZoom: 1.15, startX: -35, endX: 35, startY: 0, endY: 0 },   // Left to Right
  { startZoom: 1.15, endZoom: 1.15, startX: 35, endX: -35, startY: 0, endY: 0 },   // Right to Left
  { startZoom: 1.18, endZoom: 1.18, startX: -30, endX: 30, startY: 0, endY: 0 },   // Left to Right (slower)
  { startZoom: 1.18, endZoom: 1.18, startX: 30, endX: -30, startY: 0, endY: 0 }    // Right to Left (slower)
];

export default function HeroWithBanner() {
  const [bannerImages, setBannerImages] = useState<string[]>(DEFAULT_IMAGES);
  const [loadedImages, setLoadedImages] = useState<HTMLImageElement[]>([]);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const heroRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const router = useRouter();

  // Track current slide and visibility in refs to avoid unnecessary React re-renders
  const currentSlideRef = useRef(0);
  const isHeroVisibleRef = useRef(true);
  const lastFrameTimeRef = useRef(0);

  const transitionStartTime = useRef<number>(0);
  const isTransitioning = useRef(false);
  const targetSlide = useRef(0);
  const slideStartTime = useRef<number>(Date.now());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setPrefersReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    fetchBannerImages();
  }, []);

  useEffect(() => {
    if (bannerImages.length === 0) return;

    const generatePlaceholderUrl = (src: string): string => {
      if (src.includes('unsplash.com')) {
        const url = src.replace(/w=\d+/, 'w=20').replace(/q=\d+/, 'q=10');
        return url.includes('blur=') ? url : url + '&blur=10';
      }
      return src;
    };

    const isUsingDefaultImages =
      bannerImages.length === DEFAULT_IMAGES.length &&
      bannerImages.every((img, index) => img === DEFAULT_IMAGES[index]);

    const placeholderUrls = isUsingDefaultImages
      ? PLACEHOLDER_IMAGES
      : bannerImages.map(generatePlaceholderUrl);

    const placeholderPromises = placeholderUrls.map((src) => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        if (src.includes('unsplash.com')) {
          img.crossOrigin = 'anonymous';
        }
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    });

    Promise.all(placeholderPromises)
      .then((placeholders) => {
        setLoadedImages(placeholders); 
      })
      .catch(() => undefined);

    const highResPromises = bannerImages.map((src, index) => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();

        if (src.includes('unsplash.com')) {
          img.crossOrigin = 'anonymous';
        }

        // Add priority hint for first image
        if (index === 0) {
          img.fetchPriority = 'high';
        }
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    });

    Promise.all(highResPromises)
      .then((images) => {
        setLoadedImages(images); 
      })
      .catch(() => undefined);
  }, [bannerImages]);

  useEffect(() => {
    if (loadedImages.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', {
      alpha: false,
      desynchronized: true,
      willReadFrequently: false
    });
    if (!ctx) return;

    const isSmallScreen = window.innerWidth < 640;
    const frameInterval = isSmallScreen ? 66 : 40;

    const resizeCanvas = () => {
      // Slightly lower DPR cap to reduce fill rate cost
      const dpr = Math.min(window.devicePixelRatio || 1, isSmallScreen ? 1.1 : 1.4);
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      // Reset transform before applying new scale to avoid accumulation
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = isSmallScreen ? 'medium' : 'high';
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    if (prefersReducedMotion) {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.2);
      const canvasWidth = canvas.width / dpr;
      const canvasHeight = canvas.height / dpr;
      const staticImage = loadedImages[currentSlideRef.current] || loadedImages[0];
      if (staticImage) {
        drawImageWithCinematicMovement(ctx, canvasWidth, canvasHeight, staticImage, 0, 0, 1);
      }
      return () => {
        window.removeEventListener('resize', resizeCanvas);
      };
    }

    const animate = () => {
      if (!ctx || loadedImages.length === 0) return;

      const now = Date.now();

      // Throttle for smoother battery/CPU behavior on small screens.
      if (now - lastFrameTimeRef.current < frameInterval) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }
      lastFrameTimeRef.current = now;
      const currentIndex = currentSlideRef.current;
      const currentImg = loadedImages[currentIndex];
      const nextImg = loadedImages[targetSlide.current];

      const slideProgress = Math.min((now - slideStartTime.current) / (isSmallScreen ? 12000 : 10000), 1);
      const easeProgress = slideProgress; // Linear for video-like feel

      // If hero is not visible or tab is hidden, skip heavy drawing work
      if (!isHeroVisibleRef.current || typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      const effectiveDpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const canvasWidth = canvas.width / effectiveDpr;
      const canvasHeight = canvas.height / effectiveDpr;

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      if (isTransitioning.current) {
        const transitionDuration = prefersReducedMotion ? 200 : 1200;
        const transitionProgress = Math.min((now - transitionStartTime.current) / transitionDuration, 1);
        const fadeProgress = transitionProgress; // Linear fade for video-like feel

        drawImageWithCinematicMovement(ctx, canvasWidth, canvasHeight, currentImg, currentIndex, easeProgress, 1 - fadeProgress);

        drawImageWithCinematicMovement(ctx, canvasWidth, canvasHeight, nextImg, targetSlide.current, 0, fadeProgress);

        if (transitionProgress >= 1) {
          isTransitioning.current = false;
          currentSlideRef.current = targetSlide.current;
          slideStartTime.current = now;
        }
      } else {
        drawImageWithCinematicMovement(ctx, canvasWidth, canvasHeight, currentImg, currentIndex, easeProgress, 1);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    const slideInterval = setInterval(() => {
      if (!isTransitioning.current) {
        const nextIndex = (currentSlideRef.current + 1) % loadedImages.length;
        startTransition(nextIndex);
      }
    }, prefersReducedMotion ? 20000 : 10000);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      clearInterval(slideInterval);
    };
  }, [loadedImages, prefersReducedMotion]);

  // Track when the hero is actually visible in the viewport, to avoid heavy work when scrolled away
  useEffect(() => {
    if (!heroRef.current) return;

    const element = heroRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isHeroVisibleRef.current = entry.isIntersecting;
      },
      {
        threshold: 0.1
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  const drawImageWithCinematicMovement = (
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
    img: HTMLImageElement,
    slideIndex: number,
    progress: number,
    opacity: number
  ) => {
    const preset = CINEMATIC_PRESETS[slideIndex % CINEMATIC_PRESETS.length];

    const currentZoom = preset.startZoom + (preset.endZoom - preset.startZoom) * progress;
    const currentX = preset.startX + (preset.endX - preset.startX) * progress;
    const currentY = preset.startY + (preset.endY - preset.startY) * progress;

    ctx.save();
    ctx.globalAlpha = opacity;

    const canvasAspect = canvasWidth / canvasHeight;
    const imgAspect = img.width / img.height;

    let drawWidth, drawHeight, offsetX, offsetY;

    if (canvasAspect > imgAspect) {
      drawWidth = canvasWidth;
      drawHeight = canvasWidth / imgAspect;
      offsetX = 0;
      offsetY = (canvasHeight - drawHeight) / 2;
    } else {
      drawWidth = canvasHeight * imgAspect;
      drawHeight = canvasHeight;
      offsetX = (canvasWidth - drawWidth) / 2;
      offsetY = 0;
    }

    const zoomedWidth = drawWidth * currentZoom;
    const zoomedHeight = drawHeight * currentZoom;
    const zoomOffsetX = offsetX - (zoomedWidth - drawWidth) / 2 + currentX;
    const zoomOffsetY = offsetY - (zoomedHeight - drawHeight) / 2 + currentY;

    ctx.drawImage(img, zoomOffsetX, zoomOffsetY, zoomedWidth, zoomedHeight);
    ctx.restore();
  };

  const startTransition = (nextIndex: number) => {
    if (isTransitioning.current) return;
    targetSlide.current = nextIndex;
    isTransitioning.current = true;
    transitionStartTime.current = Date.now();
  };

  const fetchBannerImages = async () => {
    try {
      const response = await fetch('/api/banner-images');
      const data = await response.json();

      if (response.ok) {
        if (data.images && data.images.length > 0) {
          setBannerImages(data.images);
          return;
        }
      }
    } catch {
      // Fall back to default hero images silently.
    }
  };

  const scrollToNextSection = () => {
    const heroHeight = window.innerHeight;
    window.scrollTo({
      top: heroHeight,
      behavior: 'smooth'
    });
  };

  return (
    <section
      ref={heroRef}
      className="relative w-full h-screen min-h-[600px] max-h-[1080px] overflow-hidden"    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ display: 'block' }}
      />

      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* Global vertical darkening for legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/22 to-black/40"></div>

        {/* Stronger bottom fade so cards and lower text always read well */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/50 via-black/34 to-transparent"></div>

        {/* Subtle top fade to keep navbar area readable on bright skies */}
        <div className="absolute top-0 left-0 right-0 h-1/4 bg-gradient-to-b from-black/28 via-black/15 to-transparent"></div>

        {/* Focused center vignette behind headline + search for busy images */}
        <div className="absolute inset-x-[5%] top-[10%] bottom-[30%] bg-gradient-radial from-black/45 via-black/30 to-transparent opacity-90" />
      </div>

      <div className="absolute inset-0 z-20 flex flex-col items-center px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 md:pt-12 lg:pt-10 pb-24 md:pb-28 overflow-y-auto">
      <div className="w-full max-w-7xl mx-auto flex flex-col justify-between min-h-full gap-4 sm:gap-5 md:gap-6">
                  <div className="text-center space-y-2 sm:space-y-2.5 animate-cinematic-entry">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/12 border border-white/25 shadow-xl mb-2 sm:mb-3 hover:bg-white/18 transition-all duration-300">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#d07648] animate-pulse" />
              <span className="text-[11px] sm:text-sm font-semibold text-white tracking-wide">
                India's Most Advanced Property Platform
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold leading-tight text-white drop-shadow-2xl tracking-tight">
              List. Discover. Connect.
            </h1>

            <p className="text-sm sm:text-base md:text-lg max-w-4xl mx-auto text-white/95 drop-shadow-lg font-medium">
              Properties by Owners, Agents & Builders – All in One Place
            </p>
          </div>

          {/* Search Section with responsive spacing */}
          <div className="w-full max-w-4xl mx-auto animate-slide-up-delayed-1">
                                    <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-[#13a8b4]/20 via-[#d07648]/25 to-[#13a8b4]/20 blur-xl opacity-60 rounded-3xl"></div>
              <div className="relative">
                <PropertySearch />
              </div>
            </div>
          </div>

          {/* Cards Section with tighter top spacing on large screens */}
          <div className="w-full max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 lg:gap-4 animate-slide-up-delayed-2 px-0 sm:px-0">
            <Card
              onClick={() => router.push('/property')}
              className="group relative gap-0 py-0 cursor-pointer overflow-hidden rounded-2xl border border-white/50 bg-white/60 text-slate-900 shadow-xl shadow-black/20 ring-1 ring-white/20 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/65 hover:border-white/60 hover:shadow-2xl hover:shadow-black/25"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-2/5 rounded-t-[inherit] bg-gradient-to-b from-white/30 to-transparent" aria-hidden />
              <div className="absolute -inset-1 -z-10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:bg-white/25 group-hover:opacity-100" />

              <CardHeader className="relative space-y-0 pb-2 pt-4 px-4 sm:px-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#13a8b4]/30 bg-[#13a8b4] shadow-md transition-all duration-300 group-hover:scale-105 group-hover:bg-[#13a8b4] group-hover:border-[#13a8b4]/55 sm:h-11 sm:w-11">
                    <Home className="h-5 w-5 text-white sm:h-5 sm:w-5" />
                  </div>
                  <CardTitle className="home-hero-card-title min-w-0 pt-0.5 group-hover:text-slate-900">
                    Property Owner
                  </CardTitle>
                </div>
              </CardHeader>

              <CardContent className="relative space-y-3 px-4 pb-4 pt-0 sm:px-4">
                <CardDescription className="home-hero-card-body text-slate-800/95 font-medium">
                  List your warehouse or commercial property and connect with verified buyers
                </CardDescription>
                <div className="home-hero-card-cta flex items-center gap-1.5 pt-1 text-[#a85832] font-semibold transition-all duration-300 group-hover:gap-2 group-hover:text-[#8e4c2d]">
                  <span>Get Started</span>
                  <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 transform group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </CardContent>
            </Card>

            <Card
              onClick={() => router.push('/agent/join')}
              className="group relative gap-0 py-0 cursor-pointer overflow-hidden rounded-2xl border border-white/50 bg-white/60 text-slate-900 shadow-xl shadow-black/20 ring-1 ring-white/20 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/65 hover:border-white/60 hover:shadow-2xl hover:shadow-black/25"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-2/5 rounded-t-[inherit] bg-gradient-to-b from-white/30 to-transparent" aria-hidden />
              <div className="absolute -inset-1 -z-10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:bg-white/25 group-hover:opacity-100" />

              <CardHeader className="relative space-y-0 pb-2 pt-4 px-4 sm:px-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#13a8b4]/30 bg-[#13a8b4] shadow-md transition-all duration-300 group-hover:scale-105 group-hover:bg-[#13a8b4] group-hover:border-[#13a8b4]/55 sm:h-11 sm:w-11">
                    <Users className="h-5 w-5 text-white sm:h-5 sm:w-5" />
                  </div>
                  <CardTitle className="home-hero-card-title min-w-0 pt-0.5 group-hover:text-slate-900">
                    Real Estate Agent
                  </CardTitle>
                </div>
              </CardHeader>

              <CardContent className="relative space-y-3 px-4 pb-4 pt-0 sm:px-4">
                <CardDescription className="home-hero-card-body text-slate-800/95 font-medium">
                  Manage multiple properties and connect with potential clients efficiently
                </CardDescription>
                <div className="home-hero-card-cta flex items-center gap-1.5 pt-1 text-[#a85832] font-semibold transition-all duration-300 group-hover:gap-2 group-hover:text-[#8e4c2d]">
                  <span>Join Now</span>
                  <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 transform group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </CardContent>
            </Card>

            <Card
              onClick={() => router.push('/customer')}
              className="group relative gap-0 py-0 cursor-pointer overflow-hidden rounded-2xl border border-white/50 bg-white/60 text-slate-900 shadow-xl shadow-black/20 ring-1 ring-white/20 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/65 hover:border-white/60 hover:shadow-2xl hover:shadow-black/25 sm:col-span-2 lg:col-span-1"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-2/5 rounded-t-[inherit] bg-gradient-to-b from-white/30 to-transparent" aria-hidden />
              <div className="absolute -inset-1 -z-10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:bg-white/25 group-hover:opacity-100" />

              <CardHeader className="relative space-y-0 pb-2 pt-4 px-4 sm:px-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#13a8b4]/30 bg-[#13a8b4] shadow-md transition-all duration-300 group-hover:scale-105 group-hover:bg-[#13a8b4] group-hover:border-[#13a8b4]/55 sm:h-11 sm:w-11">
                    <Building2 className="h-5 w-5 text-white sm:h-5 sm:w-5" />
                  </div>
                  <CardTitle className="home-hero-card-title min-w-0 pt-0.5 group-hover:text-slate-900">
                    Company / Customer
                  </CardTitle>
                </div>
              </CardHeader>

              <CardContent className="relative space-y-3 px-4 pb-4 pt-0 sm:px-4">
                <CardDescription className="home-hero-card-body text-slate-800/95 font-medium">
                  Find the perfect warehouse or commercial space for your business needs
                </CardDescription>
                <div className="home-hero-card-cta flex items-center gap-1.5 pt-1 text-[#a85832] font-semibold transition-all duration-300 group-hover:gap-2 group-hover:text-[#8e4c2d]">
                  <span>Find Space</span>
                  <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 transform group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>

      <button
        onClick={scrollToNextSection}
        className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-30 group cursor-pointer"
        aria-label="Scroll to next section"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-white/15 border-2 border-white/35 flex items-center justify-center group-hover:bg-white/25 group-hover:border-white/50 transition-all duration-300 group-hover:scale-110 shadow-xl">
            <ChevronDown className="w-6 h-6 text-white drop-shadow-lg" />
          </div>
          <span className="text-xs text-white/90 font-medium tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-md">
            Scroll Down
          </span>
        </div>
      </button>

      <style jsx>{`
        @keyframes cinematic-entry {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up-delayed {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-15px);
          }
        }

        @keyframes arrow-pulse {
          0%, 100% {
            opacity: 1;
            transform: translateY(0);
          }
          50% {
            opacity: 0.6;
            transform: translateY(5px);
          }
        }

        .animate-cinematic-entry {
          animation: cinematic-entry 1.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .animate-slide-up-delayed-1 {
          animation: slide-up-delayed 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both;
        }

        .animate-slide-up-delayed-2 {
          animation: slide-up-delayed 1s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2.5s ease-in-out infinite;
        }

        .animate-arrow-pulse {
          animation: arrow-pulse 2s ease-in-out infinite;
        }

        /* Performance optimizations */
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        canvas {
          image-rendering: auto;
          image-rendering: -webkit-optimize-contrast;
          will-change: transform;
          transform: translateZ(0);
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-cinematic-entry,
          .animate-slide-up-delayed-1,
          .animate-slide-up-delayed-2 {
            animation: none;
          }
        }

        /* (Glassmorphism blur on hero cards was reduced/removed for scroll performance) */
      `}</style>
    </section>
  );
}