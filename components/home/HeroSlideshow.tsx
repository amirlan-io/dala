"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

const DESKTOP_HERO_VIDEOS = [
  "/hero/desktop-1.mp4",
  "/hero/desktop-2.mp4",
  "/hero/desktop-3.mp4",
] as const;

const MOBILE_HERO_IMAGES = ["/hero/mobile-1.png", "/hero/mobile-2.png", "/hero/mobile-3.png"] as const;

const FADE_SECONDS = 1.2;
const MOBILE_SLIDE_MS = 4200;

export function HeroSlideshow({ posterImage = "/hero/slide-1.jpg" }: { posterImage?: string }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const currentVideo = useMemo(() => DESKTOP_HERO_VIDEOS[activeIndex], [activeIndex]);
  const currentImage = useMemo(() => MOBILE_HERO_IMAGES[activeIndex], [activeIndex]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % MOBILE_HERO_IMAGES.length);
    }, MOBILE_SLIDE_MS);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0">
      <AnimatePresence mode="sync">
        <motion.video
          key={currentVideo}
          className="absolute inset-0 hidden h-full w-full object-cover object-[center_18%] md:block md:object-center"
          autoPlay
          muted
          loop={false}
          playsInline
          controls={false}
          poster={posterImage}
          preload={activeIndex === 0 ? "auto" : "none"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: FADE_SECONDS, ease: "easeInOut" }}
          onEnded={() => setActiveIndex((prev) => (prev + 1) % DESKTOP_HERO_VIDEOS.length)}
        >
          <source src={currentVideo} type="video/mp4" />
        </motion.video>
      </AnimatePresence>

      <AnimatePresence mode="sync">
        <motion.img
          key={currentImage}
          src={currentImage}
          alt="DALA hero"
          className="absolute inset-0 h-full w-full object-cover object-center md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: FADE_SECONDS, ease: "easeInOut" }}
          loading={activeIndex === 0 ? "eager" : "lazy"}
        />
      </AnimatePresence>

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.65) 40%, rgba(0,0,0,0.28) 70%, rgba(0,0,0,0.06) 100%)",
        }}
      />
    </div>
  );
}
