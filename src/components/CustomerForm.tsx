import React from 'react';
import { BANGLADESH_DISTRICTS } from '../data/productData';
import { CustomerFormData, District } from '../types';
import { AlertCircle, Check } from 'lucide-react';

interface CustomerFormProps {
  formData: CustomerFormData;
  formErrors: Record<string, string>;
  onChange: (field: keyof CustomerFormData, value: string) => void;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
  formData,
  formErrors,
  onChange,
}) => {
  const isPhoneValid = /^01[3-9]\d{8}$/.test(formData.phone.replace(/\D/g, ''));

  return (
    <section id="order-form" className="bg-white py-6 px-4 border-t border-stone-100">
      <div className="max-w-xl mx-auto">
        {/* Section Heading */}
        <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mb-4 font-bengali">
          অর্ডারটি নিশ্চিত করতে আপনার তথ্য দিন
        </h2>

        {/* Form Inputs */}
        <div className="space-y-4">
          {/* Name Field */}
          <div>
            <input
              type="text"
              id="customer-name"
              value={formData.name}
              onChange={(e) => onChange('name', e.target.value)}
              placeholder="আপনার নাম *"
              className={`w-full px-4 py-3.5 rounded-xl border text-sm sm:text-base outline-hidden transition-all bg-white font-bengali ${
                formErrors.name
                  ? 'border-rose-500 focus:ring-2 focus:ring-rose-200'
                  : 'border-stone-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-100'
              }`}
            />
            {formErrors.name && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-bengali">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {formErrors.name}
              </p>
            )}
          </div>

          {/* Mobile Number Field */}
          <div>
            <div className="relative">
              <input
                type="tel"
                id="customer-phone"
                value={formData.phone}
                onChange={(e) => onChange('phone', e.target.value)}
                placeholder="মোবাইল নম্বর *"
                maxLength={11}
                className={`w-full px-4 py-3.5 rounded-xl border text-sm sm:text-base outline-hidden transition-all bg-white font-tabular ${
                  formErrors.phone
                    ? 'border-rose-500 focus:ring-2 focus:ring-rose-200'
                    : 'border-stone-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-100'
                }`}
              />
              {formData.phone && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  {isPhoneValid ? (
                    <span className="text-emerald-600 bg-emerald-50 p-1 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 stroke-[2.5]" />
                    </span>
                  ) : (
                    <span className="text-stone-400 text-xs font-tabular">
                      {formData.phone.length}/11
                    </span>
                  )}
                </div>
              )}
            </div>
            {formErrors.phone ? (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-bengali">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {formErrors.phone}
              </p>
            ) : (
              <p className="mt-1 text-[11px] text-stone-400 font-bengali">
                উদাহরণ: 01712345678 (১১ ডিজিট)
              </p>
            )}
          </div>

          {/* District Select Dropdown */}
          <div>
            <label
              htmlFor="customer-district"
              className="block text-xs font-medium text-stone-600 mb-1 font-bengali"
            >
              জেলা <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                id="customer-district"
                value={formData.district}
                onChange={(e) => onChange('district', e.target.value as District)}
                className="w-full px-4 py-3.5 rounded-xl border border-stone-300 text-sm sm:text-base outline-hidden bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-100 appearance-none font-sans font-medium text-stone-800"
              >
                {BANGLADESH_DISTRICTS.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-stone-500">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Full Delivery Address Field */}
          <div>
            <textarea
              id="customer-address"
              rows={3}
              value={formData.address}
              onChange={(e) => onChange('address', e.target.value)}
              placeholder="সম্পূর্ণ ঠিকানা *"
              className={`w-full px-4 py-3 rounded-xl border text-sm sm:text-base outline-hidden transition-all bg-white font-bengali resize-none ${
                formErrors.address
                  ? 'border-rose-500 focus:ring-2 focus:ring-rose-200'
                  : 'border-stone-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-100'
              }`}
            />
            {formErrors.address && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-bengali">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {formErrors.address}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
