import React from 'react';
import { Check, Minus, Plus, AlertTriangle, AlertCircle } from 'lucide-react';
import { ProductVariant } from '../types';

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariants: Record<string, number>; // variantId -> quantity (0 if unselected)
  lowStockThreshold?: number;
  onToggleVariant: (variantId: string) => void;
  onQuantityChange: (variantId: string, quantity: number) => void;
}

export const VariantSelector: React.FC<VariantSelectorProps> = ({
  variants,
  selectedVariants,
  lowStockThreshold = 10,
  onToggleVariant,
  onQuantityChange,
}) => {
  return (
    <section className="bg-white py-6 px-4 border-t border-stone-100">
      <div className="max-w-xl mx-auto">
        {/* Section Heading */}
        <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mb-4 font-bengali">
          আপনার প্রোডাক্ট নির্বাচন করুন
        </h2>

        {/* Variant Cards */}
        <div className="space-y-3.5">
          {variants.map((variant) => {
            const qty = selectedVariants[variant.id] || 0;
            const isSelected = qty > 0;
            const threshold = variant.lowStockThreshold ?? lowStockThreshold;
            const isOutOfStock = !variant.inStock || variant.stockCount <= 0;
            const isLowStock = !isOutOfStock && variant.stockCount <= threshold;

            return (
              <div
                key={variant.id}
                onClick={() => {
                  if (!isSelected && !isOutOfStock) {
                    onToggleVariant(variant.id);
                  }
                }}
                className={`relative flex items-center gap-3 p-3 rounded-xl transition-all select-none ${
                  isOutOfStock
                    ? 'border border-stone-200 bg-stone-50/70 opacity-60 cursor-not-allowed'
                    : isSelected
                    ? 'border-2 border-amber-600 bg-amber-50/30 shadow-xs cursor-pointer'
                    : 'border border-stone-200 bg-white hover:border-stone-300 cursor-pointer'
                }`}
              >
                {/* Custom Checkbox */}
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isOutOfStock) {
                      onToggleVariant(variant.id);
                    }
                  }}
                  className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                    isOutOfStock
                      ? 'border border-stone-300 bg-stone-200 text-stone-400 cursor-not-allowed'
                      : isSelected
                      ? 'bg-amber-600 text-white'
                      : 'border-2 border-stone-300 hover:border-amber-500 bg-white'
                  }`}
                  aria-label={`Select ${variant.name}`}
                >
                  {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                </button>

                {/* Thumbnail Image */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-stone-100 shrink-0 border border-stone-200 relative">
                  <img
                    src={variant.image}
                    alt={variant.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = '/assets/images/gallery_bottle.jpg';
                    }}
                  />
                  {isLowStock && (
                    <span className="absolute top-1 left-1 bg-amber-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                      Low
                    </span>
                  )}
                </div>

                {/* Content: Title, Low Stock Indicator, Stepper, Price */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <h3 className="text-xs sm:text-sm font-semibold text-stone-800 leading-snug line-clamp-2">
                      {variant.name}
                    </h3>
                  </div>

                  {/* Low Stock / Stock Indicator */}
                  {isLowStock && (
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200/90 px-2 py-0.5 rounded-md mt-1.5 mb-1.5 w-fit">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>
                        Low Stock: মাত্র <strong className="font-bold font-tabular">{variant.stockCount}</strong>টি বাকি
                      </span>
                    </div>
                  )}

                  {isOutOfStock && (
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-stone-500 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-md mt-1.5 mb-1.5 w-fit">
                      <AlertCircle className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>স্টক শেষ (Out of Stock)</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 flex-wrap mt-1">
                    {/* Quantity Stepper */}
                    <div
                      className="flex items-center border border-stone-300 rounded-md overflow-hidden bg-white shadow-2xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          if (qty > 1) {
                            onQuantityChange(variant.id, qty - 1);
                          } else if (qty === 1) {
                            onToggleVariant(variant.id);
                          }
                        }}
                        disabled={!isSelected || isOutOfStock}
                        className="w-8 h-8 flex items-center justify-center text-stone-600 hover:bg-stone-100 active:bg-stone-200 disabled:opacity-40 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      <span className="w-9 text-center text-sm font-bold text-stone-800 font-tabular">
                        {qty > 0 ? qty : 1}
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          if (!isSelected) {
                            onToggleVariant(variant.id);
                          } else {
                            if (qty < variant.stockCount) {
                              onQuantityChange(variant.id, qty + 1);
                            }
                          }
                        }}
                        disabled={isOutOfStock || (isSelected && qty >= variant.stockCount)}
                        className="w-8 h-8 flex items-center justify-center text-stone-600 hover:bg-stone-100 active:bg-stone-200 disabled:opacity-30 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Price in BDT */}
                    <div className="text-right">
                      <span className="text-sm sm:text-base font-bold text-stone-900 font-tabular">
                        {variant.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}৳
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
