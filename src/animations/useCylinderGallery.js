import { useEffect, useRef } from "react";

export const useCylinderGallery = (itemCount, speed = 30) => {
  const spacing = 320;
  const offsetRef = useRef(0);
  const itemRefs = useRef([]);

  const setItemRef = (index) => (el) => {
    if (el) itemRefs.current[index] = el;
  };

  useEffect(() => {
    let animationId;
    let lastTime = performance.now();

    const animate = (time) => {
      const delta = time - lastTime;
      lastTime = time;

      offsetRef.current += speed * (delta / 8);
      const totalWidth = itemCount * spacing;

      if (speed > 0 && offsetRef.current >= totalWidth) {
        offsetRef.current -= totalWidth;
      }
      if (speed < 0 && offsetRef.current <= -totalWidth) {
        offsetRef.current += totalWidth;
      }

      // Direct DOM manipulation — NO React re-renders
      itemRefs.current.forEach((el, index) => {
        if (!el) return;

        let x = index * spacing - offsetRef.current;

        while (x < -totalWidth / 2) x += totalWidth;
        while (x > totalWidth / 2) x -= totalWidth;

        const dist = Math.abs(x);
        const isActive = dist < spacing * 0.5;

        el.style.transform = `translateX(calc(-50% + ${x}px)) translateY(-50%)`;
        el.style.zIndex = isActive ? 20 : 10;
        el.style.pointerEvents = isActive ? "auto" : "none";
      });

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [speed, itemCount, spacing]);

  return { setItemRef };
};
