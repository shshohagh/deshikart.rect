import React from 'react';
import { ShippingOption } from '../types';

interface ShippingSectionProps {
  options: ShippingOption[];
  selectedId: 'inside_dhaka' | 'outside_dhaka';
  onSelect: (id: 'inside_dhaka' | 'outside_dhaka') => void;
}

export const ShippingSection: React.FC<ShippingSectionProps> = ({
  options,
  selectedId,
  onSelect,
}) => {
  return (
    <section className="bg-white py-6 px-4 border-t border-stone-100">
      <div className="max-w-xl mx-auto">
        {/* Section Heading */}
        <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mb-4 font-serif">
          Shipping
        </h2>

        {/* Radio Options */}
        <div className="space-y-3">
          {options.map((opt) => {
            const isSelected = opt.id === selectedId;

            return (
              <div
                key={opt.id}
                onClick={() => onSelect(opt.id)}
                className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all ${
                  isSelected
                    ? 'border-2 border-amber-600 bg-amber-50/20'
                    : 'border border-stone-300 hover:border-stone-400 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Radio Circle */}
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
                      isSelected
                        ? 'border-amber-600 bg-white'
                        : 'border-stone-300 bg-white'
                    }`}
                  >
                    {isSelected && (
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                    )}
                  </div>

                  <span className="text-sm sm:text-base font-semibold text-stone-800 font-bengali">
                    {opt.label}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-sm sm:text-base font-bold text-stone-900 font-tabular">
                    {opt.fee.toLocaleString('en-US', { minimumFractionDigits: 2 })}৳
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
