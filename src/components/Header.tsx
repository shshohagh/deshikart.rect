import React from 'react';
import { ShoppingBag, TabletSmartphone, Database, PhoneCall } from 'lucide-react';

interface HeaderProps {
  totalItemsCount: number;
  activeView: 'storefront' | 'pos' | 'api_config';
  onViewChange: (view: 'storefront' | 'pos' | 'api_config') => void;
  onTrackOrderClick?: () => void;
  isOnline: boolean;
  offlineQueueCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  totalItemsCount,
  activeView,
  onViewChange,
  onTrackOrderClick,
  isOnline,
  offlineQueueCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand Zone */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewChange('storefront')}
            className="flex items-center gap-2 focus:outline-hidden"
            title="DeshiKart Home"
          >
            <img
              src="/assets/images/deshikart_logo.png"
              alt="DeshiKart"
              className="h-9 w-auto object-contain"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Fallback SVG logo if image load fails
                const target = e.currentTarget;
                target.style.display = 'none';
                const sibling = target.nextElementSibling as HTMLElement;
                if (sibling) sibling.style.display = 'flex';
              }}
            />
            <div className="hidden items-center text-amber-600 font-extrabold text-xl tracking-tight">
              <span>Deshi</span><span className="text-stone-800">Kart</span>
            </div>
          </button>
        </div>

        {/* View Switchers & POS Quick Access */}
        <div className="flex items-center gap-2">
          {/* Track Order Direct Link */}
          <button
            onClick={() => {
              if (activeView !== 'storefront') onViewChange('storefront');
              if (onTrackOrderClick) {
                onTrackOrderClick();
              } else {
                const el = document.getElementById('order-tracking');
                el?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="flex items-center gap-1 text-xs text-stone-700 hover:text-amber-700 bg-stone-100 hover:bg-stone-200 px-2 py-1.5 rounded-lg font-medium transition-colors cursor-pointer"
            title="অর্ডার ট্র্যাক করুন"
          >
            <span className="hidden xs:inline">অর্ডার</span>
            <span>ট্র্যাক</span>
          </button>

          {/* POS Terminal Switcher */}
          <button
            onClick={() => onViewChange(activeView === 'pos' ? 'storefront' : 'pos')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeView === 'pos'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
            }`}
            title="Android POS Cashier Terminal"
          >
            <TabletSmartphone className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">POS</span>
          </button>

          {/* Laravel API Sync Settings */}
          <button
            onClick={() => onViewChange(activeView === 'api_config' ? 'storefront' : 'api_config')}
            className={`relative flex items-center justify-center p-1.5 text-xs rounded-lg transition-all ${
              activeView === 'api_config'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
            }`}
            title="Laravel REST API Sync Hub"
          >
            <Database className="w-4 h-4" />
            {offlineQueueCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {offlineQueueCount}
              </span>
            )}
          </button>

          {/* Cart Counter */}
          <button
            onClick={() => {
              if (activeView !== 'storefront') onViewChange('storefront');
              const el = document.getElementById('order-form');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors"
            title="অর্ডার সামারি দেখুন"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-700" />
            <span className="font-tabular">{totalItemsCount}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
