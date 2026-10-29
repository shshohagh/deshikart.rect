import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ProductVariant } from '../types';

interface OrderSummaryProps {
  selectedItems: {
    variant: ProductVariant;
    quantity: number;
  }[];
  shippingFee: number;
  subtotal: number;
  total: number;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  selectedItems,
  shippingFee,
  subtotal,
  total,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <section className="bg-stone-50 py-4 px-4 border-t border-b border-stone-200">
      <div className="max-w-xl mx-auto">
        {/* Toggle Bar */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between py-2 text-stone-900 font-semibold focus:outline-hidden"
        >
          <div className="flex items-center gap-1.5 text-sm sm:text-base">
            <span>{isOpen ? 'Hide Order Summary' : 'Show Order Summary'}</span>
            {isOpen ? (
              <ChevronUp className="w-4 h-4 text-stone-600" />
            ) : (
              <ChevronDown className="w-4 h-4 text-stone-600" />
            )}
          </div>
          <span className="text-base sm:text-lg font-bold font-tabular text-stone-900">
            {total.toLocaleString('en-US', { minimumFractionDigits: 2 })}৳
          </span>
        </button>

        {/* Collapsible Content */}
        {isOpen && (
          <div className="pt-4 border-t border-stone-200 space-y-4">
            {/* Items List */}
            {selectedItems.length === 0 ? (
              <p className="text-sm text-stone-500 italic py-2">
                কোন প্রোডাক্ট নির্বাচন করা হয়নি
              </p>
            ) : (
              <div className="space-y-3">
                {selectedItems.map((item) => (
                  <div
                    key={item.variant.id}
                    className="flex items-center gap-3 text-sm py-1"
                  >
                    <div className="w-12 h-12 rounded-lg bg-white overflow-hidden border border-stone-200 shrink-0">
                      <img
                        src={item.variant.image}
                        alt={item.variant.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.src = '/assets/images/gallery_bottle.jpg';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-stone-800 line-clamp-2 leading-tight text-xs sm:text-sm">
                        {item.variant.name}
                      </p>
                    </div>
                    <div className="text-stone-500 text-xs sm:text-sm shrink-0 font-tabular">
                      × {item.quantity}
                    </div>
                    <div className="text-right font-bold text-stone-800 text-sm shrink-0 font-tabular">
                      {(item.variant.price * item.quantity).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                      })}
                      ৳
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Line items calculation */}
            <div className="space-y-2 pt-3 border-t border-stone-200 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span className="font-semibold text-stone-800 font-tabular">
                  {subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}৳
                </span>
              </div>

              <div className="flex justify-between text-stone-600">
                <span>Shipping</span>
                <span className="font-semibold text-stone-800 font-tabular">
                  {shippingFee.toLocaleString('en-US', { minimumFractionDigits: 2 })}৳
                </span>
              </div>

              <div className="flex justify-between text-base font-bold text-stone-900 pt-2 border-t border-stone-200">
                <span>Total</span>
                <span className="text-lg font-extrabold text-amber-700 font-tabular">
                  {total.toLocaleString('en-US', { minimumFractionDigits: 2 })}৳
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
