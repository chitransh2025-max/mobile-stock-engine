export interface CartItem {
  id: string;
  variant_name: string;
  device_name: string;
  selling_price: number;
  cost_price: number;
  quantity: number;
}

export interface SaleSummary {
  invoiceNumber: string;
  customerName?: string;
  customerPhone?: string;
  items: CartItem[];
  paymentMode: 'CASH' | 'UPI' | 'CARD';
  totalAmount: number;
  totalProfit: number;
  timestamp: string;
}

// 1. Generate Clean WhatsApp Formatted Message Link
export const generateWhatsAppInvoiceURL = (summary: SaleSummary, shopName: string = "Mobile Hub Accessories") => {
  const itemsText = summary.items
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.device_name}* - ${item.variant_name}\n   Qty: ${item.quantity} x ₹${item.selling_price} = ₹${item.quantity * item.selling_price}`
    )
    .join('\n');

  const message = 
`🧾 *INVOICE: #${summary.invoiceNumber}*
🏬 *${shopName}*
📅 Date: ${summary.timestamp}
--------------------------------
${itemsText}
--------------------------------
💰 *Total Paid:* ₹${summary.totalAmount.toFixed(2)}
💳 *Payment Mode:* ${summary.paymentMode}

Thank you for shopping with us! Visit again.`;

  const encodedMessage = encodeURIComponent(message);
  return summary.customerPhone
    ? `https://wa.me/91${summary.customerPhone}?text=${encodedMessage}`
    : `https://wa.me/?text=${encodedMessage}`;
};

// 2. Generate 58mm Thermal Print Window
export const printThermalReceipt = (summary: SaleSummary, shopName: string = "Mobile Hub") => {
  const printWindow = window.open('', '_blank', 'width=350,height=550');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receipt #${summary.invoiceNumber}</title>
        <style>
          @page { margin: 0; size: 58mm auto; }
          body {
            font-family: 'Courier New', Courier, monospace;
            width: 48mm;
            margin: 4mm auto;
            font-size: 11px;
            color: #000;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .border-b { border-bottom: 1px dashed #000; padding-bottom: 4px; margin-bottom: 4px; }
          .border-t { border-top: 1px dashed #000; padding-top: 4px; margin-top: 4px; }
          .row { display: flex; justify-content: space-between; margin: 2px 0; }
          .item-row { margin-bottom: 4px; }
        </style>
      </head>
      <body>
        <div class="center bold" style="font-size: 13px;">${shopName}</div>
        <div class="center">Accessories & Tempered Glass</div>
        <div class="center border-b">Inv: #${summary.invoiceNumber}</div>
        <div class="row"><span>Date:</span><span>${summary.timestamp.split(',')[0]}</span></div>
        <div class="row border-b"><span>Pay:</span><span>${summary.paymentMode}</span></div>
        
        <div style="margin: 6px 0;">
          ${summary.items
            .map(
              (i) => `
            <div class="item-row">
              <div class="bold">${i.device_name}</div>
              <div class="row">
                <span>${i.variant_name.substring(0, 16)}</span>
                <span>${i.quantity}x${i.selling_price}</span>
              </div>
            </div>`
            )
            .join('')}
        </div>

        <div class="border-t row bold" style="font-size: 12px;">
          <span>TOTAL:</span>
          <span>₹${summary.totalAmount.toFixed(2)}</span>
        </div>
        <div class="center border-t" style="margin-top: 8px;">* THANK YOU *</div>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
};
