import React, { useEffect, useRef } from 'react';
import bwipjs from 'bwip-js';
import { Printer, Download } from 'lucide-react';

interface LabelProps {
  brand: string;
  model: string;
  category: string;
  variant: string;
  sku: string;
  rackLocation: string;
  sellingPrice: number;
}

export const BarcodeLabelPrinter: React.FC<LabelProps> = ({
  brand,
  model,
  category,
  variant,
  sku,
  rackLocation,
  sellingPrice,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      try {
        bwipjs.toCanvas(canvasRef.current, {
          bcid: 'code128',
          text: sku,
          scale: 3,
          height: 12,
          includetext: true,
          textxalign: 'center',
          textsize: 10,
        });
      } catch (e) {
        console.error('Barcode rendering error:', e);
      }
    }
  }, [sku]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col items-center max-w-sm mx-auto text-zinc-100 shadow-xl">
      {/* 50mm x 30mm Thermal Label Preview */}
      <div 
        id="thermal-label"
        className="w-[50mm] h-[30mm] bg-white text-black p-2 rounded-sm flex flex-col justify-between items-center text-center shadow-md print:shadow-none print:m-0"
      >
        <div className="w-full flex justify-between items-center text-[8px] font-bold uppercase tracking-tight border-b border-black pb-0.5">
          <span>{brand} • {model}</span>
          <span className="bg-black text-white px-1 rounded-[2px]">{rackLocation}</span>
        </div>

        <div className="my-0.5">
          <canvas ref={canvasRef} className="max-w-[42mm] max-h-[14mm]" />
        </div>

        <div className="w-full flex justify-between items-end text-[8.5px] font-semibold border-t border-black pt-0.5">
          <span className="truncate max-w-[28mm] text-left">{variant}</span>
          <span className="text-[10px] font-extrabold">₹{sellingPrice}</span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex gap-2 mt-4 w-full">
        <button
          onClick={handlePrint}
          className="flex-1 flex items-center justify-center gap-1.5 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold py-2 px-3 rounded-lg transition-colors"
        >
          <Printer className="w-3.5 h-3.5" /> Print Label
        </button>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #thermal-label, #thermal-label * {
            visibility: visible;
          }
          #thermal-label {
            position: fixed;
            left: 0;
            top: 0;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
};
