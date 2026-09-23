import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getProductImageUrl } from '../../utils/imageUrl';

export default function ImageCarousel({ images = [], productName = 'Product' }) {
  // Ensure at least 3 images available for presentation
  const defaultImages = [
    { id: '1', image_url: '/vitamix-sample.jpg', alt_text: `${productName} Packshot` },
    { id: '2', image_url: '/vitamix-sample.jpg', alt_text: `${productName} Nutrition Details` },
    { id: '3', image_url: '/vitamix-sample.jpg', alt_text: `${productName} Usage & Specs` },
  ];

  const displayImages = images && images.length > 0 ? images : defaultImages;
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="flex flex-col w-full">
      {/* Main Image Stage */}
      <div className="relative w-full aspect-square bg-gradient-to-b from-[#F2F7EC]/90 to-[#EBF3E4] rounded-2xl p-6 sm:p-8 flex items-center justify-center overflow-hidden border border-gray-100 shadow-inner group">
        
        <img
          src={getProductImageUrl(displayImages[currentIndex]?.image_url)}
          alt={displayImages[currentIndex]?.alt_text || productName}
          className="max-h-full max-w-full object-contain drop-shadow-xl transition-all duration-300 transform group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = '/vitamix-sample.jpg';
          }}
        />

        {/* Carousel Arrow Controls */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-amsterdam-dark shadow-md flex items-center justify-center transition-all hover:scale-110 focus:outline-none"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5 text-amsterdam-dark" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-amsterdam-dark shadow-md flex items-center justify-center transition-all hover:scale-110 focus:outline-none"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5 text-amsterdam-dark" />
            </button>
          </>
        )}

        {/* Image Counter Badge */}
        <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-[11px] font-medium tracking-wide">
          {currentIndex + 1} / {displayImages.length}
        </div>
      </div>

      {/* Thumbnails Row */}
      {displayImages.length > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4 overflow-x-auto py-1">
          {displayImages.map((img, idx) => (
            <button
              key={img.id || idx}
              onClick={() => setCurrentIndex(idx)}
              className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden p-1 bg-white border-2 transition-all flex-shrink-0 ${
                currentIndex === idx
                  ? 'border-amsterdam-olive ring-2 ring-amsterdam-lime/30 scale-105 shadow-sm'
                  : 'border-gray-200/80 hover:border-gray-300 opacity-75 hover:opacity-100'
              }`}
            >
              <img
                src={getProductImageUrl(img.image_url)}
                alt={img.alt_text || `Thumbnail ${idx + 1}`}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = '/vitamix-sample.jpg';
                }}
              />
            </button>
          ))}
        </div>
      )}

      {/* Dot Indicators */}
      {displayImages.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {displayImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all ${
                currentIndex === idx
                  ? 'w-6 bg-amsterdam-olive'
                  : 'w-2 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
