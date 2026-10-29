import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { ProductData } from '../types';

interface ProductGalleryProps {
  galleryImages: ProductData['galleryImages'];
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ galleryImages }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  const activeImage = galleryImages[currentIndex] || galleryImages[0];

  return (
    <section className="bg-white py-6 px-4 border-t border-stone-100">
      <div className="max-w-xl mx-auto">
        {/* Section Heading */}
        <h2 className="text-xl sm:text-2xl font-bold text-stone-900 text-center mb-5 font-bengali">
          প্রোডাক্ট ছবিগুলো দেখে নিন
        </h2>

        {/* Carousel Container */}
        <div className="relative flex items-center justify-center">
          {/* Left Arrow Button */}
          <button
            onClick={prevSlide}
            aria-label="Previous slide"
            className="absolute left-1 z-10 p-2 text-amber-600 hover:text-amber-700 bg-white/80 hover:bg-white rounded-full shadow-md transition-all active:scale-95"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
          </button>

          {/* Active Image Card */}
          <div
            onClick={() => setLightboxOpen(true)}
            className="relative w-full max-w-[380px] aspect-square rounded-2xl overflow-hidden bg-stone-50 cursor-zoom-in group shadow-xs border border-stone-100"
          >
            <img
              src={activeImage.url}
              alt={activeImage.caption}
              className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = '/assets/images/gallery_bottle.jpg';
              }}
            />
            <div className="absolute bottom-2 right-2 p-1.5 bg-black/40 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
              <Maximize2 className="w-4 h-4" />
            </div>
          </div>

          {/* Right Arrow Button */}
          <button
            onClick={nextSlide}
            aria-label="Next slide"
            className="absolute right-1 z-10 p-2 text-amber-600 hover:text-amber-700 bg-white/80 hover:bg-white rounded-full shadow-md transition-all active:scale-95"
          >
            <ChevronRight className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center items-center gap-2 mt-4">
          {galleryImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`transition-all duration-200 rounded-full ${
                idx === currentIndex
                  ? 'w-2.5 h-2.5 bg-amber-600'
                  : 'w-2 h-2 bg-stone-300 hover:bg-stone-400'
              }`}
            />
          ))}
        </div>

        {/* Subtitle / Caption */}
        <p className="text-center text-xs text-stone-500 mt-2">
          {activeImage.caption}
        </p>

        {/* Lightbox Modal */}
        {lightboxOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 p-2 text-white bg-white/10 hover:bg-white/20 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={activeImage.url}
              alt={activeImage.caption}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    </section>
  );
};
