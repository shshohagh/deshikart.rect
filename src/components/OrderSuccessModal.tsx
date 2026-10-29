import React from 'react';
import { CheckCircle2, Printer, MessageCircle, ArrowLeft, PackageCheck } from 'lucide-react';
import { OrderRecord } from '../types';

interface OrderSuccessModalProps {
  order: OrderRecord;
  onClose: () => void;
  onTrackClick?: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ order, onClose, onTrackClick }) => {
  const handlePrint = () => {
    window.print();
  };

  const whatsappMessage = encodeURIComponent(
    `Hello DeshiKart! I placed Order #${order.orderNumber} for 1.5L Borosilicate Glass Drinking Bottle.\nName: ${order.customer.name}\nPhone: ${order.customer.phone}\nTotal: ${order.total} BDT.`
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="bg-emerald-600 text-white p-6 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-bengali">
            অর্ডারটি সফলভাবে সম্পন্ন হয়েছে!
          </h2>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1">
            আপনার অর্ডার নম্বর:{' '}
            <span className="font-bold font-mono tracking-wider text-white">
              {order.orderNumber}
            </span>
          </p>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Status Badge */}
          <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-stone-700">
              <PackageCheck className="w-4 h-4 text-emerald-600" />
              <span>ডেলিভারি স্ট্যাটাস:</span>
            </div>
            <span className="font-bold text-amber-700 uppercase bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
              {order.status}
            </span>
          </div>

          {/* Delivery Info */}
          <div className="border border-stone-200 rounded-xl p-4 bg-stone-50/50 text-xs sm:text-sm space-y-1.5 font-bengali">
            <div className="flex justify-between">
              <span className="text-stone-500">গ্রাহকের নাম:</span>
              <span className="font-bold text-stone-800">{order.customer.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">ফোন নম্বর:</span>
              <span className="font-bold font-tabular text-stone-800">{order.customer.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">জেলা:</span>
              <span className="font-semibold text-stone-800">{order.customer.district}</span>
            </div>
            <div className="pt-1 border-t border-stone-200 text-stone-700">
              <span className="text-stone-500 block mb-0.5">ঠিকানা:</span>
              <span className="font-medium">{order.customer.address}</span>
            </div>
          </div>

          {/* Ordered Items Summary */}
          <div className="border border-stone-200 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              অর্ডারকৃত আইটেম
            </h4>
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center font-bold text-xs">
                    {item.quantity}
                  </span>
                  <span className="font-medium text-stone-800 line-clamp-1">
                    {item.name}
                  </span>
                </div>
                <span className="font-bold text-stone-900 font-tabular shrink-0 ml-2">
                  {item.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}৳
                </span>
              </div>
            ))}

            <div className="pt-2 border-t border-stone-200 space-y-1 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>সাবটোটাল</span>
                <span className="font-semibold font-tabular">
                  {order.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}৳
                </span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>ডেলিভারি চার্জ ({order.shippingOption === 'inside_dhaka' ? 'ঢাকার ভিতরে' : 'ঢাকার বাইরে'})</span>
                <span className="font-semibold font-tabular">
                  {order.shippingFee.toLocaleString('en-US', { minimumFractionDigits: 2 })}৳
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-stone-900 pt-1 border-t border-stone-200">
                <span>সর্বমোট (Cash On Delivery)</span>
                <span className="text-amber-700 font-tabular font-extrabold text-base">
                  {order.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}৳
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-stone-600" />
              <span>রসিদ প্রিন্ট করুন</span>
            </button>

            <a
              href={`https://wa.me/8801700000000?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp কনফার্ম</span>
            </a>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => {
                onClose();
                if (onTrackClick) {
                  onTrackClick();
                } else {
                  const el = document.getElementById('order-tracking');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="flex-1 py-2.5 px-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-bengali"
            >
              <span>ডেলিভারি ট্র্যাক করুন</span>
            </button>

            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-3 text-stone-600 hover:text-stone-900 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>হোমপেজে যান</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hidden Thermal Receipt for Print */}
      <div id="thermal-receipt" className="hidden">
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0' }}>DeshiKart</h2>
          <p style={{ margin: '2px 0', fontSize: '10px' }}>Hotline: 01700-000000</p>
          <p style={{ margin: '2px 0', fontSize: '10px' }}>Order: #{order.orderNumber}</p>
          <p style={{ margin: '2px 0', fontSize: '9px' }}>
            Date: {new Date(order.createdAt).toLocaleString()}
          </p>
          <hr style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />
        </div>

        <div style={{ marginBottom: '8px' }}>
          <p style={{ margin: '2px 0', fontWeight: 'bold' }}>Customer Details:</p>
          <p style={{ margin: '1px 0' }}>{order.customer.name}</p>
          <p style={{ margin: '1px 0' }}>{order.customer.phone}</p>
          <p style={{ margin: '1px 0' }}>{order.customer.district}</p>
          <p style={{ margin: '1px 0' }}>{order.customer.address}</p>
          <hr style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />
        </div>

        <div style={{ marginBottom: '8px' }}>
          <p style={{ margin: '2px 0', fontWeight: 'bold' }}>Items:</p>
          {order.items.map((it, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0' }}>
              <span>
                {it.name} ({it.colorName}) x{it.quantity}
              </span>
              <span>{it.total} BDT</span>
            </div>
          ))}
          <hr style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0' }}>
            <span>Subtotal:</span>
            <span>{order.subtotal} BDT</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0' }}>
            <span>Shipping:</span>
            <span>{order.shippingFee} BDT</span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontWeight: 'bold',
              fontSize: '13px',
              marginTop: '4px',
              borderTop: '1px solid #000',
              paddingTop: '4px',
            }}
          >
            <span>Total Payable (COD):</span>
            <span>{order.total} BDT</span>
          </div>
          <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '10px' }}>
            <p>Thank you for shopping with DeshiKart!</p>
          </div>
        </div>
      </div>
    </div>
  );
};
