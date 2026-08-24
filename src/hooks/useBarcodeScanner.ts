import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

interface ScannerConfig {
  fps?: number;
  qrbox?: { width: number; height: number };
  aspectRatio?: number;
  beepOnScan?: boolean;
}

export const useBarcodeScanner = (
  elementId: string,
  onScanSuccess: (decodedText: string) => void,
  config: ScannerConfig = { fps: 20, qrbox: { width: 260, height: 160 }, beepOnScan: true }
) => {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScannedTime = useRef<number>(0);

  // Play audio/haptic feedback on successful inventory scan
  const triggerFeedback = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(80);
    if (config.beepOnScan) {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    }
  }, [config.beepOnScan]);

  const startScanner = async () => {
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(elementId, {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.UPC_A
          ],
          verbose: false,
        });
      }

      await scannerRef.current.start(
        { facingMode: 'environment' },
        {
          fps: config.fps || 20,
          qrbox: config.qrbox,
          aspectRatio: config.aspectRatio || 1.0,
        },
        (decodedText) => {
          const now = Date.now();
          // Debounce rapid continuous scans (minimum 600ms cooldown per barcode)
          if (now - lastScannedTime.current > 600) {
            lastScannedTime.current = now;
            triggerFeedback();
            onScanSuccess(decodedText);
          }
        },
        () => {} // Ignore scan failure frames
      );
      setIsScanning(true);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Unable to initialize camera scanner');
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        setIsScanning(false);
      } catch (err) {
        console.error('Failed to stop scanner cleanly', err);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  return { isScanning, error, startScanner, stopScanner };
};
