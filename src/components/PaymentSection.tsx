import React from 'react';
import { Banknote, ShieldCheck } from 'lucide-react';

interface PaymentSectionProps {
  paymentMethod: 'cash_on_delivery' | 'bkash' | 'nagad';
  onSelectMethod: (method: 'cash_on_delivery' | 'bkash' | 'nagad') => void;
}

export const PaymentSection: React.FC<PaymentSectionProps> = ({
  paymentMethod,
  onSelectMethod,
}) => {
  return (
    <section className="bg-white py-6 px-4 border-t border-stone-100">
      <div className="max-w-xl mx-auto">
        {/* Section Heading */}
        <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mb-4 font-serif">
          Payment
        </h2>

        {/* Payment Container */}
        <div className="border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-200 shadow-2xs">
          {/* Main COD Option */}
          <div
            onClick={() => onSelectMethod('cash_on_delivery')}
            className={`p-3.5 flex items-center justify-between cursor-pointer transition-colors ${
              paymentMethod === 'cash_on_delivery' ? 'bg-stone-50/80' : 'bg-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-stone-500 flex items-center justify-center shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-stone-700" />
              </div>
              <span className="text-sm sm:text-base font-semibold text-stone-900">
                Cash on delivery
              </span>
            </div>
            <Banknote className="w-5 h-5 text-stone-500" />
          </div>

          {/* Subtext description row 1 */}
          <div className="py-3 px-4 bg-white text-stone-600 text-xs sm:text-sm font-bengali flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>পণ্য হাতে পেয়ে টাকা পরিশোধ করুন</span>
          </div>

          {/* Subtext reassurance row 2 */}
          <div className="py-2.5 px-4 bg-stone-50/40 text-stone-500 text-xs font-bengali">
            ডেলিভারি ম্যানের সামনে পণ্য দেখে চেক করে নেওয়ার সুবিধা
          </div>
        </div>
      </div>
    </section>
  );
};
