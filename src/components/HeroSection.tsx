import React from 'react';
import { Truck, ShieldCheck, Star, CheckCircle2 } from 'lucide-react';
import { ProductData } from '../types';

interface HeroSectionProps {
  product: ProductData;
  onOrderNowClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  product,
  onOrderNowClick,
}) => {
  return (
    <section className="bg-white pb-6 pt-3 px-4">
      <div className="max-w-xl mx-auto">
        {/* Main Product Hero Image */}
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-stone-100 mb-5 shadow-xs">
          <img
            src="/assets/images/hero_product.jpg"
            alt={product.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => {
              // Fallback to gallery image or fallback placeholder
              e.currentTarget.src = '/assets/images/gallery_bottle.jpg';
            }}
          />
        </div>

        {/* Product Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight leading-snug mb-3 font-serif">
          {product.title}
        </h1>

        {/* Subtitle / Key Description */}
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed mb-4">
          {product.subtitle}
        </p>

        {/* Trust Badges Row */}
        <div className="flex items-center justify-between py-3 border-y border-stone-100 text-amber-700 text-xs sm:text-sm font-semibold mb-5 font-bengali">
          <div className="flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-amber-600 shrink-0" />
            <span>দ্রুত ডেলিভারি</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
            <span>গুণমান নিশ্চিত</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-600 fill-amber-500 shrink-0" />
            <span>সন্তুষ্ট গ্রাহক</span>
          </div>
        </div>

        {/* Feature Checkmarks */}
        <div className="space-y-2.5 mb-6 text-stone-700 text-sm">
          {product.bulletPoints.map((point, index) => (
            <div key={index} className="flex items-start gap-2.5 leading-tight">
              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{point}</span>
            </div>
          ))}
        </div>

        {/* Special Discount Notice Banner */}
        <div className="bg-rose-50 border border-rose-100 rounded-xl p-3.5 mb-5 text-rose-800 text-sm font-bold text-center leading-normal font-bengali shadow-xs">
          {product.discountBanner}
        </div>

        {/* Primary Order Now Call to Action */}
        <button
          onClick={onOrderNowClick}
          className="w-full py-3.5 px-6 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold text-base sm:text-lg rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Order Now</span>
        </button>
      </div>
    </section>
  );
};
