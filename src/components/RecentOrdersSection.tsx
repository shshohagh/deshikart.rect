import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  MapPin,
  Clock,
  ShieldCheck,
  ChevronRight,
  Filter,
  Copy,
  Check,
  PackageCheck,
  RotateCcw,
  Printer,
  BarChart3,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { OrderRecord, OrderStatus } from '../types';

interface RecentOrdersSectionProps {
  orders: OrderRecord[];
  onTrackOrder?: (phone: string) => void;
}

type StatusFilterOption = 'all' | OrderStatus;
type ChartStatusKey = 'delivered' | 'shipped' | 'processing' | 'confirmed' | 'pending';

const STATUS_CONFIG: Record<
  OrderStatus,
  {
    labelBn: string;
    labelEn: string;
    text: string;
    bg: string;
    border: string;
    dotClass: string;
    hex: string;
  }
> = {
  delivered: {
    labelBn: 'ডেলিভার্ড',
    labelEn: 'Delivered',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    dotClass: 'bg-emerald-600',
    hex: '#059669',
  },
  shipped: {
    labelBn: 'শিপড',
    labelEn: 'Shipped',
    bg: 'bg-purple-50',
    text: 'text-purple-800',
    border: 'border-purple-200',
    dotClass: 'bg-purple-600',
    hex: '#7c3aed',
  },
  processing: {
    labelBn: 'প্রসেসিং',
    labelEn: 'Processing',
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
    dotClass: 'bg-blue-600',
    hex: '#2563eb',
  },
  confirmed: {
    labelBn: 'কনফার্মড',
    labelEn: 'Confirmed',
    bg: 'bg-teal-50',
    text: 'text-teal-800',
    border: 'border-teal-200',
    dotClass: 'bg-teal-600',
    hex: '#0d9488',
  },
  pending: {
    labelBn: 'পেন্ডিং',
    labelEn: 'Pending',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    dotClass: 'bg-amber-600',
    hex: '#d97706',
  },
  cancelled: {
    labelBn: 'বাতিল',
    labelEn: 'Cancelled',
    bg: 'bg-stone-100',
    text: 'text-stone-600',
    border: 'border-stone-200',
    dotClass: 'bg-stone-400',
    hex: '#a8a29e',
  },
};

const STAGGER_DELAY_CLASSES = [
  '[animation-delay:0ms]',
  '[animation-delay:60ms]',
  '[animation-delay:120ms]',
  '[animation-delay:180ms]',
  '[animation-delay:240ms]',
];

const CHART_STATUS_KEYS: ChartStatusKey[] = [
  'delivered',
  'shipped',
  'processing',
  'confirmed',
  'pending',
];

interface DailyStatusDatum {
  dateKey: string;
  shortLabel: string;
  fullDateLabel: string;
  delivered: number;
  shipped: number;
  processing: number;
  confirmed: number;
  pending: number;
  total: number;
}

const toLocalDateKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    dataKey?: string;
    value?: number;
    color?: string;
    payload?: DailyStatusDatum;
  }>;
}

const WeeklyChartTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0]?.payload;
  if (!row) return null;

  return (
    <div className="bg-white border border-stone-200 rounded-lg shadow-md px-3 py-2 text-xs min-w-[148px]">
      <div className="flex items-center justify-between gap-3 pb-1.5 mb-1.5 border-b border-stone-100">
        <span className="font-bold text-stone-900 font-bengali">{row.fullDateLabel}</span>
        <span className="font-extrabold text-amber-700 font-tabular">{row.total}টি</span>
      </div>
      <div className="space-y-1">
        {[...CHART_STATUS_KEYS].reverse().map((key) => {
          const count = row[key];
          if (!count) return null;
          const cfg = STATUS_CONFIG[key];
          return (
            <div key={key} className="flex items-center justify-between gap-3 text-[11px]">
              <span className="flex items-center gap-1.5 text-stone-700 font-bengali">
                <span className={`w-2 h-2 rounded-xs shrink-0 ${cfg.dotClass}`} />
                {cfg.labelBn}
              </span>
              <span className="font-bold text-stone-900 font-tabular">{count}</span>
            </div>
          );
        })}
        {row.total === 0 && (
          <p className="text-[11px] text-stone-400 font-bengali">কোনো অর্ডার নেই</p>
        )}
      </div>
    </div>
  );
};

