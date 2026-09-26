import React, { useEffect, useRef } from 'react';
import { X, Printer, ShieldCheck, Phone, MapPin, Calendar, FileText } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { formatTsh } from '../../utils/currency';
import { useSettings } from '../../context/SettingsContext';
import { AMSTERDAM_WHATSAPP_NUMBER, AMSTERDAM_WHATSAPP_DISPLAY } from '../../utils/constants';

export default function InvoiceModal({ isOpen, onClose, invoiceData }) {
  const printRef = useRef(null);
  const { whatsappNumber, whatsappDisplay } = useSettings();
  const activeWaNumber = whatsappNumber || AMSTERDAM_WHATSAPP_NUMBER;
  const activeWaDisplay = whatsappDisplay || AMSTERDAM_WHATSAPP_DISPLAY;

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !invoiceData) return null;

  const handlePrint = () => {
    window.print();
  };

  const isWholesale = (invoiceData.pricing_mode || '').toUpperCase() === 'WHOLESALE';
  const formattedDate = invoiceData.created_at
    ? new Date(invoiceData.created_at).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    : new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });

  // Official WhatsApp Contact & Order Confirmation Payload
  const waNumber = activeWaNumber;
  const itemsSummary = invoiceData.items && invoiceData.items.length > 0
    ? invoiceData.items.map(i => `• ${i.product_name_snapshot} (${i.quantity}x) — ${formatTsh(i.subtotal)}`).join('\n')
    : '• Feed / Veterinary Products';

  const waMessage = [
    `Hello Amsterdam Group,`,
    ``,
    `I would like to verify & confirm my order:`,
    `Order Number: ${invoiceData.order_number}`,
    `Date: ${formattedDate}`,
    ``,
    `Customer Details:`,
    `Name: ${invoiceData.customer_name}`,
    `Phone: ${invoiceData.customer_phone}`,
    `Location: ${invoiceData.customer_location}`,
    ``,
    `Items Ordered:`,
    itemsSummary,
    ``,
    `Total Amount: ${formatTsh(invoiceData.total_amount)}`,
    `Payment Status: ${invoiceData.status === 'PENDING' ? 'Pending Confirmation' : invoiceData.status}`,
    ``,
    `Please confirm dispatch & delivery schedule.`
  ].join('\n');

  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6 print:p-0 print:bg-transparent print:static animate-in fade-in duration-200">
      
      {/* Backdrop (Screen only) */}
      <div className="fixed inset-0 print:hidden" onClick={onClose}></div>

      {/* Modal Wrapper */}
      <div 
        className="relative z-10 flex flex-col my-auto max-w-3xl w-full print:max-w-none print:w-full print:m-0"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Control Bar (Screen only) */}
        <div className="mb-3 px-4 sm:px-6 py-3 bg-white/95 backdrop-blur-md rounded-2xl border border-gray-100 flex items-center justify-between shadow-lg print:hidden">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Invoice Document</span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
              isWholesale ? 'bg-[#881A28]/10 text-[#881A28] border border-[#881A28]/30' : 'bg-[#80C345]/15 text-[#4D801E] border border-[#80C345]/40'
            }`}>
              {isWholesale ? 'Wholesale Bulk Order' : 'Retail Order'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#881A28] hover:bg-[#6e131f] text-white text-xs font-bold transition-all shadow-sm active:scale-95"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-black flex items-center justify-center transition-colors"
              aria-label="Close invoice"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable A4 Document Sheet */}
        <div 
          id="printable-invoice" 
          ref={printRef} 
          className="bg-white text-[#1A1A1A] rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-10 border border-gray-100 min-h-[720px] flex flex-col justify-between print:rounded-none print:shadow-none print:border-none print:min-h-0"
        >
          
          {/* Header Section */}
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-gray-200">
              
              {/* Left: Official Logo & Company Contact */}
              <div className="max-w-sm">
                <img 
                  src="/logo.png" 
                  alt="Amsterdam Group" 
                  className="h-10 sm:h-12 w-auto object-contain mb-2.5" 
                />
                <p className="text-[11px] font-bold text-[#80C345] uppercase tracking-wider">
                  Agricultural & Veterinary Solutions
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                  Dar es Salaam Showroom & Central Warehouse • Tanzania Mainland & Regional Delivery
                </p>
                <p className="text-[11px] text-gray-600 font-medium mt-1">
                  WhatsApp / Phone: <span className="font-semibold text-[#1A1A1A]">+255 651 728 851</span>
                </p>
                <p className="text-[11px] text-gray-600 font-medium">
                  Email: <span className="font-semibold text-[#1A1A1A]">info@amsterdamgroup.co.tz</span>
                </p>
              </div>

              {/* Right: Invoice Reference Metadata */}
              <div className="sm:text-right space-y-1 w-full sm:w-auto">
                <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#881A28] tracking-tight uppercase leading-none">
                  INVOICE
                </h1>
                <div className="font-mono font-extrabold text-base sm:text-lg text-[#1A1A1A] pt-0.5">
                  {invoiceData.order_number}
                </div>
                
                <div className="text-xs text-gray-500 flex sm:justify-end items-center gap-1 pt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span>Date: <strong className="text-[#1A1A1A] font-semibold">{formattedDate}</strong></span>
                </div>

                <div className="flex sm:justify-end items-center gap-2 pt-0.5">
                  <span className="text-xs text-gray-500">Pricing Type:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                    isWholesale 
                      ? 'bg-[#881A28]/10 text-[#881A28] border border-[#881A28]/30' 
                      : 'bg-[#80C345]/15 text-[#4D801E] border border-[#80C345]/40'
                  }`}>
                    {isWholesale ? 'WHOLESALE' : 'RETAIL'}
                  </span>
                </div>

                <div className="text-xs text-gray-500 pt-0.5">
                  Payment Status:{' '}
                  <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                    {invoiceData.status === 'PENDING' ? 'Pending Confirmation' : invoiceData.status}
                  </span>
                </div>
              </div>

            </div>

            {/* Subtle Brand Accent Line */}
            <div className="w-full h-1 bg-gradient-to-r from-[#80C345] via-[#80C345] to-[#881A28] my-4 rounded-full" />

            {/* Customer Information & Order Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4 p-4 rounded-2xl bg-[#FAFCF8] border border-gray-200 text-xs">
              
              {/* BILL TO */}
              <div>
                <span className="text-[10px] font-extrabold uppercase text-[#881A28] tracking-wider block mb-1">
                  BILL TO / DELIVER TO:
                </span>
                <h3 className="font-display font-bold text-sm text-[#1A1A1A]">
                  {invoiceData.customer_name}
                </h3>
                <p className="text-gray-600 mt-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#80C345] shrink-0" />
                  <span className="font-semibold text-[#1A1A1A]">{invoiceData.customer_phone}</span>
                </p>
                <p className="text-gray-600 mt-1 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#80C345] shrink-0 mt-0.5" />
                  <span className="font-medium text-[#1A1A1A]">{invoiceData.customer_location}</span>
                </p>
                {invoiceData.customer_notes && (
                  <p className="mt-2 text-gray-600 text-[11px] leading-relaxed pt-1.5 border-t border-gray-200/60 italic">
                    <span className="font-bold not-italic text-gray-500">Note:</span> {invoiceData.customer_notes}
                  </p>
                )}
              </div>

              {/* ORDER INFORMATION */}
              <div className="sm:border-l sm:border-gray-200 sm:pl-4 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-[#80C345] tracking-wider block mb-1">
                    ORDER PARTICULARS:
                  </span>
                  <p className="text-gray-600">
                    Order Ref: <strong className="font-mono text-[#1A1A1A]">{invoiceData.order_number}</strong>
                  </p>
                  <p className="text-gray-600">
                    Pricing Mode: <strong className="text-[#1A1A1A] font-bold">{invoiceData.pricing_mode || 'RETAIL'}</strong>
                  </p>
                  <p className="text-gray-600">
                    Fulfillment: <span className="font-medium text-[#1A1A1A]">Central Warehouse Stock Reserve</span>
                  </p>
                </div>
                
                <div className="mt-2 pt-2 border-t border-gray-200/60 flex items-center gap-1.5 text-[11px] text-[#4D801E] font-semibold">
                  <ShieldCheck className="w-4 h-4 text-[#80C345] shrink-0" />
                  <span>Official Amsterdam Group Verified Order</span>
                </div>
              </div>

            </div>

            {/* Itemized Products Table */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 my-4 shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#EFF6EA] text-[#1A1A1A] font-extrabold text-[10px] uppercase tracking-wider border-b border-gray-200">
                    <th className="py-2.5 px-4 text-left">Product & Description</th>
                    <th className="py-2.5 px-3 text-center w-16">Qty</th>
                    <th className="py-2.5 px-4 text-right w-28">Unit Price</th>
                    <th className="py-2.5 px-4 text-right w-32">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoiceData.items?.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-gray-50/50">
                      <td className="py-3 px-4 font-semibold text-[#1A1A1A]">
                        <div>{item.product_name_snapshot}</div>
                        {item.package_name && (
                          <div className="mt-1">
                            <span className="inline-block px-2 py-0.5 rounded bg-[#EFF6EA] text-[#4D801E] text-[10px] font-bold border border-[#D5ECC2]">
                              Package: {item.package_name}
                            </span>
                          </div>
                        )}
                        <div className="text-[10px] text-gray-400 font-normal mt-0.5">
                          Certified Quality Formula • East African Veterinary Standard
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-[#1A1A1A] font-mono">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600 font-mono">
                        {formatTsh(item.unit_price)}
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-[#1A1A1A] font-mono">
                        {formatTsh(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary, WhatsApp QR Verification & Settlement Terms */}
            <div className="grid grid-cols-1 sm:grid-cols-12 print:grid-cols-12 gap-3.5 my-2 pt-1 items-start">
              
              {/* Order & Payment Terms (col-span-5) */}
              <div className="sm:col-span-5 print:col-span-5 text-[11px] text-gray-500 space-y-1">
                <span className="font-extrabold uppercase text-[10px] text-[#881A28] tracking-wider block mb-0.5">
                  Order & Payment Terms:
                </span>
                <p>• Stock has been secured and reserved immediately in our central warehouse.</p>
                <p>• Settlement via M-Pesa / Tigo Pesa / Bank Transfer or on verified delivery.</p>
                <p>• For dispatch scheduling & logistics confirmation, contact WhatsApp <span className="font-semibold text-[#1A1A1A]">+255 651 728 851</span>.</p>
              </div>

              {/* WhatsApp QR Verification Card (Position 1: Beside Payment Terms) */}
              <div className="sm:col-span-3 print:col-span-3 bg-[#FAFDF7] rounded-2xl p-2.5 border border-[#80C345]/35 flex flex-col items-center text-center shadow-xs">
                <div className="flex items-center gap-1 text-[9px] font-extrabold text-[#4D801E] uppercase tracking-wider mb-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#80C345]"></span>
                  Scan for WhatsApp
                </div>
                
                <a 
                  href={waUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  title="Click or scan to open in WhatsApp"
                  className="p-1.5 bg-white rounded-xl border border-gray-200/90 shadow-xs flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
                >
                  <QRCodeSVG 
                    value={waUrl} 
                    size={78} 
                    level="M" 
                    fgColor="#1A1A1A"
                    bgColor="#FFFFFF"
                  />
                </a>

                <div className="text-[9px] text-gray-500 font-medium mt-1.5 leading-tight">
                  <span className="font-mono font-bold text-[#1A1A1A] block">{activeWaDisplay}</span>
                  <span>Instant Order Confirmation</span>
                </div>
              </div>

              {/* Total Calculation Card (col-span-4) */}
              <div className="sm:col-span-4 print:col-span-4 w-full bg-[#FAFCF8] rounded-2xl p-3.5 border border-gray-200 text-xs space-y-1.5">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-mono font-semibold text-[#1A1A1A]">
                    {formatTsh(invoiceData.total_amount)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600 pb-1.5 border-b border-gray-200">
                  <span>Delivery:</span>
                  <span className="text-[#4D801E] font-semibold text-[11px]">Standard Regional Dispatch</span>
                </div>
                <div className="flex justify-between items-baseline pt-1">
                  <span className="font-display font-extrabold text-xs uppercase tracking-wider text-[#1A1A1A]">
                    TOTAL:
                  </span>
                  <span className="font-display font-extrabold text-base sm:text-lg text-[#881A28] font-mono">
                    {formatTsh(invoiceData.total_amount)}
                  </span>
                </div>
              </div>

            </div>

          </div>

          {/* Clean Corporate Footer (Anchored to A4 Bottom) */}
          <div className="mt-6 pt-4 border-t border-gray-200 text-[10px] text-gray-400 space-y-1">
            <div className="flex items-center justify-between text-gray-600 font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="text-[#80C345] font-extrabold">Amsterdam</span>
                <span className="text-[#881A28] font-extrabold">group</span>
                <span className="italic text-[#1A1A1A] font-normal">— Moving Together</span>
              </div>
              <div className="font-mono text-[9px] uppercase tracking-wider text-gray-400">
                [ OFFICIAL ELECTRONIC INVOICE ]
              </div>
            </div>
            <p className="text-gray-400 text-[10px] pt-0.5">
              Amsterdam Group Co. Ltd. • Quality Animal Health & Nutrition Products — Tanzania • info@amsterdamgroup.co.tz
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
