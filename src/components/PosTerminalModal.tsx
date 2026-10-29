import React, { useState } from 'react';
import {
  ShoppingBag,
  Package,
  Search,
  Filter,
  RefreshCw,
  Printer,
  Download,
  CheckCircle,
  Clock,
  Truck,
  CheckCheck,
  XCircle,
  Plus,
  Minus,
  Trash2,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';
import { CustomerFormData, District, OrderRecord, OrderStatus, ProductVariant } from '../types';
import { BANGLADESH_DISTRICTS } from '../data/productData';
import { apiService } from '../services/api';

interface PosTerminalModalProps {
  orders: OrderRecord[];
  variants: ProductVariant[];
  onOrderCreated: (order: OrderRecord) => void;
  onOrderStatusUpdated: (orderId: string, status: OrderStatus) => void;
  onClose: () => void;
  onOpenApiSettings: () => void;
}

export const PosTerminalModal: React.FC<PosTerminalModalProps> = ({
  orders,
  variants,
  onOrderCreated,
  onOrderStatusUpdated,
  onClose,
  onOpenApiSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'cashier' | 'orders'>('orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<OrderRecord | null>(null);

  // Cashier Quick Sale State
  const [cartItems, setCartItems] = useState<{ variant: ProductVariant; quantity: number }[]>([]);
  const [cashierCustomer, setCashierCustomer] = useState<CustomerFormData>({
    name: '',
    phone: '',
    district: 'Dhaka',
    address: 'Counter Pickup / In-Store Walk-in',
  });
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [cashReceived, setCashReceived] = useState<string>('');
  const [posError, setPosError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.phone.includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // POS Quick Sale Handlers
  const addVariantToCart = (variant: ProductVariant) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.variant.id === variant.id);
      if (existing) {
        return prev.map((i) =>
          i.variant.id === variant.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { variant, quantity: 1 }];
    });
  };

  const updateCartQty = (variantId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((i) => {
          if (i.variant.id === variantId) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as { variant: ProductVariant; quantity: number }[]
    );
  };

  const cashierSubtotal = cartItems.reduce(
    (sum, i) => sum + i.variant.price * i.quantity,
    0
  );
  const cashierTotal = cashierSubtotal + shippingFee;
  const cashChange = Number(cashReceived) > cashierTotal ? Number(cashReceived) - cashierTotal : 0;

  const handleCashierCheckout = async () => {
    setPosError('');
    if (cartItems.length === 0) {
      setPosError('প্রোডাক্ট কার্টে যোগ করুন');
      return;
    }
    if (!cashierCustomer.name.trim()) {
      setPosError('গ্রাহকের নাম দিন');
      return;
    }
    const phoneVal = apiService.validateBangladeshiPhone(cashierCustomer.phone);
    if (!phoneVal.isValid) {
      setPosError(phoneVal.message || 'মোবাইল নম্বর সঠিক নয়');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiService.submitOrder({
        customer: cashierCustomer,
        items: cartItems,
        shippingOption: cashierCustomer.district === 'Dhaka' ? 'inside_dhaka' : 'outside_dhaka',
        shippingFee: shippingFee,
        paymentMethod: 'cash_on_delivery',
        source: 'android_pos',
      });

      // Update to confirmed immediately for in-store POS
      await apiService.updateOrderStatus(res.order.id, 'confirmed');
      res.order.status = 'confirmed';
      res.order.paymentStatus = 'paid';

      onOrderCreated(res.order);
      setSelectedOrderForReceipt(res.order);

      // Reset cashier cart
      setCartItems([]);
      setCashReceived('');
      setCashierCustomer({
        name: '',
        phone: '',
        district: 'Dhaka',
        address: 'Counter Pickup / In-Store Walk-in',
      });
      setActiveTab('orders');
    } catch (err: unknown) {
      const e = err as Error;
      setPosError(e.message || 'অর্ডার প্রসেসিং ব্যর্থ হয়েছে');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Order #,Date,Customer,Phone,District,Address,Items,Total,Status,Synced'];
    const rows = orders.map((o) =>
      [
        o.orderNumber,
        new Date(o.createdAt).toLocaleDateString(),
        `"${o.customer.name}"`,
        `"${o.customer.phone}"`,
        `"${o.customer.district}"`,
        `"${o.customer.address.replace(/"/g, '""')}"`,
        `"${o.items.map((i) => `${i.name} (x${i.quantity})`).join('; ')}"`,
        o.total,
        o.status,
        o.syncedToApi ? 'Yes' : 'No',
      ].join(',')
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `deshikart_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <CheckCircle className="w-3 h-3" /> Confirmed
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
            <RefreshCw className="w-3 h-3" /> Processing
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
            <Truck className="w-3 h-3" /> Shipped
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCheck className="w-3 h-3" /> Delivered
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
            <XCircle className="w-3 h-3" /> Cancelled
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white w-full max-w-4xl h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-stone-200">
        {/* Terminal Header */}
        <div className="bg-stone-900 text-white px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-600 rounded-lg">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base sm:text-lg tracking-tight">
                  DeshiKart POS &amp; Dispatch Terminal
                </h2>
                <span className="bg-stone-800 text-stone-300 text-[10px] px-2 py-0.5 rounded-full font-mono">
                  Android POS v2.4
                </span>
              </div>
              <p className="text-stone-400 text-xs">
                Real-time Dispatch Management &amp; Counter Checkout
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenApiSettings}
              className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-medium transition-colors"
            >
              API Hub
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="bg-stone-100 border-b border-stone-200 px-4 py-2 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'orders'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              অর্ডার তালিকা ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('cashier')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'cashier'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              নতুন কাউন্টার সেল (POS)
            </button>
          </div>

          {activeTab === 'orders' && (
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          )}
        </div>

        {/* Tab 1: Orders Dispatch Management */}
        {activeTab === 'orders' && (
          <div className="flex-1 flex flex-col overflow-hidden p-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-2.5 mb-4 shrink-0">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="অর্ডার নম্বর, গ্রাহকের নাম বা মোবাইল নম্বর খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-lg text-xs sm:text-sm outline-hidden focus:border-amber-600 focus:ring-1 focus:ring-amber-200"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Filter className="w-4 h-4 text-stone-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-stone-300 rounded-lg text-xs sm:text-sm bg-white text-stone-700 outline-hidden font-medium"
                >
                  <option value="all">সব স্ট্যাটাস ({orders.length})</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="flex-1 overflow-y-auto border border-stone-200 rounded-xl bg-white shadow-2xs">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200 sticky top-0 z-10">
                  <tr>
                    <th className="py-2.5 px-3">অর্ডার #</th>
                    <th className="py-2.5 px-3">গ্রাহক</th>
                    <th className="py-2.5 px-3">প্রোডাক্ট</th>
                    <th className="py-2.5 px-3 text-right">মূল্য</th>
                    <th className="py-2.5 px-3">স্ট্যাটাস</th>
                    <th className="py-2.5 px-3 text-center">একশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-stone-400 font-bengali">
                        কোন অর্ডার পাওয়া যায়নি
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-3 px-3 align-top font-mono font-bold text-stone-900">
                          {ord.orderNumber}
                          <div className="text-[10px] text-stone-400 font-sans font-normal">
                            {new Date(ord.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </td>

                        <td className="py-3 px-3 align-top">
                          <div className="font-semibold text-stone-900">{ord.customer.name}</div>
                          <div className="text-stone-500 font-tabular">{ord.customer.phone}</div>
                          <div className="text-[11px] text-stone-400">{ord.customer.district}</div>
                        </td>

                        <td className="py-3 px-3 align-top">
                          {ord.items.map((it, i) => (
                            <div key={i} className="text-stone-700 flex items-center gap-1 mb-0.5">
                              <span className="font-bold text-amber-700">x{it.quantity}</span>
                              <span className="truncate max-w-[150px]">{it.colorName}</span>
                            </div>
                          ))}
                        </td>

                        <td className="py-3 px-3 align-top text-right font-bold text-stone-900 font-tabular">
                          {ord.total.toLocaleString()}৳
                        </td>

                        <td className="py-3 px-3 align-top">
                          <select
                            value={ord.status}
                            onChange={(e) =>
                              onOrderStatusUpdated(ord.id, e.target.value as OrderStatus)
                            }
                            className="text-xs font-semibold px-2 py-1 rounded-md border border-stone-300 bg-white shadow-2xs outline-hidden"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>

                        <td className="py-3 px-3 align-top text-center">
                          <button
                            onClick={() => {
                              setSelectedOrderForReceipt(ord);
                              setTimeout(() => window.print(), 100);
                            }}
                            className="p-1.5 text-stone-600 hover:text-amber-700 hover:bg-stone-100 rounded-md transition-colors"
                            title="প্রিন্ট রসিদ"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Cashier Direct Sale (POS) */}
        {activeTab === 'cashier' && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left: Product Variant Selector Grid */}
            <div className="flex-1 p-4 overflow-y-auto border-r border-stone-200">
              <h3 className="text-sm font-bold text-stone-800 mb-3">
                আইটেম ট্যাপ করে কার্টে যোগ করুন
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {variants.map((variant) => (
                  <div
                    key={variant.id}
                    onClick={() => addVariantToCart(variant)}
                    className="p-3 border border-stone-200 hover:border-amber-600 rounded-xl bg-white hover:bg-amber-50/20 cursor-pointer transition-all shadow-xs group"
                  >
                    <div className="w-full aspect-square rounded-lg bg-stone-100 overflow-hidden mb-2">
                      <img
                        src={variant.image}
                        alt={variant.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="text-xs font-bold text-stone-900">{variant.colorName}</div>
                    <div className="text-amber-700 font-extrabold text-sm font-tabular">
                      {variant.price.toLocaleString()}৳
                    </div>
                    <button className="w-full mt-2 py-1.5 bg-stone-100 group-hover:bg-amber-600 text-stone-800 group-hover:text-white text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1">
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Bill</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Cashier Billing Panel */}
            <div className="w-full md:w-80 p-4 bg-stone-50 flex flex-col overflow-y-auto shrink-0 border-t md:border-t-0 border-stone-200">
              <h3 className="text-sm font-bold text-stone-900 mb-3">কাউন্টার বিলিং</h3>

              {posError && (
                <div className="mb-3 p-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{posError}</span>
                </div>
              )}

              {/* Customer quick inputs */}
              <div className="space-y-2 mb-3">
                <input
                  type="text"
                  placeholder="গ্রাহকের নাম *"
                  value={cashierCustomer.name}
                  onChange={(e) =>
                    setCashierCustomer({ ...cashierCustomer, name: e.target.value })
                  }
                  className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                />
                <input
                  type="tel"
                  placeholder="মোবাইল নম্বর (১১ ডিজিট) *"
                  value={cashierCustomer.phone}
                  onChange={(e) =>
                    setCashierCustomer({ ...cashierCustomer, phone: e.target.value })
                  }
                  className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-tabular"
                />
              </div>

              {/* Cart List */}
              <div className="flex-1 border border-stone-200 rounded-xl bg-white p-2.5 overflow-y-auto space-y-2 max-h-48 mb-3">
                {cartItems.length === 0 ? (
                  <p className="text-xs text-stone-400 text-center py-4">কার্ট ফাঁকা</p>
                ) : (
                  cartItems.map((item) => (
                    <div
                      key={item.variant.id}
                      className="flex items-center justify-between text-xs py-1 border-b border-stone-100 last:border-b-0"
                    >
                      <div className="flex-1 pr-2">
                        <div className="font-semibold text-stone-800 line-clamp-1">
                          {item.variant.colorName} Bottle
                        </div>
                        <div className="text-stone-500 font-tabular">{item.variant.price}৳</div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateCartQty(item.variant.id, -1)}
                          className="w-5 h-5 bg-stone-100 rounded flex items-center justify-center text-stone-600 hover:bg-stone-200"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center font-bold font-tabular">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQty(item.variant.id, 1)}
                          className="w-5 h-5 bg-stone-100 rounded flex items-center justify-center text-stone-600 hover:bg-stone-200"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Financial Totals */}
              <div className="space-y-1.5 text-xs mb-3">
                <div className="flex justify-between text-stone-600">
                  <span>সাবটোটাল</span>
                  <span className="font-bold text-stone-900 font-tabular">
                    {cashierSubtotal.toLocaleString()}৳
                  </span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-stone-900 pt-1 border-t border-stone-200">
                  <span>মোট প্রদেয়</span>
                  <span className="text-amber-700 font-tabular">
                    {cashierTotal.toLocaleString()}৳
                  </span>
                </div>
              </div>

              {/* Cash Received & Change */}
              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-600 shrink-0">নগদ গ্রহণ:</span>
                  <input
                    type="number"
                    placeholder="নগদ টাকা"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-tabular font-bold"
                  />
                </div>
                {Number(cashReceived) > cashierTotal && (
                  <div className="flex justify-between text-xs text-emerald-700 bg-emerald-50 p-2 rounded-lg font-bold">
                    <span>ফেরত দিতে হবে:</span>
                    <span className="font-tabular">{cashChange.toLocaleString()}৳</span>
                  </div>
                )}
              </div>

              {/* Complete Order Button */}
              <button
                onClick={handleCashierCheckout}
                disabled={isSubmitting || cartItems.length === 0}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-colors cursor-pointer"
              >
                {isSubmitting ? 'প্রসেসিং হচ্ছে...' : 'ক্যাশ পেমেন্ট সম্পন্ন করুন'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