export const RecentOrdersSection: React.FC<RecentOrdersSectionProps> = ({
  orders,
  onTrackOrder,
}) => {
  const [statusFilter, setStatusFilter] = useState<StatusFilterOption>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [printingOrder, setPrintingOrder] = useState<OrderRecord | null>(null);
  const pendingPrintRef = useRef(false);

  // Trigger browser print after thermal receipt renders into the DOM
  useEffect(() => {
    if (printingOrder && pendingPrintRef.current) {
      pendingPrintRef.current = false;
      const timer = window.setTimeout(() => {
        window.print();
      }, 80);
      return () => window.clearTimeout(timer);
    }
  }, [printingOrder]);

  // Clean up printing order once print dialog closes
  useEffect(() => {
    const handleAfterPrint = () => {
      setPrintingOrder(null);
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  const handlePrintReceipt = (order: OrderRecord) => {
    if (printingOrder?.id === order.id) {
      window.print();
      return;
    }
    pendingPrintRef.current = true;
    setPrintingOrder(order);
  };

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
      prompt('ট্র্যাকিং আইডি কপি করুন:', trackingId);
    }
  };

  // Build 7-day order volume by status for Recharts visualization
  const { weeklyChartData, weeklyTotalsByStatus, weeklyTotalCount } = useMemo(() => {
    const dayBuckets: DailyStatusDatum[] = [];
    const bucketMap = new Map<string, DailyStatusDatum>();

    for (let daysAgo = 6; daysAgo >= 0; daysAgo--) {
      const d = new Date();
      d.setDate(d.getDate() - daysAgo);
      d.setHours(0, 0, 0, 0);
      const dateKey = toLocalDateKey(d);
      const weekdayShort = d.toLocaleDateString('en-US', { weekday: 'short' });
      const datePretty = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const entry: DailyStatusDatum = {
        dateKey,
        shortLabel: daysAgo === 0 ? 'আজ' : weekdayShort,
        fullDateLabel: daysAgo === 0 ? `${datePretty} (আজ)` : `${weekdayShort}, ${datePretty}`,
        delivered: 0,
        shipped: 0,
        processing: 0,
        confirmed: 0,
        pending: 0,
        total: 0,
      };
      dayBuckets.push(entry);
      bucketMap.set(dateKey, entry);
    }

    const totals: Record<ChartStatusKey, number> = {
      delivered: 0,
      shipped: 0,
      processing: 0,
      confirmed: 0,
      pending: 0,
    };
    let grandTotal = 0;

    orders.forEach((order) => {
      if (order.status === 'cancelled') return;
      const created = new Date(order.createdAt);
      if (Number.isNaN(created.getTime())) return;
      const key = toLocalDateKey(created);
      const bucket = bucketMap.get(key);
      if (bucket && (CHART_STATUS_KEYS as string[]).includes(order.status)) {
        const statusKey = order.status as ChartStatusKey;
        bucket[statusKey] += 1;
        bucket.total += 1;
        totals[statusKey] += 1;
        grandTotal += 1;
      }
    });

    return {
      weeklyChartData: dayBuckets,
      weeklyTotalsByStatus: totals,
      weeklyTotalCount: grandTotal,
    };
  }, [orders]);

  // Filter orders by selected status and limit to 3-5 orders
  const filteredOrders = useMemo(() => {
    const list =
      statusFilter === 'all'
        ? orders.filter((o) => o.status !== 'cancelled')
        : orders.filter((o) => o.status === statusFilter);

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
            <p className="text-amber-700 text-xs font-semibold tracking-wide font-bengali">
              সাম্প্রতিক অর্ডার প্রবাহ · লাইভ আপডেট
            </p>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 font-bengali mt-0.5">
              সাম্প্রতিক অর্ডারসমূহ
            </h2>
            <p className="text-stone-500 text-xs mt-0.5 font-bengali">
              সারা বাংলাদেশ থেকে গ্রাহকদের সর্বশেষ যাচাইকৃত অর্ডার ও সাপ্তাহিক স্ট্যাটাস বিশ্লেষণ
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
                className="pl-8 pr-7 py-2 text-xs font-semibold bg-stone-50 text-stone-700 border border-stone-200 rounded-lg hover:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors cursor-pointer appearance-none shadow-2xs font-bengali"
              >
                <option value="all">সকল স্ট্যাটাস ({filterCounts.all || 0})</option>
                <option value="delivered">
                  ডেলিভার্ড / Delivered ({filterCounts.delivered || 0})
                </option>
                <option value="shipped">শিপড / Shipped ({filterCounts.shipped || 0})</option>
                <option value="processing">
                  প্রসেসিং / Processing ({filterCounts.processing || 0})
                </option>
                <option value="confirmed">
                  কনফার্মড / Confirmed ({filterCounts.confirmed || 0})
                </option>
                <option value="pending">পেন্ডিং / Pending ({filterCounts.pending || 0})</option>
              </select>
              <div className="absolute right-2.5 pointer-events-none text-stone-400 text-[10px]">
                ▼
              </div>
            </div>
          </div>
        </div>

        {/* Last 7 Days Order Volume by Status Chart (Recharts) */}
        <div className="mb-5 p-3.5 rounded-xl border border-stone-200 bg-stone-50/50">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <BarChart3 className="w-4 h-4 text-amber-700 shrink-0" />
              <h3 className="text-xs sm:text-sm font-bold text-stone-800 font-bengali truncate">
                গত ৭ দিনের অর্ডার সংখ্যা (স্ট্যাটাস অনুযায়ী)
              </h3>
            </div>
            <span className="text-xs font-bold text-stone-700 font-tabular shrink-0">
              মোট {weeklyTotalCount}টি
            </span>
          </div>

          <div className="w-full h-[184px] min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={weeklyChartData}
                margin={{ top: 6, right: 6, left: -24, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
                <XAxis
                  dataKey="shortLabel"
                  tick={{ fontSize: 11, fill: '#57534e', fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  dy={4}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#78716c' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={<WeeklyChartTooltip />}
                  cursor={{ fill: 'rgba(217, 119, 6, 0.08)' }}
                />
                {CHART_STATUS_KEYS.map((statusKey) => {
                  const cfg = STATUS_CONFIG[statusKey];
                  const isDimmed = statusFilter !== 'all' && statusFilter !== statusKey;
                  return (
                    <Bar
                      key={statusKey}
                      dataKey={statusKey}
                      name={cfg.labelBn}
                      stackId="weeklyOrders"
                      fill={cfg.hex}
                      fillOpacity={isDimmed ? 0.22 : 0.95}
                      stroke="#ffffff"
                      strokeWidth={1}
                      maxBarSize={26}
                      animationDuration={400}
                    />
                  );
                })}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Interactive Legend Buttons Synced with Status Filter */}
          <div className="mt-3 pt-2.5 border-t border-stone-200/80 flex flex-wrap items-center gap-1.5">
            {CHART_STATUS_KEYS.map((statusKey) => {
              const cfg = STATUS_CONFIG[statusKey];
              const isSelected = statusFilter === statusKey;
              return (
                <button
                  key={statusKey}
                  type="button"
                  onClick={() => setStatusFilter(isSelected ? 'all' : statusKey)}
                  className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'bg-stone-900 text-white'
                      : 'bg-white text-stone-700 border border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-xs shrink-0 ${cfg.dotClass}`} />
                  <span className="font-bengali">{cfg.labelBn}</span>
                  <span
                    className={`font-tabular font-bold ${
                      isSelected ? 'text-stone-200' : 'text-stone-500'
                    }`}
                  >
                    {weeklyTotalsByStatus[statusKey]}
                  </span>
                </button>
              );
            })}
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
              type="button"
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
                /* Outer wrapper handles staggered fade-in so CSS animation-fill-mode never overrides card hover scale */
                <div
                  key={`${statusFilter}-${order.id}`}
                  className={`animate-fade-in ${STAGGER_DELAY_CLASSES[idx] || ''}`}
                >
                  <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.015] hover:-translate-y-0.5 hover:shadow-md hover:border-amber-300 hover:bg-white motion-reduce:hover:scale-100 motion-reduce:hover:translate-y-0 group">
                    {/* Card Top Row: Customer & Location + Status & Time */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-2.5">
                      <div className="flex items-center gap-1.5 font-medium text-stone-800">
                        <span className="font-bold text-stone-900">{maskedName}</span>
                        <span className="text-stone-300" aria-hidden="true">
                          ·
                        </span>
                        <span className="flex items-center gap-1 text-stone-600">
                          <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                          {order.customer.district}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px]">
                        <span className={`font-semibold font-bengali ${statusInfo.text}`}>
                          {statusInfo.labelBn}
                        </span>
                        <span className="text-stone-300" aria-hidden="true">
                          ·
                        </span>
                        <span className="text-stone-500 font-tabular flex items-center gap-1">
                          <Clock className="w-3 h-3 text-stone-400" />
                          {relativeTime}
                        </span>
                      </div>
                    </div>

                    {/* Card Middle: Products & Thumbnails */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
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
                                referrerPolicy="no-referrer"
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
                              <>
                                <span className="text-stone-300" aria-hidden="true">
                                  ·
                                </span>
                                <span className="text-amber-700 font-semibold font-bengali">
                                  বাল্ক ডিসকাউন্ট
                                </span>
                              </>
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
                            className="text-[11px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-0.5 mt-0.5 ml-auto cursor-pointer whitespace-nowrap"
                            title="এই অর্ডারের স্ট্যাটাস দেখুন"
                          >
                            <span>স্ট্যাটাস ট্র্যাক</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Card Bottom Row: Tracking ID, Print Receipt & Copy Tracking ID */}
                    <div className="mt-2.5 pt-2.5 border-t border-stone-200/70 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5 min-w-0 text-stone-500 font-tabular">
                        <span className="text-[11px] text-stone-400 font-bengali">ট্র্যাকিং:</span>
                        <span className="font-mono text-[11px] font-bold text-stone-800 select-all">
                          {order.orderNumber}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handlePrintReceipt(order)}
                          aria-label={`Print Receipt for order ${order.orderNumber}`}
                          title="থার্মাল রসিদ প্রিন্ট করুন (Print Receipt)"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-md bg-white hover:bg-amber-50 text-stone-700 hover:text-amber-900 border border-stone-200 hover:border-amber-300 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                        >
                          <Printer className="w-3 h-3 text-stone-500" />
                          <span>Print Receipt</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopyTrackingId(order)}
                          aria-label={`Copy Tracking ID ${order.orderNumber}`}
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                            isCopied
                              ? 'bg-emerald-600 text-white border border-emerald-600'
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
                              <span className="font-bengali">কপি আইডি</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 80mm Thermal Receipt Portal Container (styled via @media print #thermal-receipt in index.css) */}
      {printingOrder &&
        typeof document !== 'undefined' &&
        createPortal(
          <div id="thermal-receipt" className="hidden print:block font-mono text-black bg-white">
            <div className="text-center mb-2">
              <h2 className="text-base font-bold m-0">DeshiKart</h2>
              <p className="my-0.5 text-[10px]">Hotline: 01700-000000</p>
              <p className="my-0.5 text-[10px] font-bold">Order: #{printingOrder.orderNumber}</p>
              <p className="my-0.5 text-[9px]">
                Date: {new Date(printingOrder.createdAt).toLocaleString()}
              </p>
              <p className="my-0.5 text-[9px] uppercase">Status: {printingOrder.status}</p>
              <hr className="border-t border-dashed border-black my-1.5" />
            </div>

            <div className="mb-2">
              <p className="my-0.5 font-bold">Customer Details:</p>
              <p className="my-0.5">{printingOrder.customer.name}</p>
              <p className="my-0.5">{printingOrder.customer.phone}</p>
              <p className="my-0.5">{printingOrder.customer.district}</p>
              <p className="my-0.5">{printingOrder.customer.address}</p>
              <hr className="border-t border-dashed border-black my-1.5" />
            </div>

            <div className="mb-2">
              <p className="my-0.5 font-bold">Items:</p>
              {printingOrder.items.map((it, i) => (
                <div key={i} className="flex justify-between gap-2 my-0.5">
                  <span>
                    {it.name} ({it.colorName}) x{it.quantity}
                  </span>
                  <span className="shrink-0">{it.total} BDT</span>
                </div>
              ))}
              <hr className="border-t border-dashed border-black my-1.5" />
            </div>

            <div>
              <div className="flex justify-between my-0.5">
                <span>Subtotal:</span>
                <span>{printingOrder.subtotal} BDT</span>
              </div>
              {printingOrder.bulkDiscount && printingOrder.bulkDiscount > 0 ? (
                <div className="flex justify-between my-0.5">
                  <span>Bulk Discount:</span>
                  <span>-{printingOrder.bulkDiscount} BDT</span>
                </div>
              ) : null}
              <div className="flex justify-between my-0.5">
                <span>Shipping:</span>
                <span>{printingOrder.shippingFee} BDT</span>
              </div>
              <div className="flex justify-between font-bold text-[13px] mt-1 pt-1 border-t border-black">
                <span>
                  Total ({printingOrder.paymentStatus === 'paid' ? 'PAID' : 'COD'}):
                </span>
                <span>{printingOrder.total} BDT</span>
              </div>
              <div className="text-center mt-3 text-[10px]">
                <p>Thank you for shopping with DeshiKart!</p>
              </div>
            </div>
          </div>,
          document.body
        )}
    </section>
  );
};
