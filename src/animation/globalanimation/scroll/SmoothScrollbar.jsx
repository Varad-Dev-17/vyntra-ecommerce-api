import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

const SmoothScrollbar = () => {
  const { scrollYProgress } = useScroll();

  // Super smooth spring for the scrollbar thumb
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const [scrollPercentage, setScrollPercentage] = useState(0);

  useEffect(() => {
    return scrollYProgress.on("change", (latest) => {
      setScrollPercentage(Math.round(latest * 100));
    });
  }, [scrollYProgress]);

  return (
    <>
      {/* Progress bar on top */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-0.5 bg-[#4648d4] origin-left z-9999"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Custom scrollbar on right */}
      <div className="fixed right-1 top-1/2 -translate-y-1/2 w-0.75 h-25 bg-[#4648d4]/10 rounded-full z-9999 hidden md:block">
        <motion.div
          className="w-full bg-[#4648d4] rounded-full"
          style={{
            height: `${scrollPercentage}%`,
            y: scaleY,
          }}
        />
      </div>
    </>
  );
};

export default SmoothScrollbar;
