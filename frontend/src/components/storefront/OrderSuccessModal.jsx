import React, { useEffect, useState } from 'react';
import { CheckCircle2, MessageCircle, Copy, Check, ExternalLink, X, Printer, FileText } from 'lucide-react';
import { formatTsh } from '../../utils/currency';
import InvoiceModal from './InvoiceModal';

export default function OrderSuccessModal({ orderConfirmation, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  useEffect(() => {
    // Attempt automatic popup/tab launch on desktop or mobile if available
    if (isOpen && orderConfirmation?.whatsapp_url) {
      try {
        const openedWindow = window.open(orderConfirmation.whatsapp_url, '_blank');
        // If popup was blocked, user still has the high-visibility button
      } catch (err) {
        console.warn('Popup blocked by browser, user will click CTA button.', err);
      }
    }
  }, [isOpen, orderConfirmation]);

  if (!isOpen || !orderConfirmation) return null;

  const handleCopy = () => {
    if (orderConfirmation.whatsapp_message) {
      navigator.clipboard.writeText(orderConfirmation.whatsapp_message);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleOpenWhatsApp = () => {
    if (orderConfirmation.whatsapp_url) {
      window.open(orderConfirmation.whatsapp_url, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose}></div>

      {/* Modal Container */}
      <div 
        className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto z-10 border border-gray-100 p-6 sm:p-8 text-center flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-amsterdam-dark flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Success Animated Badge */}
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 ring-8 ring-emerald-50">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h3 className="font-display font-extrabold text-2xl text-amsterdam-dark">
          Order Placed Successfully!
        </h3>
        
        <p className="text-xs text-gray-500 mt-1 max-w-sm">
          Your order has been recorded in our system and stock has been reserved.
        </p>

        {/* Order Reference Pill & Mode */}
        <div className="mt-4 flex items-center gap-2">
          <div className="px-4 py-2 rounded-full bg-amsterdam-muted text-amsterdam-olive-dark font-mono font-bold text-sm border border-amsterdam-lime/30">
            Order #: {orderConfirmation.order_number}
          </div>
          <span className={`px-3 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider ${
            (orderConfirmation.pricing_mode || '').toUpperCase() === 'WHOLESALE'
              ? 'bg-amber-100 text-amber-900 border border-amber-300'
              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
          }`}>
            {(orderConfirmation.pricing_mode || 'RETAIL')}
          </span>
        </div>

        {/* Breakdown Card */}
        <div className="mt-5 w-full bg-[#F9FAF6] rounded-2xl p-4 text-left border border-gray-200/80 space-y-2 text-xs">
          <div className="flex justify-between pb-2 border-b border-gray-200/60">
            <span className="text-gray-500">Pricing Tier:</span>
            <span className="font-bold text-amsterdam-dark">
              {(orderConfirmation.pricing_mode || '').toUpperCase() === 'WHOLESALE' ? 'Wholesale Pricing' : 'Retail Pricing'}
            </span>
          </div>
          <div className="flex justify-between pb-2 border-b border-gray-200/60">
            <span className="text-gray-500">Customer:</span>
            <span className="font-bold text-amsterdam-dark">{orderConfirmation.customer_name}</span>
          </div>
          <div className="flex justify-between pb-2 border-b border-gray-200/60">
            <span className="text-gray-500">Delivery To:</span>
            <span className="font-bold text-amsterdam-dark truncate max-w-[200px]">{orderConfirmation.customer_location}</span>
          </div>
          <div className="flex justify-between pb-2 border-b border-gray-200/60">
            <span className="text-gray-500">Items:</span>
            <span className="font-bold text-amsterdam-dark">
              {orderConfirmation.items?.map(i => `${i.product_name_snapshot} × ${i.quantity}`).join(', ') || '1 product'}
            </span>
          </div>
          <div className="flex justify-between pt-1">
            <span className="font-bold text-gray-700">Total Amount:</span>
            <span className="font-display font-extrabold text-amsterdam-olive-dark text-sm">
              {formatTsh(orderConfirmation.total_amount)}
            </span>
          </div>
        </div>

        {/* WhatsApp Pre-Filled Preview */}
        <div className="mt-4 w-full text-left">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              WhatsApp Message Preview
            </span>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy text</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-3 bg-gray-100 rounded-xl text-[11px] text-gray-700 font-mono whitespace-pre-wrap max-h-28 overflow-y-auto border border-gray-200">
            {orderConfirmation.whatsapp_message}
          </pre>
        </div>

        {/* Invoice Action Buttons (View & Download) */}
        <div className="mt-4 w-full grid grid-cols-2 gap-2.5">
          <button
            onClick={() => setIsInvoiceOpen(true)}
            className="py-2.5 px-3 rounded-xl bg-amsterdam-muted hover:bg-amsterdam-lime/30 text-amsterdam-dark font-bold text-xs transition-all border border-amsterdam-lime/40 flex items-center justify-center gap-1.5 shadow-xs"
          >
            <FileText className="w-4 h-4 text-amsterdam-olive" />
            <span>View Invoice</span>
          </button>
          <button
            onClick={() => setIsInvoiceOpen(true)}
            className="py-2.5 px-3 rounded-xl bg-white hover:bg-gray-50 text-amsterdam-dark font-bold text-xs transition-all border border-gray-200 flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Printer className="w-4 h-4 text-gray-500" />
            <span>Download Invoice</span>
          </button>
        </div>

        {/* Big WhatsApp CTA Button */}
        <div className="mt-4 w-full space-y-2.5">
          <button
            onClick={handleOpenWhatsApp}
            className="w-full py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-display font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5 fill-white" />
            <span>CONTINUE TO WHATSAPP TO CONFIRM</span>
            <ExternalLink className="w-4 h-4 opacity-80" />
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-colors"
          >
            Continue Shopping
          </button>
        </div>

        {/* Dedicated Amsterdam Group Invoice Modal */}
        <InvoiceModal
          isOpen={isInvoiceOpen}
          onClose={() => setIsInvoiceOpen(false)}
          invoiceData={orderConfirmation}
        />

      </div>
    </div>
  );
}
