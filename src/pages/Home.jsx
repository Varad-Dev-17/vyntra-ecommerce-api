import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import CategorySection from "../components/Category";
import Newsletter from "../components/NewsLetter";
import TrendingProducts from "../components/TrendingProducts";

import intro from "../../public/videos/Intro_Video_Compressed.mp4";

import {
  fadeInUp,
  staggerContainer,
  scrollRevealUp,
  scrollStaggerContainer,
  scrollStaggerItem,
  videoTextReveal,
} from "../animations/variant";

import { useParallax, useParallaxOpacity } from "../animations/useParallax";

// ═══════════════════════════════════════════════════════════
//  VIDEO HERO COMPONENT
// ═══════════════════════════════════════════════════════════
const VideoHero = () => {
  const videoRef = useRef(null);
  const [showText, setShowText] = useState(false);
  const [textVisible, setTextVisible] = useState(false);

  const { ref: heroRef, opacity: overlayOpacity } = useParallaxOpacity({});

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.play().catch(() => {});

    const handleTimeUpdate = () => {
      if (video.currentTime >= 1.5 && !showText) {
        setShowText(true);
        setTimeout(() => setTextVisible(true), 100);
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, [showText]);

  return (
    <section ref={heroRef} className="relative h-screen w-full overflow-hidden">
      {/* VIDEO BACKGROUND */}
      <div className="absolute inset-0 w-full h-full">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source src={intro} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* VERY LIGHT OVERLAY */}
      <motion.div
        style={{ opacity: overlayOpacity }}
        className="absolute inset-0 bg-black/5"
      />

      {/* TEXT CONTENT — BOTTOM LEFT */}
      <div className="relative z-10 h-full flex items-end px-6 md:px-16 lg:px-20 pb-20 md:pb-28">
        <motion.div
          initial="hidden"
          animate={textVisible ? "visible" : "hidden"}
          variants={staggerContainer}
          className="text-left"
        >
          {/* Welcome to — solid white */}
          <motion.h1
            variants={videoTextReveal}
            custom={0}
            className="font-['Panchang'] text-5xl md:text-6xl lg:text-[90px] font-extrabold text-white drop-shadow-2xl leading-[0.9]"
            style={{ letterSpacing: "-0.03em" }}
          >
            Welcome to
          </motion.h1>

          {/* Vyntra — gradient text (logo colors) */}
          <motion.h1
            variants={videoTextReveal}
            custom={1}
            className="font-['Panchang'] text-5xl md:text-7xl lg:text-[190px] font-extrabold leading-[0.9]"
            style={{
              letterSpacing: "-0.03em",
              background:
                "linear-gradient(90deg, #1a1a5e 0%, #2d2d8a 15%, #4648d4 40%, #6b38d4 60%, #8a5cf6 80%, #a78bfa 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              color: "transparent",
              filter: "drop-shadow(0 4px 20px rgba(70, 72, 212, 0.4))",
            }}
          >
            Vyntra
          </motion.h1>
        </motion.div>
      </div>

      {/* SCROLL INDICATOR */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: textVisible ? 1 : 0 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 rounded-full border-2 border-white/50 flex items-start justify-center p-1"
        >
          <motion.div className="w-1.5 h-3 bg-white/70 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
};

// ═══════════════════════════════════════════════════════════
//  PARALLAX SECTION WRAPPER
// ═══════════════════════════════════════════════════════════
const ParallaxSection = ({ children, className = "" }) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={scrollRevealUp}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════
//  FEATURED BANNER
// ═══════════════════════════════════════════════════════════
const FeaturedBanner = () => {
  const { ref, y } = useParallax({ speed: 0.3 });

  return (
    <section ref={ref} className="relative py-24 overflow-hidden bg-[#fcf8ff]">
      <motion.div
        style={{ y }}
        className="absolute inset-0 w-full h-[130%] top-[-15%]"
      >
        <img
          src="https://images.unsplash.com/photo-1758520388383-55023490a258?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Fashion lifestyle"
          className="w-full h-full object-cover opacity-65"
        />
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={scrollStaggerContainer}
          className="text-center"
        >
          <motion.span
            variants={scrollStaggerItem}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold tracking-[0.2em] uppercase mb-6"
            style={{
              background: "rgba(70,72,212,0.1)",
              color: "#4648d4",
              fontFamily: "'Geist', sans-serif",
            }}
          >
            New Collection 2026
          </motion.span>

          <motion.h2
            variants={scrollStaggerItem}
            className="font-['PP_Mori'] text-4xl md:text-6xl font-extrabold text-[#1b1b23] mb-6"
            style={{ letterSpacing: "-0.02em" }}
          >
            Effortless Grace.
            <br />
            <span className="text-[#4648d4]">Timeless Style.</span>
          </motion.h2>

          <motion.p
            variants={scrollStaggerItem}
            className="font-['Be_Vietnam_Pro'] text-[#767586] text-lg max-w-xl mx-auto mb-8 leading-relaxed"
          >
            Discover curated pieces that celebrate the modern woman — where
            confidence meets refined simplicity in every stitch.
          </motion.p>

          <motion.div variants={scrollStaggerItem}>
            <Link to="/products">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 rounded-2xl bg-[#4648d4] text-white font-['Be_Vietnam_Pro'] font-bold text-lg hover:bg-[#6b38d4] transition-all duration-300 shadow-lg shadow-[#4648d4]/25"
              >
                Explore Collection
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

// ═══════════════════════════════════════════════════════════
//  MAIN HOME PAGE
// ═══════════════════════════════════════════════════════════
const Home = () => {
  return (
    <div className="bg-[#fcf8ff]">
      {/* ═══ VIDEO HERO ═══ */}
      <VideoHero />

      {/* ═══ CATEGORY SECTION ═══ */}
      <ParallaxSection>
        <CategorySection />
      </ParallaxSection>

      {/* ═══ FEATURED BANNER ═══ */}
      <FeaturedBanner />

      {/* ═══ TRENDING PRODUCTS ═══ */}
      <ParallaxSection>
        <TrendingProducts />
      </ParallaxSection>

      {/* ═══ NEWSLETTER ═══ */}
      <ParallaxSection>
        <Newsletter />
      </ParallaxSection>
    </div>
  );
};

export default Home;
