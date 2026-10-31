import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Tag, Sparkles } from 'lucide-react';
import { ProductVariant } from '../types';

interface OrderSummaryProps {
  selectedItems: {
    variant: ProductVariant;
    quantity: number;
  }[];
  shippingFee: number;
  subtotal: number;
  bulkDiscount?: number;
  total: number;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  selectedItems,
  shippingFee,
  subtotal,
  bulkDiscount = 0,
  total,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const totalQuantity = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const isBulkEligible = totalQuantity > 3;

  // Potential savings if they reached 4 items
  const potentialSavingsFor4 = Math.round(1290 * 4 * 0.1);
  const itemsNeededForBulk = Math.max(0, 4 - totalQuantity);

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
          <div className="flex items-center gap-2">
            {bulkDiscount > 0 && (
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full font-tabular">
                -{bulkDiscount.toLocaleString()}৳ ছাড়
              </span>
            )}
            <span className="text-base sm:text-lg font-bold font-tabular text-stone-900">
              {total.toLocaleString('en-US', { minimumFractionDigits: 2 })}৳
            </span>
          </div>
        </button>

        {/* Collapsible Content */}
        {isOpen && (
          <div className="pt-4 border-t border-stone-200 space-y-4">
            {/* Bulk Discount Activated Banner */}
            {isBulkEligible && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 animate-in fade-in duration-200">
                <div className="p-1.5 bg-emerald-600 text-white rounded-lg shrink-0 mt-0.5 shadow-2xs">
                  <Tag className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                      Bulk Discount Applied
                    </span>
                    <span className="text-xs font-extrabold font-tabular text-emerald-700">
                      -{bulkDiscount.toLocaleString('en-US', { minimumFractionDigits: 2 })}৳ সাশ্রয়!
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800 font-bengali mt-1 leading-snug">
                    অভিনন্দন! আপনি ৩টির বেশি (<strong className="font-tabular font-bold">{totalQuantity}টি</strong>) বোতল অর্ডারে <strong>১০% স্পেশাল বাল্ক ডিসকাউন্ট</strong> পাচ্ছেন!
                  </p>
                </div>
              </div>
            )}

            {/* Encouragement message to unlock bulk discount if <= 3 items */}
            {totalQuantity > 0 && totalQuantity <= 3 && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-2 text-xs text-amber-900 font-bengali shadow-2xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    আর মাত্র <strong className="font-tabular font-bold text-amber-950">{itemsNeededForBulk}টি</strong> বোতল যোগ করলেই পাবেন <strong>১০% বাল্ক ডিসকাউন্ট</strong> (কমপক্ষে <span className="font-tabular font-bold">{potentialSavingsFor4}৳</span> সাশ্রয়)!
                  </span>
                </div>
              </div>
            )}

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
                <span>Subtotal ({totalQuantity} items)</span>
                <span className="font-semibold text-stone-800 font-tabular">
                  {subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}৳
                </span>
              </div>

              {/* Bulk discount line item if active */}
              {bulkDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 bg-emerald-50/70 p-1.5 rounded-lg border border-emerald-100 font-medium">
                  <span className="flex items-center gap-1 font-bengali">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    বাল্ক ডিসকাউন্ট (১০%)
                  </span>
                  <span className="font-bold font-tabular">
                    -{bulkDiscount.toLocaleString('en-US', { minimumFractionDigits: 2 })}৳
                  </span>
                </div>
              )}

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
