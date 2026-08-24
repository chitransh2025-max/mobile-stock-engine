import React, { useState } from 'react';
import { X, MessageSquare, Printer, CheckCircle, TrendingUp, CreditCard, Banknote, QrCode } from 'lucide-react';
import { InventoryItem } from '../../types/database.types';
import { generateWhatsAppInvoiceURL, printThermalReceipt, SaleSummary } from '../../utils/receiptGenerator';

interface POSModalProps {
  item: InventoryItem;
  onClose: () => void;
  onConfirmSale: (item: InventoryItem, qty: number, netProfit: number) => void;
}

export const QuickPOSModal: React.FC<POSModalProps> = ({
  item,
  onClose,
  onConfirmSale,
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'UPI' | 'CARD'>('UPI');
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [saleSummary, setSaleSummary] = useState<SaleSummary | null>(null);

  const primaryModel = item.compatible_models?.find((m) => m.is_primary)?.model_name || 'Generic Device';
  const totalAmount = quantity * item.selling_price;
  const totalCost = quantity * item.cost_price;
  const netProfit = totalAmount - totalCost;

  const handleCompleteSale = () => {
    const summary: SaleSummary = {
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      customerPhone: customerPhone.trim() || undefined,
      paymentMode,
      items: [
        {
          id: item.id,
          variant_name: item.variant_name,
          device_name: primaryModel,
          selling_price: item.selling_price,
          cost_price: item.cost_price,
          quantity,
        },
      ],
      totalAmount,
      totalProfit: netProfit,
      timestamp: new Date().toLocaleString(),
    };

    setSaleSummary(summary);
    onConfirmSale(item, quantity, netProfit);
    setIsCompleted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-zinc-100">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-zinc-400 hover:text-white rounded-lg bg-zinc-800/60"
        >
          <X className="w-4 h-4" />
        </button>

        {!isCompleted ? (
          <div>
            <h2 className="text-lg font-bold text-white mb-1">Quick POS Checkout</h2>
            <p className="text-xs text-zinc-400 mb-4">{primaryModel} • {item.variant_name}</p>

            {/* Quantity Selector */}
            <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-3.5 mb-4 flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">Sale Quantity</span>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 5].map((num) => (
                  <button
                    key={num}
                    onClick={() => setQuantity(num)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                      quantity === num
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="mb-4">
              <span className="text-xs font-medium text-zinc-400 block mb-2">Payment Method</span>
              <div className="grid grid-cols-3 gap-2">
                {(['UPI', 'CASH', 'CARD'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setPaymentMode(mode)}
                    className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-semibold ${
                      paymentMode === mode
                        ? 'bg-zinc-100 border-white text-zinc-950'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {mode === 'UPI' && <QrCode className="w-3.5 h-3.5" />}
                    {mode === 'CASH' && <Banknote className="w-3.5 h-3.5" />}
                    {mode === 'CARD' && <CreditCard className="w-3.5 h-3.5" />}
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer WhatsApp Phone */}
            <div className="mb-5">
              <label className="text-xs font-medium text-zinc-400 block mb-1.5">
                Customer Phone (Optional for WhatsApp Slip)
              </label>
              <input
                type="tel"
                placeholder="10-digit Mobile Number"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                maxLength={10}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
              />
            </div>

            {/* Financial Margin Overview */}
            <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-3 mb-5 flex justify-between items-center">
              <div>
                <span className="text-[10px] uppercase font-semibold text-emerald-500 block">Total Amount</span>
                <span className="text-lg font-black text-emerald-400">₹{totalAmount.toFixed(2)}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-semibold text-zinc-500 flex items-center gap-1 justify-end">
                  <TrendingUp className="w-3 h-3 text-emerald-400" /> Net Profit
                </span>
                <span className="text-sm font-bold text-zinc-200">+₹{netProfit.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCompleteSale}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs py-3 rounded-xl transition-colors shadow-lg shadow-emerald-950"
            >
              Confirm Sale & Deduct Stock
            </button>
          </div>
        ) : (
          /* Sale Success & Export Actions */
          <div className="text-center py-3">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">Sale Recorded Successfully!</h3>
            <p className="text-xs text-zinc-400 mb-6">Stock deducted & net profit logged to ledger.</p>

            <div className="flex flex-col gap-2.5">
              {saleSummary && (
                <a
                  href={generateWhatsAppInvoiceURL(saleSummary)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-zinc-950 font-bold text-xs py-2.5 px-4 rounded-xl transition-colors"
                >
                  <MessageSquare className="w-4 h-4" /> Share WhatsApp Invoice
                </a>
              )}

              {saleSummary && (
                <button
                  onClick={() => printThermalReceipt(saleSummary)}
                  className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold text-xs py-2.5 px-4 rounded-xl transition-colors border border-zinc-700"
                >
                  <Printer className="w-4 h-4" /> Print 58mm Thermal Slip
                </button>
              )}

              <button
                onClick={onClose}
                className="mt-2 text-xs text-zinc-500 hover:text-zinc-300 font-medium py-1"
              >
                Close Window
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
