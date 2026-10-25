import React, { useState } from 'react';
import { useCyberCafe } from '../../context/CyberCafeContext';
import { X, Printer, Copy, Check, QrCode } from 'lucide-react';

export const PrintableReceiptModal: React.FC = () => {
  const {
    activeReceipt,
    activeModal,
    closeModal,
    settings
  } = useCyberCafe();

  const [copied, setCopied] = useState(false);

  if (activeModal !== 'receipt' || !activeReceipt) return null;

  const receipt = activeReceipt;
  const formattedDate = new Date(receipt.timestamp).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const upiId = settings.upiQrId || '8609550430@ybl';
  const upiPayee = encodeURIComponent(settings.cafeName);
  const upiAmount = receipt.totalAmount.toFixed(2);
  const upiUrl = `upi://pay?pa=${upiId}&pn=${upiPayee}&am=${upiAmount}&cu=INR&tn=Receipt_${receipt.receiptNumber}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(upiUrl)}&margin=2`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const lines = [
      `==============================`,
      `${settings.cafeName.toUpperCase()}`,
      settings.tagline ? `${settings.tagline}` : '',
      `${settings.address}`,
      `Tel: ${settings.phone}`,
      settings.cscId ? `CSC Kendra ID: ${settings.cscId}` : '',
      `UPI ID: ${upiId}`,
      `==============================`,
      `Receipt #: ${receipt.receiptNumber}`,
      `Date: ${formattedDate}`,
      `Customer: ${receipt.customerName}`,
      receipt.customerPhone ? `Phone: ${receipt.customerPhone}` : '',
      receipt.stationName ? `Station: ${receipt.stationName}` : '',
      receipt.durationMinutes > 0 ? `Duration: ${receipt.durationMinutes} mins` : '',
      `------------------------------`,
      receipt.timeCharge > 0 ? `PC Station Time: ${settings.currencySymbol}${receipt.timeCharge.toFixed(2)}` : '',
      ...receipt.orders.map(o => `${o.name} x${o.quantity} : ${settings.currencySymbol}${(o.price * o.quantity).toFixed(2)}`),
      `------------------------------`,
      `Subtotal: ${settings.currencySymbol}${receipt.subtotal.toFixed(2)}`,
      receipt.discountAmount > 0 ? `Discount: -${settings.currencySymbol}${receipt.discountAmount.toFixed(2)}` : '',
      receipt.taxAmount > 0 ? `Tax: ${settings.currencySymbol}${receipt.taxAmount.toFixed(2)}` : '',
      `TOTAL: ${settings.currencySymbol}${receipt.totalAmount.toFixed(2)}`,
      `Payment: ${receipt.paymentMethod.toUpperCase()}`,
      `UPI ID: ${upiId}`,
      `Operator: ${receipt.operatorName}`,
      `==============================`,
      `Thank you for visiting ${settings.cafeName}!`,
      `==============================`
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(lines);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs no-print-backdrop">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        
        {/* Header toolbar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950 no-print">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-200">Customer Bill & Receipt Slip</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              UPI Ready
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopy}
              title="Copy receipt as text"
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={handlePrint}
              title="Print receipt slip"
              className="px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-950" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={closeModal}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="overflow-y-auto p-4 sm:p-6 bg-slate-800/40 flex justify-center">
          
          {/* Realistic Thermal Receipt Slip */}
          <div
            id="printable-thermal-receipt"
            className="w-full max-w-[360px] bg-white text-slate-900 font-mono text-xs select-text p-5 rounded-lg shadow-lg border border-slate-300 space-y-3"
          >
            {/* Cafe Header */}
            <div className="text-center space-y-0.5 border-b border-dashed border-slate-400 pb-3">
              <h2 className="font-bold text-sm tracking-tight text-slate-950 uppercase leading-snug">
                {settings.cafeName}
              </h2>
              {settings.tagline && (
                <p className="text-[9.5px] text-slate-600 font-sans italic">{settings.tagline}</p>
              )}
              <p className="text-[10px] text-slate-600">{settings.address}</p>
              <p className="text-[10px] text-slate-700 font-bold">Helpline: {settings.phone}</p>
              {settings.cscId && (
                <p className="text-[9.5px] text-slate-500 font-mono">CSC Kendra ID: {settings.cscId}</p>
              )}
            </div>

            {/* Bill Meta */}
            <div className="space-y-1 text-[11px] border-b border-dashed border-slate-400 pb-2.5">
              <div className="flex justify-between">
                <span className="text-slate-600">Receipt No:</span>
                <span className="font-bold text-slate-900">{receipt.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Date & Time:</span>
                <span className="tabular-nums">{formattedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Customer:</span>
                <span className="font-bold text-slate-950">{receipt.customerName}</span>
              </div>
              {receipt.customerPhone && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Contact:</span>
                  <span className="font-mono">{receipt.customerPhone}</span>
                </div>
              )}
              {receipt.stationName && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Terminal:</span>
                  <span className="font-semibold">{receipt.stationName}</span>
                </div>
              )}
              {receipt.durationMinutes > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Usage Time:</span>
                  <span>{receipt.durationMinutes} mins</span>
                </div>
              )}
            </div>

            {/* Itemized Line Items */}
            <div className="space-y-1.5 text-[11px] border-b border-dashed border-slate-400 pb-2.5">
              <div className="flex justify-between text-[10px] text-slate-500 uppercase tracking-wider font-sans font-semibold">
                <span>Description</span>
                <span>Amount</span>
              </div>

              {receipt.timeCharge > 0 && (
                <div className="flex justify-between items-baseline">
                  <span>PC Browsing / Station Time</span>
                  <span className="tabular-nums font-semibold">
                    {settings.currencySymbol}{receipt.timeCharge.toFixed(2)}
                  </span>
                </div>
              )}

              {receipt.orders.map((item, idx) => (
                <div key={idx} className="flex justify-between items-baseline">
                  <span className="truncate max-w-[210px]">
                    {item.name} <span className="text-slate-500">×{item.quantity}</span>
                  </span>
                  <span className="tabular-nums font-semibold shrink-0">
                    {settings.currencySymbol}{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1 text-[11px] border-b border-dashed border-slate-400 pb-2.5">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="tabular-nums">{settings.currencySymbol}{receipt.subtotal.toFixed(2)}</span>
              </div>

              {receipt.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Special Discount:</span>
                  <span className="tabular-nums">-{settings.currencySymbol}{receipt.discountAmount.toFixed(2)}</span>
                </div>
              )}

              {receipt.taxAmount > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>GST / Tax ({settings.taxRatePct}%):</span>
                  <span className="tabular-nums">{settings.currencySymbol}{receipt.taxAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="border-t border-slate-900 pt-1.5 flex justify-between text-sm font-bold text-slate-950">
                <span>TOTAL AMOUNT:</span>
                <span className="tabular-nums text-base">{settings.currencySymbol}{receipt.totalAmount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-[10px] text-slate-600 pt-1">
                <span>Payment Mode: <strong>{receipt.paymentMethod.toUpperCase()}</strong></span>
                <span>Status: <strong className="text-emerald-700">PAID ✓</strong></span>
              </div>
            </div>

            {/* UPI QR Code Section */}
            <div className="pt-1 pb-1 text-center flex flex-col items-center justify-center space-y-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-800">
                <QrCode className="w-3.5 h-3.5 text-cyan-700" />
                <span>UPI Scan & Pay (ইউপিআই পেমেন্ট)</span>
              </div>

              {/* QR Image */}
              <div className="bg-white p-1.5 rounded-md border border-slate-300 inline-block shadow-xs">
                <img
                  src={qrCodeUrl}
                  alt={`UPI QR Code for ${upiId}`}
                  className="w-28 h-28 object-contain mx-auto"
                />
              </div>

              {/* UPI ID Info */}
              <div className="space-y-0.5">
                <p className="text-[11px] font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300">
                  UPI ID: {upiId}
                </p>
                <p className="text-[9px] text-slate-500 font-sans">
                  Google Pay · PhonePe · Paytm · BHIM
                </p>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="text-center text-[10px] text-slate-600 space-y-1 pt-1">
              <p className="font-medium">Thank you for visiting {settings.cafeName}!</p>
              <p className="text-[9px] text-slate-400 font-sans">
                Computerized receipt generated by NetSeva Suite. No signature required.
              </p>
            </div>

          </div>

        </div>

        {/* Modal Bottom Action Bar */}
        <div className="p-3 bg-slate-950 flex items-center justify-between border-t border-slate-800 no-print">
          <div className="text-[11px] text-slate-400 font-mono">
            UPI: <span className="text-cyan-400 font-bold">{upiId}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-950" />
              <span>Print Receipt</span>
            </button>
            <button
              onClick={closeModal}
              className="px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
