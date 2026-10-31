/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { ProductGallery } from './components/ProductGallery';
import { ProductSpecs } from './components/ProductSpecs';
import { VariantSelector } from './components/VariantSelector';
import { CustomerForm } from './components/CustomerForm';
import { OrderSummary } from './components/OrderSummary';
import { ShippingSection } from './components/ShippingSection';
import { PaymentSection } from './components/PaymentSection';
import { PlaceOrderButton } from './components/PlaceOrderButton';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { PosTerminalModal } from './components/PosTerminalModal';
import { ApiConfigModal } from './components/ApiConfigModal';
import { OrderTrackingSection } from './components/OrderTrackingSection';
import { RecentOrdersSection } from './components/RecentOrdersSection';
import { PRODUCT_DATA, SHIPPING_OPTIONS } from './data/productData';
import {
  CustomerFormData,
  District,
  OrderRecord,
  OrderStatus,
  ProductVariant,
} from './types';
import { apiService } from './services/api';
import { Smartphone, Monitor, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

export default function App() {
  // Navigation & View Mode
  const [activeView, setActiveView] = useState<'storefront' | 'pos' | 'api_config'>('storefront');
  const [deviceFrameMode, setDeviceFrameMode] = useState<'mobile' | 'full'>('mobile');

  // Selected Variants (Default matches screenshot: Black variant selected with qty 1)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, number>>({
    black: 1,
  });

  // Customer Form State (matches screenshot with default district 'Dhaka')
  const [customerForm, setCustomerForm] = useState<CustomerFormData>({
    name: '',
    phone: '',
    district: 'Dhaka',
    address: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [shippingOptionId, setShippingOptionId] = useState<'inside_dhaka' | 'outside_dhaka'>(
    'inside_dhaka'
  );
  const [paymentMethod, setPaymentMethod] = useState<'cash_on_delivery' | 'bkash' | 'nagad'>(
    'cash_on_delivery'
  );

  // Orders State
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [createdOrder, setCreatedOrder] = useState<OrderRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);

  // Load orders & network status
  useEffect(() => {
    setOrders(apiService.getOrders());
    setOfflineQueueCount(apiService.getOfflineQueue().length);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Synchronize shipping fee when district changes
  useEffect(() => {
    if (customerForm.district === 'Dhaka') {
      setShippingOptionId('inside_dhaka');
    } else {
      setShippingOptionId('outside_dhaka');
    }
  }, [customerForm.district]);

  // Handle Variant Selection Toggle
  const handleToggleVariant = (variantId: string) => {
    setSelectedVariants((prev) => {
      const current = prev[variantId] || 0;
      if (current > 0) {
        // Deselect
        const next = { ...prev };
        delete next[variantId];
        return next;
      } else {
        // Select with quantity 1
        return { ...prev, [variantId]: 1 };
      }
    });
  };

  // Handle Quantity Stepper
  const handleQuantityChange = (variantId: string, quantity: number) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [variantId]: Math.max(1, quantity),
    }));
  };

  // Selected Items with Full Variant Object
  const selectedItems = useMemo(() => {
    return Object.entries(selectedVariants)
      .map(([variantId, qty]) => {
        const variant = PRODUCT_DATA.variants.find((v) => v.id === variantId);
        return variant && qty > 0 ? { variant, quantity: qty } : null;
      })
      .filter(Boolean) as { variant: ProductVariant; quantity: number }[];
  }, [selectedVariants]);

  // Total Quantity of all selected items
  const totalItemsCount = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [selectedItems]);

  // Subtotal Calculation
  const subtotal = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + item.variant.price * item.quantity, 0);
  }, [selectedItems]);

  // Bulk Discount Calculation (10% savings if total items > 3)
  const bulkDiscount = useMemo(() => {
    if (totalItemsCount > 3) {
      return Math.round(subtotal * 0.1);
    }
    return 0;
  }, [totalItemsCount, subtotal]);

  // Shipping Fee
  const currentShippingOption = useMemo(() => {
    return (
      SHIPPING_OPTIONS.find((opt) => opt.id === shippingOptionId) ||
      SHIPPING_OPTIONS[0]
    );
  }, [shippingOptionId]);

  const shippingFee = currentShippingOption.fee;

  // Grand Total Calculation (matches screenshot: 1,290 + 70 = 1,360.00৳; or discounted if > 3 items)
  const total = useMemo(() => {
    return Math.max(0, subtotal - bulkDiscount + shippingFee);
  }, [subtotal, bulkDiscount, shippingFee]);

  // Last 3-5 confirmed orders for social proof section
  const recentConfirmedOrders = useMemo(() => {
    return orders
      .filter((o) => ['confirmed', 'processing', 'shipped', 'delivered'].includes(o.status))
      .slice(0, 5);
  }, [orders]);

  // Form Field Change Handler
  const handleFormChange = (field: keyof CustomerFormData, value: string) => {
    setCustomerForm((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Smooth scroll to order form on "Order Now"
  const handleScrollToOrderForm = () => {
    const el = document.getElementById('order-form');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Submit Order Handler
  const handlePlaceOrder = async () => {
    const errors: Record<string, string> = {};

    if (!customerForm.name.trim()) {
      errors.name = 'আপনার নাম লিখুন';
    }

    const phoneValidation = apiService.validateBangladeshiPhone(customerForm.phone);
    if (!phoneValidation.isValid) {
      errors.phone = phoneValidation.message || 'ভুল মোবাইল নম্বর';
    }

    if (!customerForm.address.trim()) {
      errors.address = 'আপনার সম্পূর্ণ ঠিকানা লিখুন';
    }

    if (selectedItems.length === 0) {
      alert('অনুগ্রহ করে কমপক্ষে একটি প্রোডাক্ট নির্বাচন করুন');
      return;
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      handleScrollToOrderForm();
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await apiService.submitOrder({
        customer: customerForm,
        items: selectedItems,
        shippingOption: shippingOptionId,
        shippingFee: shippingFee,
        bulkDiscount: bulkDiscount,
        paymentMethod: paymentMethod,
        source: 'web_checkout',
      });

      // Update local state
      setCreatedOrder(result.order);
      setOrders(apiService.getOrders());
      setOfflineQueueCount(apiService.getOfflineQueue().length);
    } catch (err: unknown) {
      const e = err as Error;
      alert(`অর্ডার ব্যর্থ হয়েছে: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOrderCreatedFromPos = (newOrder: OrderRecord) => {
    setOrders(apiService.getOrders());
    setOfflineQueueCount(apiService.getOfflineQueue().length);
  };

  const handleOrderStatusUpdated = async (orderId: string, newStatus: OrderStatus) => {
    await apiService.updateOrderStatus(orderId, newStatus);
    setOrders(apiService.getOrders());
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center">
      {/* Top Device & POS Navigation Switcher (Desktop Bar) */}
      <div className="w-full bg-stone-900 text-stone-300 py-1.5 px-4 text-xs hidden md:flex items-center justify-between border-b border-stone-800">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-white tracking-wide">DeshiKart POS &amp; Checkout Client</span>
          <span className="text-stone-500">•</span>
          <span className="text-stone-400">Android Chrome Layout Match</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-stone-800 p-0.5 rounded-lg border border-stone-700">
            <button
              onClick={() => setDeviceFrameMode('mobile')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
                deviceFrameMode === 'mobile'
                  ? 'bg-amber-600 text-white font-bold'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Android Mobile Frame</span>
            </button>
            <button
              onClick={() => setDeviceFrameMode('full')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
                deviceFrameMode === 'full'
                  ? 'bg-amber-600 text-white font-bold'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Full Viewport</span>
            </button>
          </div>

          <button
            onClick={() => setActiveView('pos')}
            className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold"
          >
            <span>Launch POS Cashier Terminal</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* Main Container / Simulated Android Mobile Frame */}
      <div
        className={`w-full transition-all duration-300 ${
          deviceFrameMode === 'mobile'
            ? 'max-w-[430px] my-0 md:my-6 shadow-2xl rounded-none md:rounded-3xl overflow-hidden border-0 md:border md:border-stone-300 bg-white'
            : 'max-w-4xl my-0 md:my-4 bg-white shadow-xl rounded-none md:rounded-2xl border-0 md:border md:border-stone-200'
        }`}
      >
        {/* Simulated Android Chrome Address Bar (Visible in Mobile Frame on Desktop) */}
        {deviceFrameMode === 'mobile' && (
          <div className="hidden md:flex flex-col bg-stone-900 text-white px-4 py-2 border-b border-stone-800 select-none">
            {/* Status bar */}
            <div className="flex justify-between items-center text-[11px] text-stone-300 mb-1.5 font-medium">
              <span>8:55</span>
              <div className="flex items-center gap-2">
                <span>202 KB/s</span>
                <span>📶</span>
                <span>🔋 70%</span>
              </div>
            </div>
            {/* Chrome Omnibox */}
            <div className="flex items-center gap-2 bg-stone-800 rounded-full px-3 py-1.5 text-xs text-stone-300">
              <span className="text-stone-400">🔒</span>
              <span className="text-stone-100 font-medium">deshikart.store</span>
              <span className="text-stone-500">/f/glass-bottle-1500</span>
            </div>
          </div>
        )}

        {/* Storefront Header */}
        <Header
          totalItemsCount={totalItemsCount}
          activeView={activeView}
          onViewChange={setActiveView}
          onTrackOrderClick={() => {
            const el = document.getElementById('order-tracking');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          isOnline={isOnline}
          offlineQueueCount={offlineQueueCount}
        />

        {/* Main Content Area */}
        <main className="divide-y divide-stone-100">
          {/* 1. Hero Section (Image, Serif Title, Badges, Benefits, CTA) */}
          <HeroSection
            product={PRODUCT_DATA}
            onOrderNowClick={handleScrollToOrderForm}
          />

          {/* 2. Product Gallery Carousel (প্রোডাক্ট ছবিগুলো দেখে নিন) */}
          <ProductGallery galleryImages={PRODUCT_DATA.galleryImages} />

          {/* 3. Specifications Table (প্রোডাক্ট স্পেসিফিকেশন) */}
          <ProductSpecs specs={PRODUCT_DATA.specs} />

          {/* 4. Variant Selection (আপনার প্রোডাক্ট নির্বাচন করুন) with Low Stock indicator */}
          <VariantSelector
            variants={PRODUCT_DATA.variants}
            selectedVariants={selectedVariants}
            lowStockThreshold={PRODUCT_DATA.lowStockThreshold}
            onToggleVariant={handleToggleVariant}
            onQuantityChange={handleQuantityChange}
          />

          {/* 5. Customer Delivery Information Form (অর্ডারটি নিশ্চিত করতে আপনার তথ্য দিন) */}
          <CustomerForm
            formData={customerForm}
            formErrors={formErrors}
            onChange={handleFormChange}
          />

          {/* 6. Order Summary Collapsible with live total & Bulk Discount badge */}
          <OrderSummary
            selectedItems={selectedItems}
            shippingFee={shippingFee}
            subtotal={subtotal}
            bulkDiscount={bulkDiscount}
            total={total}
          />

          {/* 7. Shipping Options (Inside Dhaka 70.00৳ / Outside Dhaka 130.00৳) */}
          <ShippingSection
            options={SHIPPING_OPTIONS}
            selectedId={shippingOptionId}
            onSelect={setShippingOptionId}
          />

          {/* 8. Payment Method (Cash on delivery) */}
          <PaymentSection
            paymentMethod={paymentMethod}
            onSelectMethod={setPaymentMethod}
          />

          {/* 9. Final Place Order CTA Button */}
          <PlaceOrderButton
            total={total}
            isLoading={isSubmitting}
            onClick={handlePlaceOrder}
            disabled={selectedItems.length === 0}
          />

          {/* 10. Order Delivery Status Tracker (ফোন নম্বর দিয়ে ডেলিভারি স্ট্যাটাস চেক) */}
          <OrderTrackingSection
            onReOrderClick={handleScrollToOrderForm}
            recentPhone={createdOrder ? createdOrder.customer.phone : customerForm.phone}
          />

          {/* 11. Recent Orders Section with status filter and copy tracking ID */}
          <RecentOrdersSection
            orders={orders}
            onTrackOrder={(phone) => {
              const el = document.getElementById('order-tracking');
              el?.scrollIntoView({ behavior: 'smooth' });
              const input = el?.querySelector('input[type="tel"]') as HTMLInputElement;
              if (input) {
                input.value = phone;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                // Trigger form submit
                const form = el?.querySelector('form') as HTMLFormElement;
                form?.requestSubmit();
              }
            }}
          />
        </main>

        {/* Footer Reassurance Notes */}
        <footer className="bg-stone-50 py-6 px-4 text-center border-t border-stone-200 text-stone-500 text-xs font-bengali space-y-2">
          <div className="flex items-center justify-center gap-4 text-stone-600 font-medium">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              ১০০% অরিজিনাল প্রোডাক্ট
            </span>
            <span className="flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-amber-600" />
              সারা বাংলাদেশে হোম ডেলিভারি
            </span>
          </div>
          <p>© {new Date().getFullYear()} DeshiKart Bangladesh. All rights reserved.</p>
        </footer>
      </div>

      {/* Order Success Modal */}
      {createdOrder && (
        <OrderSuccessModal
          order={createdOrder}
          onClose={() => setCreatedOrder(null)}
          onTrackClick={() => {
            setCreatedOrder(null);
            setTimeout(() => {
              const el = document.getElementById('order-tracking');
              el?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}
        />
      )}

      {/* Android POS Terminal Modal */}
      {activeView === 'pos' && (
        <PosTerminalModal
          orders={orders}
          variants={PRODUCT_DATA.variants}
          onOrderCreated={handleOrderCreatedFromPos}
          onOrderStatusUpdated={handleOrderStatusUpdated}
          onClose={() => setActiveView('storefront')}
          onOpenApiSettings={() => setActiveView('api_config')}
        />
      )}

      {/* Laravel REST API Configuration Modal */}
      {activeView === 'api_config' && (
        <ApiConfigModal
          onClose={() => setActiveView('storefront')}
          onConfigSaved={() => {
            setOrders(apiService.getOrders());
            setOfflineQueueCount(apiService.getOfflineQueue().length);
          }}
        />
      )}
    </div>
  );
}
