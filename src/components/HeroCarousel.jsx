import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    id: 1,
    tag: "NEW ARRIVALS 2026",
    title: "Ethereal Comfort.\nMinimalist Soul.",
    subtitle:
      "Curating a sophisticated collection of high-fashion and minimalist essentials designed for the modern individual.",
    cta: "Explore Collection",
    image:
      "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1600&auto=format&fit=crop&q=80",
  },
  {
    id: 2,
    tag: "FASHION ESSENTIALS",
    title: "Effortless Grace.\nTimeless Style.",
    subtitle:
      "Discover curated pieces that celebrate the modern woman — where confidence meets refined simplicity in every stitch.",
    cta: "Shop Women's Fashion",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1600&auto=format&fit=crop&q=80",
  },
  {
    id: 3,
    tag: "CURATED LIVING",
    title: "Artistry in Every Detail.",
    subtitle:
      "Discover a selection of home decor that blends sculptural form with functional elegance, designed for the modern minimalist.",
    cta: "Shop Decor",
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1600&auto=format&fit=crop&q=80",
  },
];

const slideVariants = {
  enter: { opacity: 0, scale: 1.05 },
  center: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

const textVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15 + 0.3, duration: 0.6, ease: "easeOut" },
  }),
};

const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      next();
    }, 8000);
    return () => clearInterval(timer);
  }, [current]);

  const next = () => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const prev = () => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goTo = (index) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  };

  return (
    <div className="relative w-full h-[90vh] md:h-[90vh] overflow-hidden">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={current}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0"
        >
          {/* Image container with overflow hidden to crop top/bottom */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.img
              src={slides[current].image}
              alt={slides[current].tag}
              className="w-full h-full object-cover object-center"
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 6, ease: "linear" }}
            />
          </div>

          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/20" />

          {/* Text content */}
          <div className="relative z-10 h-full flex items-center px-5 md:px-20 max-w-360 mx-auto">
            <div className="max-w-2xl text-white">
              <motion.p
                custom={0}
                variants={textVariants}
                initial="hidden"
                animate="visible"
                className="font-['Manrope'] text-base md:text-base tracking-widest uppercase mb-4 text-white/80 font-extrabold"
              >
                {slides[current].tag}
              </motion.p>

              <motion.h1
                custom={1}
                variants={textVariants}
                initial="hidden"
                animate="visible"
                className="font-['Manrope'] font-extrabold text-[40px] md:text-[64px] leading-[1.1] md:leading-18 tracking-[-0.04em] mb-6 text-white drop-shadow-lg"
                style={{ whiteSpace: "pre-line" }}
              >
                {slides[current].title}
              </motion.h1>

              <motion.p
                custom={2}
                variants={textVariants}
                initial="hidden"
                animate="visible"
                className="font-['Manrope'] font-normal text-base md:text-lg leading-7 text-white/90 max-w-lg mb-10"
              >
                {slides[current].subtitle}
              </motion.p>

              <motion.button
                custom={3}
                variants={textVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#2c2abc] hover:bg-[#4648d4] text-white px-8 py-4 rounded-full font-['Manrope'] font-semibold text-base md:text-lg transition-all shadow-lg hover:shadow-[#2c2abc]/40"
              >
                {slides[current].cta}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation arrows */}
      <motion.button
        onClick={prev}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-4 rounded-full z-20"
        style={{
          background: "rgba(255, 255, 255, 0.2)",
          backdropFilter: "blur(12px)",
        }}
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </motion.button>

      <motion.button
        onClick={next}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-4 rounded-full z-20"
        style={{
          background: "rgba(255, 255, 255, 0.2)",
          backdropFilter: "blur(12px)",
        }}
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </motion.button>

      {/* Dot indicators */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {slides.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => goTo(index)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            className={`h-1 rounded-full transition-all ${
              index === current ? "bg-white" : "bg-white/40"
            }`}
            animate={{ width: index === current ? 64 : 48 }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
