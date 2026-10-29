import React, { useState } from 'react';
import {
  Search,
  Truck,
  CheckCircle2,
  Clock,
  Package,
  MapPin,
  AlertCircle,
  Loader2,
  MessageCircle,
  Calendar,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { OrderRecord, OrderStatus } from '../types';
import { apiService } from '../services/api';

interface OrderTrackingSectionProps {
  onReOrderClick?: () => void;
  recentPhone?: string;
}

export const OrderTrackingSection: React.FC<OrderTrackingSectionProps> = ({
  onReOrderClick,
  recentPhone,
}) => {
  const [phoneInput, setPhoneInput] = useState(recentPhone || '');
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [trackedOrders, setTrackedOrders] = useState<OrderRecord[] | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (targetPhone?: string) => {
    const query = (targetPhone || phoneInput).trim();
    setErrorMessage('');
    setHasSearched(true);

    if (!query) {
      setErrorMessage('অনুগ্রহ করে আপনার ১১ ডিজিটের মোবাইল নম্বর দিন');
      return;
    }

    setIsSearching(true);
    try {
      const orders = await apiService.getOrdersByPhone(query);
      setTrackedOrders(orders);
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMessage(e.message || 'অর্ডার ট্র্যাক করতে সমস্যা হয়েছে');
      setTrackedOrders([]);
    } finally {
      setIsSearching(false);
    }
  };

  const getStepProgress = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 1;
      case 'confirmed':
        return 2;
      case 'processing':
        return 3;
      case 'shipped':
        return 4;
      case 'delivered':
        return 5;
      case 'cancelled':
        return -1;
      default:
        return 1;
    }
  };

  const steps = [
    { step: 1, label: 'অর্ডার সাবমিট', desc: 'গৃহীত হয়েছে' },
    { step: 2, label: 'কনফার্মেশন', desc: 'ভেরিফাইড' },
    { step: 3, label: 'প্রসেসিং', desc: 'প্যাকিং সম্পন্ন' },
    { step: 4, label: 'ডেলিভারির পথে', desc: 'কুরিয়ারে হস্তান্তর' },
    { step: 5, label: 'ডেলিভার্ড', desc: 'পণ্য বুঝে পেয়েছেন' },
  ];

  return (
    <section id="order-tracking" className="bg-stone-50 py-6 px-4 border-t border-stone-200">
      <div className="max-w-xl mx-auto">
        {/* Section Heading */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center p-2 bg-amber-100 text-amber-800 rounded-xl mb-2">
            <Truck className="w-5 h-5 text-amber-700" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 font-bengali">
            আপনার অর্ডারের ডেলিভারি স্ট্যাটাস চেক করুন
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm mt-1 font-bengali">
            অর্ডারের সময় ব্যবহৃত ১১ ডিজিটের মোবাইল নম্বর দিয়ে তাৎক্ষণিক লাইভ অবস্থান দেখুন
          </p>
        </div>

        {/* Search Input Box */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs mb-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex flex-col sm:flex-row gap-2.5"
          >
            <div className="relative flex-1">
              <input
                type="tel"
                value={phoneInput}
                onChange={(e) => {
                  setPhoneInput(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                maxLength={11}
                placeholder="মোবাইল নম্বর (যেমন: 01712345678) *"
                className="w-full pl-4 pr-10 py-3 rounded-xl border border-stone-300 text-sm outline-hidden focus:border-amber-600 focus:ring-2 focus:ring-amber-100 font-tabular transition-all"
              />
              <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              type="submit"
              disabled={isSearching}
              className="py-3 px-6 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer font-bengali shrink-0"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>খোঁজা হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>স্ট্যাটাস দেখুন</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Test Numbers */}
          <div className="flex items-center gap-1.5 flex-wrap mt-3 pt-3 border-t border-stone-100 text-xs text-stone-500">
            <span className="font-bengali">ক্লিক করে টেস্ট করুন:</span>
            <button
              type="button"
              onClick={() => {
                setPhoneInput('01712345678');
                handleSearch('01712345678');
              }}
              className="font-tabular font-medium text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded border border-amber-200 transition-colors"
            >
              01712345678 (ঢাকা)
            </button>
            <button
              type="button"
              onClick={() => {
                setPhoneInput('01898765432');
                handleSearch('01898765432');
              }}
              className="font-tabular font-medium text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded border border-amber-200 transition-colors"
            >
              01898765432 (চট্টগ্রাম)
            </button>
          </div>

          {errorMessage && (
            <p className="mt-3 text-xs text-rose-600 flex items-center gap-1.5 font-bengali bg-rose-50 p-2.5 rounded-lg border border-rose-100">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </p>
          )}
        </div>

        {/* Results Area */}
        {hasSearched && !isSearching && trackedOrders && (
          <div className="space-y-4">
            {trackedOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center border border-stone-200 shadow-2xs font-bengali">
                <div className="w-12 h-12 bg-stone-100 text-stone-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-stone-800 text-base mb-1">
                  কোন অর্ডার খুঁজে পাওয়া যায়নি
                </h3>
                <p className="text-stone-500 text-xs sm:text-sm max-w-sm mx-auto mb-4 leading-relaxed">
                  <strong className="text-stone-700 font-tabular">{phoneInput}</strong> নম্বরে কোনো রেকর্ড নেই। অনুগ্রহ করে নম্বরটি সঠিকভাবে টাইপ করেছেন কিনা নিশ্চিত করুন।
                </p>
                {onReOrderClick && (
                  <button
                    onClick={onReOrderClick}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-4 py-2 rounded-xl border border-amber-200 transition-colors"
                  >
                    <span>নতুন অর্ডার করতে ক্লিক করুন</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              trackedOrders.map((order) => {
                const currentStep = getStepProgress(order.status);
                const isCancelled = order.status === 'cancelled';

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden"
                  >
                    {/* Order Top Banner */}
                    <div className="bg-stone-900 text-white p-4 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-stone-400">অর্ডার নম্বর:</span>
                          <span className="font-mono font-bold text-sm tracking-wider text-amber-400">
                            {order.orderNumber}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-stone-400 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(order.createdAt).toLocaleDateString('bn-BD', { dateStyle: 'medium' })}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider inline-block ${
                            order.status === 'delivered'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : order.status === 'cancelled'
                              ? 'bg-rose-950 text-rose-400 border border-rose-800'
                              : 'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>

                    {/* Visual Progress Stepper */}
                    <div className="p-4 sm:p-5 border-b border-stone-100 bg-stone-50/60">
                      <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-4 font-bengali">
                        ডেলিভারি ট্র্যাকিং প্রগ্রেস
                      </h4>

                      {isCancelled ? (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-bengali flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                          <span>এই অর্ডারটি বাতিল করা হয়েছে। বিস্তারিত জানতে সাপোর্টে যোগাযোগ করুন।</span>
                        </div>
                      ) : (
                        <div className="relative">
                          {/* Timeline steps */}
                          <div className="grid grid-cols-5 gap-1 relative text-center">
                            {steps.map((s, idx) => {
                              const isCompleted = currentStep > s.step;
                              const isCurrent = currentStep === s.step;

                              return (
                                <div key={s.step} className="flex flex-col items-center relative">
                                  {/* Connector Line */}
                                  {idx < steps.length - 1 && (
                                    <div
                                      className={`absolute top-3.5 left-1/2 w-full h-1 -z-0 transition-colors ${
                                        currentStep > s.step ? 'bg-emerald-500' : 'bg-stone-200'
                                      }`}
                                    />
                                  )}

                                  {/* Step Dot / Icon */}
                                  <div
                                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-all ${
                                      isCompleted
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : isCurrent
                                        ? 'bg-amber-600 text-white ring-4 ring-amber-100 shadow-xs'
                                        : 'bg-stone-200 text-stone-500'
                                    }`}
                                  >
                                    {isCompleted ? (
                                      <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                                    ) : (
                                      s.step
                                    )}
                                  </div>

                                  {/* Step Labels */}
                                  <span
                                    className={`text-[11px] font-bold mt-2 font-bengali leading-tight ${
                                      isCurrent
                                        ? 'text-amber-800'
                                        : isCompleted
                                        ? 'text-emerald-800'
                                        : 'text-stone-400'
                                    }`}
                                  >
                                    {s.label}
                                  </span>
                                  <span className="text-[9px] text-stone-400 hidden sm:inline font-bengali mt-0.5">
                                    {s.desc}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Order Information & Products Details */}
                    <div className="p-4 sm:p-5 space-y-4 text-xs sm:text-sm">
                      {/* Products in this order */}
                      <div>
                        <span className="text-stone-500 text-xs font-bold uppercase tracking-wider block mb-2 font-bengali">
                          অর্ডারের বিস্তারিত
                        </span>
                        <div className="space-y-2">
                          {order.items.map((item, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between p-2 rounded-lg bg-stone-50 border border-stone-100"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-9 h-9 rounded-md overflow-hidden bg-white border border-stone-200 shrink-0">
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.src = '/assets/images/gallery_bottle.jpg';
                                    }}
                                  />
                                </div>
                                <div className="truncate">
                                  <p className="font-semibold text-stone-800 truncate">
                                    {item.name}
                                  </p>
                                  <p className="text-[11px] text-stone-500 font-tabular">
                                    পরিমাণ: {item.quantity}টি × {item.price}৳
                                  </p>
                                </div>
                              </div>
                              <span className="font-bold text-stone-900 font-tabular shrink-0 ml-2">
                                {item.total.toLocaleString()}৳
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Delivery Address & Customer Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-100 text-xs">
                        <div className="p-3 bg-stone-50/80 rounded-xl space-y-1 font-bengali">
                          <div className="flex items-center gap-1.5 font-bold text-stone-700">
                            <MapPin className="w-3.5 h-3.5 text-amber-600" />
                            <span>ডেলিভারি ঠিকানা:</span>
                          </div>
                          <p className="text-stone-800 font-semibold">{order.customer.name}</p>
                          <p className="text-stone-600 leading-relaxed">{order.customer.address}</p>
                          <p className="text-stone-500 font-medium">জেলা: {order.customer.district}</p>
                        </div>

                        <div className="p-3 bg-stone-50/80 rounded-xl space-y-1 font-bengali">
                          <div className="flex items-center gap-1.5 font-bold text-stone-700">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>পেমেন্ট তথ্য (COD):</span>
                          </div>
                          <div className="flex justify-between text-stone-600">
                            <span>সাবটোটাল:</span>
                            <span className="font-tabular font-medium">{order.subtotal}৳</span>
                          </div>
                          <div className="flex justify-between text-stone-600">
                            <span>শিপিং চার্জ:</span>
                            <span className="font-tabular font-medium">{order.shippingFee}৳</span>
                          </div>
                          <div className="flex justify-between font-bold text-stone-900 pt-1 border-t border-stone-200">
                            <span>মোট প্রদেয়:</span>
                            <span className="text-amber-700 font-tabular text-sm">
                              {order.total.toLocaleString()}৳
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Helpline & WhatsApp support */}
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-[11px] text-stone-500 font-bengali flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-stone-400" />
                          ডেলিভারি সময়: ১-৩ কার্যদিবস
                        </span>

                        <a
                          href={`https://wa.me/8801700000000?text=${encodeURIComponent(
                            `Hello, I would like to check on my order #${order.orderNumber}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp সাপোর্ট</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </section>
  );
};
