'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Download, Share2, Copy, Check } from 'lucide-react';

export default function QRCodeDisplay({ url }) {
  const [qrSrc, setQrSrc] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (url) {
      QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#3b82f6',
          light: '#00000000',
        },
      }).then(setQrSrc);
    }
  }, [url]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    const link = document.createElement('a');
    link.download = 'viewi-qr.png';
    link.href = qrSrc;
    link.click();
  };

  return (
    <div className="flex flex-col items-center">
      <div className="p-4 bg-white rounded-2xl mb-6">
        {qrSrc && <img src={qrSrc} alt="Profile QR Code" className="w-48 h-48" />}
      </div>
      
      <div className="flex flex-col gap-3 w-full">
        <button
          onClick={copyToClipboard}
          className="w-full flex items-center justify-between px-4 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <Share2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span className="text-xs truncate text-muted-foreground">{url}</span>
          </div>
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>

        <button
          onClick={downloadQR}
          className="w-full btn-primary h-12 flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" /> Download QR Code
        </button>
      </div>
    </div>
  );
}
