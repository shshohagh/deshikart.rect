import React from 'react';
import { Lock, Loader2 } from 'lucide-react';

interface PlaceOrderButtonProps {
  total: number;
  isLoading: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export const PlaceOrderButton: React.FC<PlaceOrderButtonProps> = ({
  total,
  isLoading,
  onClick,
  disabled = false,
}) => {
  return (
    <div className="bg-white py-5 px-4 border-t border-stone-200">
      <div className="max-w-xl mx-auto">
        <button
          type="button"
          onClick={onClick}
          disabled={isLoading || disabled}
          className="w-full py-4 px-6 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 disabled:opacity-50 disabled:pointer-events-none text-white font-bold text-base sm:text-lg rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer uppercase tracking-wider"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing Order...</span>
            </>
          ) : (
            <>
              <Lock className="w-5 h-5" />
              <span>
                PLACE ORDER {total.toLocaleString('en-US', { minimumFractionDigits: 2 })}৳
              </span>
            </>
          )}
        </button>

        <p className="text-center text-[11px] text-stone-500 mt-2 font-bengali">
          অর্ডার বাটনে ক্লিক করার মাধ্যমে আপনার অর্ডারটি কনফার্ম হবে
        </p>
      </div>
    </div>
  );
};
