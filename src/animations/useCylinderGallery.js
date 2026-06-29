import { useState, useEffect, useCallback } from "react";

export const useCylinderGallery = (itemCount, speed = 50) => {
  const [offset, setOffset] = useState(0);
  const spacing = 420;

  useEffect(() => {
    let animationId;
    let lastTime = performance.now();

    const animate = (time) => {
      const delta = time - lastTime;
      lastTime = time;

      setOffset((prev) => {
        const newOffset = prev + speed * (delta / 8);
        const totalWidth = itemCount * spacing;
        if (newOffset >= totalWidth) {
          return newOffset - totalWidth;
        }
        return newOffset;
      });

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [speed, itemCount, spacing]);

  const getItemStyle = useCallback(
    (index) => {
      const totalWidth = itemCount * spacing;

      let x = index * spacing - offset;

      while (x < -totalWidth / 2) x += totalWidth;
      while (x > totalWidth / 2) x -= totalWidth;

      const dist = Math.abs(x);

      const zoomRange = spacing * 6.0;
      const normalized = Math.min(dist / zoomRange, 1);
      const zoomCurve = Math.pow(Math.cos((normalized * Math.PI) / 2), 0.6);

      const scale = 0.72 + zoomCurve * 0.35;

      const isActive = dist < spacing * 0.5;

      let opacity;
      if (dist < spacing * 2.5) opacity = 1;
      else opacity = 0;

      const zIndex = Math.round(100 - dist);
      const rotateY = x > 0 ? -12 : x < 0 ? 12 : 0;
      const y = isActive ? -10 : 0;

      return {
        x,
        y,
        z: isActive ? 150 : 50,
        rotateY,
        scale,
        opacity,
        zIndex,
        isActive,
      };
    },
    [offset, itemCount, spacing]
  );

  return { getItemStyle };
};