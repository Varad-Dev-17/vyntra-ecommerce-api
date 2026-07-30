import { useState, useEffect, useRef } from 'react';

export const useHoverCarousel = (images, hoverInterval = 1200, initialDelay = 300) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  // Preload images to ensure smooth transitions
  useEffect(() => {
    if (images && images.length > 1) {
      images.forEach((img) => {
        if (img?.url) {
          const preloadedImg = new Image();
          preloadedImg.src = img.url;
        }
      });
    }
  }, [images]);

  const handleMouseEnter = () => {
    setIsHovering(true);
    if (images && images.length > 1) {
      timeoutRef.current = setTimeout(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        intervalRef.current = setInterval(() => {
          setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, hoverInterval);
      }, initialDelay);
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setCurrentImageIndex(0); // Immediately reset to Image 1
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    currentImageIndex,
    isHovering,
    handlers: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    },
  };
};
