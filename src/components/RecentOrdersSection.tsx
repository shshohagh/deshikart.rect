import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Clock,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Filter,
  Copy,
  Check,
  PackageCheck,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { OrderRecord, OrderStatus } from '../types';

interface RecentOrdersSectionProps {
  orders: OrderRecord[];
  onTrackOrder?: (phone: string) => void;
}

type StatusFilterOption = 'all' | OrderStatus;

const STATUS_CONFIG: Record<
  OrderStatus,
  { labelBn: string; labelEn: string; bg: string; text: string; border: string; dot: string }
> = {
  pending: {
    labelBn: 'পেন্ডিং',
    labelEn: 'Pending',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  confirmed: {
    labelBn: 'কনফার্মড',
    labelEn: 'Confirmed',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
  processing: {
    labelBn: 'প্রসেসিং',
    labelEn: 'Processing',
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  },
  shipped: {
    labelBn: 'শিপড',
    labelEn: 'Shipped',
    bg: 'bg-purple-50',
    text: 'text-purple-800',
    border: 'border-purple-200',
    dot: 'bg-purple-500',
  },
  delivered: {
    labelBn: 'ডেলিভার্ড',
    labelEn: 'Delivered',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    dot: 'bg-emerald-600',
  },
  cancelled: {
    labelBn: 'বাতিল',
    labelEn: 'Cancelled',
    bg: 'bg-stone-100',
    text: 'text-stone-600',
    border: 'border-stone-200',
    dot: 'bg-stone-400',
  },
};

export const RecentOrdersSection: React.FC<RecentOrdersSectionProps> = ({
  orders,
  onTrackOrder,
}) => {
  const [statusFilter, setStatusFilter] = useState<StatusFilterOption>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Mask customer name for privacy (e.g., Tanvir H.)
  const maskCustomerName = (fullName: string) => {
    const parts = fullName.trim().split(' ');
    if (parts.length === 1) return parts[0];
    const first = parts[0];
    const lastInitial = parts[parts.length - 1][0] || '';
    return `${first} ${lastInitial}.`;
  };

  // Helper for human-readable relative time
  const getRelativeTime = (isoDate: string) => {
    try {
      const diffMs = Date.now() - new Date(isoDate).getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return 'এইমাত্র';
      if (diffMins < 60) return `${diffMins} মিনিট আগে`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} ঘণ্টা আগে`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} দিন আগে`;
    } catch {
      return 'সম্প্রতি';
    }
  };

  // Copy tracking ID handler with fallback support
  const handleCopyTrackingId = async (order: OrderRecord) => {
    const trackingId = order.orderNumber;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(trackingId);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = trackingId;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedId(order.id);
      setTimeout(() => {
        setCopiedId((current) => (current === order.id ? null : current));
      }, 2000);
    } catch {
      // Fallback alert if clipboard operations fail
      prompt('ট্র্যাকিং আইডি কপি করুন:', trackingId);
    }
  };

  // Filter orders by selected status and limit to 3-5 orders
  const filteredOrders = useMemo(() => {
    const list =
      statusFilter === 'all'
        ? orders.filter((o) => o.status !== 'cancelled')
        : orders.filter((o) => o.status === statusFilter);

    // Keep chronological descending order
    return [...list]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [orders, statusFilter]);

  // Count summary for filter options
  const filterCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: orders.filter((o) => o.status !== 'cancelled').length,
    };
    orders.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return counts;
  }, [orders]);

  if (orders.length === 0) {
    return null;
  }

  return (
    <section id="recent-orders" className="bg-white py-6 px-4 border-t border-stone-200">
      <div className="max-w-xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-1.5 text-amber-700 text-xs font-bold uppercase tracking-wider font-bengali">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>লাইভ অ্যাক্টিভিটি</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 font-bengali mt-0.5">
              সাম্প্রতিক অর্ডারসমূহ
            </h2>
            <p className="text-stone-500 text-xs mt-0.5 font-bengali">
              সারা বাংলাদেশ থেকে গ্রাহকদের সর্বশেষ যাচাইকৃত অর্ডারের রিয়েল-টাইম তথ্য
            </p>
          </div>

          {/* Status Filter Dropdown */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <div className="relative inline-flex items-center">
              <Filter className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 pointer-events-none" />
              <select
                aria-label="Filter orders by status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilterOption)}
                className="pl-8 pr-7 py-1.5 text-xs font-semibold bg-stone-50 text-stone-700 border border-stone-200 rounded-lg hover:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors cursor-pointer appearance-none shadow-2xs font-bengali"
              >
                <option value="all">
                  সকল স্ট্যাটাস ({filterCounts.all || 0})
                </option>
                <option value="delivered">
                  ডেলিভার্ড / Delivered ({filterCounts.delivered || 0})
                </option>
                <option value="shipped">
                  শিপড / Shipped ({filterCounts.shipped || 0})
                </option>
                <option value="processing">
                  প্রসেসিং / Processing ({filterCounts.processing || 0})
                </option>
                <option value="confirmed">
                  কনফার্মড / Confirmed ({filterCounts.confirmed || 0})
                </option>
                <option value="pending">
                  পেন্ডিং / Pending ({filterCounts.pending || 0})
                </option>
              </select>
              <div className="absolute right-2.5 pointer-events-none text-stone-400 text-[10px]">
                ▼
              </div>
            </div>

            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-2.5 py-1.5 rounded-lg font-tabular shrink-0 hidden xs:inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              লাইভ
            </span>
          </div>
        </div>

        {/* Orders Cards List or Empty State */}
        {filteredOrders.length === 0 ? (
          <div className="py-8 px-4 rounded-xl border border-dashed border-stone-200 bg-stone-50/60 text-center animate-fade-in">
            <PackageCheck className="w-8 h-8 text-stone-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-stone-700 font-bengali">
              এই স্ট্যাটাসে কোনো অর্ডার পাওয়া যায়নি
            </p>
            <p className="text-xs text-stone-400 mt-0.5 font-bengali">
              অন্য কোনো ফিল্টার নির্বাচন করে দেখুন অথবা সব অর্ডার চেক করুন
            </p>
            <button
              onClick={() => setStatusFilter('all')}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors cursor-pointer font-bengali"
            >
              <RotateCcw className="w-3 h-3" />
              <span>সকল অর্ডার দেখুন</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order, idx) => {
              const maskedName = maskCustomerName(order.customer.name);
              const relativeTime = getRelativeTime(order.createdAt);
              const isCopied = copiedId === order.id;
              const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

              return (
                <div
                  key={`${statusFilter}-${order.id}`}
                  style={{ animationDelay: `${idx * 60}ms` }}
                  className="animate-fade-in p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-white hover:border-amber-300 transition-all shadow-2xs group"
                >
                  {/* Card Top Row: Customer & Location + Tracking ID Pill & Status Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-2.5">
                    <div className="flex items-center gap-1.5 font-medium text-stone-800">
                      <span className="font-bold text-stone-900">{maskedName}</span>
                      <span className="text-stone-300">·</span>
                      <span className="flex items-center gap-1 text-stone-600">
                        <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                        {order.customer.district}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Status Badge */}
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border} font-bengali`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                        {statusInfo.labelBn}
                      </span>

                      {/* Time */}
                      <span className="text-stone-400 text-[11px] font-tabular flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {relativeTime}
                      </span>
                    </div>
                  </div>

                  {/* Card Middle: Products & Thumbnails */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Thumbnails stack */}
                      <div className="flex -space-x-2 shrink-0">
                        {order.items.slice(0, 3).map((item, itemIdx) => (
                          <div
                            key={itemIdx}
                            className="w-10 h-10 rounded-lg overflow-hidden border-2 border-white bg-white shadow-xs shrink-0"
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '/assets/images/gallery_bottle.jpg';
                              }}
                            />
                          </div>
                        ))}
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-stone-800 truncate leading-tight">
                          {order.items.map((i) => `${i.colorName} (x${i.quantity})`).join(', ')}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-500 mt-1">
                          <span className="flex items-center gap-0.5 text-emerald-700 font-medium">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            যাচাইকৃত অর্ডার
                          </span>
                          {order.bulkDiscount && order.bulkDiscount > 0 ? (
                            <span className="text-amber-700 font-bold bg-amber-100/70 px-1.5 py-0.2 rounded font-bengali">
                              বাল্ক ডিসকাউন্ট
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    {/* Right side: Amount and Track Button */}
                    <div className="text-right shrink-0">
                      <div className="text-sm font-extrabold text-stone-900 font-tabular">
                        {order.total.toLocaleString()}৳
                      </div>
                      {onTrackOrder && (
                        <button
                          type="button"
                          onClick={() => onTrackOrder(order.customer.phone)}
                          className="text-[11px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-0.5 mt-0.5 ml-auto cursor-pointer"
                          title="এই অর্ডারের স্ট্যাটাস দেখুন"
                        >
                          <span>স্ট্যাটাস ট্র্যাক</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom Row: Tracking ID & Copy Tracking ID Button */}
                  <div className="mt-2.5 pt-2 border-t border-stone-200/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 min-w-0 text-stone-500 font-tabular">
                      <span className="text-[11px] text-stone-400 font-bengali">ট্র্যাকিং আইডি:</span>
                      <span className="font-mono text-[11px] font-bold text-stone-800 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200/80 select-all">
                        {order.orderNumber}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyTrackingId(order)}
                      aria-label={`Copy Tracking ID ${order.orderNumber}`}
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-md transition-all cursor-pointer ${
                        isCopied
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-stone-100 hover:bg-amber-100/80 text-stone-700 hover:text-amber-900 border border-stone-200'
                      }`}
                      title="ট্র্যাকিং আইডি কপি করুন"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3 h-3 text-white stroke-[2.5]" />
                          <span className="font-bengali">কপি হয়েছে!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-stone-500 group-hover:text-amber-700" />
                          <span className="font-bengali">কপি ট্র্যাকিং আইডি</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
