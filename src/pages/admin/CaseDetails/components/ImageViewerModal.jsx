import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ExternalLink } from 'lucide-react';

const ImageViewerModal = ({ isOpen, onClose, images = [], initialIndex = 0 }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  if (!isOpen || !images || images.length === 0) return null;

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setIsZoomed(false);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setIsZoomed(false);
  };

  const currentImgRaw = images[currentIndex] || "";
  const currentImg = typeof currentImgRaw === "object" && currentImgRaw?.url ? currentImgRaw.url : String(currentImgRaw);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 md:p-8 animate-in fade-in duration-200">
      {/* Background clickable overlay to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Modal Container */}
      <div className="relative z-10 max-w-5xl w-full max-h-[90vh] bg-[#12121a] rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header toolbar */}
        <div className="flex items-center justify-between px-6 py-4 bg-black/40 border-b border-white/10 text-white">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-200">
              Evidence Image Inspection
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs font-semibold text-[#8b8dfd]">
              {currentIndex + 1} of {images.length}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsZoomed(!isZoomed)}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors text-gray-300 hover:text-white flex items-center gap-1.5 text-xs font-medium"
              title="Toggle zoom"
            >
              <ZoomIn size={16} />
              {isZoomed ? "Reset Zoom" : "Zoom In"}
            </button>

            <a
              href={currentImg}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl hover:bg-white/10 transition-colors text-gray-300 hover:text-white flex items-center gap-1.5 text-xs font-medium"
              title="Open raw image in new tab"
            >
              <ExternalLink size={16} />
              Open Original
            </a>

            <div className="h-4 w-px bg-white/20 mx-1" />

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/20 transition-colors text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Image preview canvas */}
        <div className="relative grow flex items-center justify-center p-4 min-h-[400px] max-h-[75vh] overflow-auto bg-black/60">
          <img
            src={currentImg}
            alt={`Proof ${currentIndex + 1}`}
            className={`max-h-[70vh] w-auto rounded-lg transition-transform duration-300 ${
              isZoomed ? "scale-150 cursor-zoom-out" : "scale-100 cursor-zoom-in object-contain"
            }`}
            onClick={() => setIsZoomed(!isZoomed)}
            loading="lazy" decoding="async"
          />

          {/* Navigation controls */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 hover:bg-[#4648d4] text-white border border-white/15 transition-all shadow-lg hover:scale-110 focus:outline-none cursor-pointer"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 hover:bg-[#4648d4] text-white border border-white/15 transition-all shadow-lg hover:scale-110 focus:outline-none cursor-pointer"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails footer */}
        {images.length > 1 && (
          <div className="flex items-center justify-center gap-3 px-6 py-3 bg-black/50 border-t border-white/10 overflow-x-auto">
            {images.map((imgItem, idx) => {
              const thumbUrl = typeof imgItem === "object" && imgItem?.url ? imgItem.url : String(imgItem);
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setIsZoomed(false);
                  }}
                  className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all duration-200 shrink-0 cursor-pointer ${
                    currentIndex === idx
                      ? "border-[#4648d4] ring-2 ring-[#4648d4]/50 scale-105 shadow-md"
                      : "border-white/20 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={thumbUrl} alt="thumb" className="w-full h-full object-cover"  loading="lazy" decoding="async" />
                </button>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default ImageViewerModal;
