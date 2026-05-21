'use client';

import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Download, Share2, Copy, Check, Palette, ChevronDown, ChevronUp } from 'lucide-react';

const PRESETS = {
  classic: { foreground: '#3b82f6', background: '#ffffff', transparent: false, name: 'Classic Blue' },
  sunset: { foreground: '#ec4899', background: '#09090b', transparent: false, name: 'Sunset Glow' },
  emerald: { foreground: '#10b981', background: '#ffffff', transparent: false, name: 'Emerald Premium' },
  gold: { foreground: '#f59e0b', background: '#111827', transparent: false, name: 'Luxury Gold' },
  midnight: { foreground: '#a855f7', background: '#09090b', transparent: true, name: 'Midnight Cyber' },
  minimal: { foreground: '#fafafa', background: '#09090b', transparent: false, name: 'Minimalist' }
};

export default function QRCodeDisplay({ url, avatarUrl }) {
  const canvasRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  
  // Customizer States
  const [foregroundColor, setForegroundColor] = useState('#3b82f6');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [isTransparent, setIsTransparent] = useState(false);
  const [logoType, setLogoType] = useState('none');
  const [selectedPreset, setSelectedPreset] = useState('classic');

  // Load configuration from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('viewi-qr-config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.foregroundColor) setForegroundColor(parsed.foregroundColor);
        if (parsed.backgroundColor) setBackgroundColor(parsed.backgroundColor);
        if (parsed.isTransparent !== undefined) setIsTransparent(parsed.isTransparent);
        if (parsed.logoType) setLogoType(parsed.logoType);
        if (parsed.selectedPreset) setSelectedPreset(parsed.selectedPreset);
      }
    } catch (e) {
      console.error('Failed to load QR config from localStorage:', e);
    }
  }, []);

  // Save configuration to localStorage
  useEffect(() => {
    try {
      const config = {
        foregroundColor,
        backgroundColor,
        isTransparent,
        logoType,
        selectedPreset
      };
      localStorage.setItem('viewi-qr-config', JSON.stringify(config));
    } catch (e) {
      console.error('Failed to save QR config to localStorage:', e);
    }
  }, [foregroundColor, backgroundColor, isTransparent, logoType, selectedPreset]);

  // Render QR Code to Canvas with customizations
  useEffect(() => {
    if (!url) return;

    const renderQR = async () => {
      try {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // 1. Draw standard QR Code
        await QRCode.toCanvas(canvas, url, {
          width: 300,
          margin: 1.5,
          errorCorrectionLevel: 'H', // High error correction to support logo overlay
          color: {
            dark: foregroundColor,
            light: isTransparent ? '#ffffff00' : backgroundColor
          }
        });

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 2. Draw central branding badge if requested
        if (logoType !== 'none') {
          const size = 300;
          const logoSize = size * 0.22; // 22% of QR size is fully readable with H level error correction
          const x = (size - logoSize) / 2;
          const y = (size - logoSize) / 2;
          const radius = 10;

          // Draw custom background card container for logo
          ctx.save();
          ctx.fillStyle = isTransparent ? '#09090b' : backgroundColor;
          ctx.strokeStyle = foregroundColor;
          ctx.lineWidth = 3;
          ctx.beginPath();
          
          if (ctx.roundRect) {
            ctx.roundRect(x - 2, y - 2, logoSize + 4, logoSize + 4, radius);
          } else {
            ctx.rect(x - 2, y - 2, logoSize + 4, logoSize + 4);
          }
          ctx.fill();
          ctx.stroke();
          ctx.restore();

          // Render chosen logo
          if (logoType === 'v') {
            // Draw Viewi 'V' Logo
            ctx.save();
            ctx.font = 'black 38px sans-serif';
            ctx.fillStyle = foregroundColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('V', size / 2, size / 2);
            ctx.restore();
          } else if (logoType === 'link') {
            // Draw Link Symbol
            ctx.save();
            ctx.font = '32px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🔗', size / 2, size / 2);
            ctx.restore();
          } else if (logoType === 'profile') {
            // Draw Profile Symbol
            ctx.save();
            ctx.font = '32px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('👤', size / 2, size / 2);
            ctx.restore();
          } else if (logoType === 'avatar' && avatarUrl) {
            // Draw actual user avatar image
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = avatarUrl;
            img.onload = () => {
              ctx.save();
              ctx.beginPath();
              ctx.arc(size / 2, size / 2, logoSize / 2, 0, Math.PI * 2);
              ctx.clip();
              ctx.drawImage(img, x, y, logoSize, logoSize);
              ctx.restore();
            };
            img.onerror = () => {
              // Fallback to profile monogram
              ctx.save();
              ctx.font = '32px sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('👤', size / 2, size / 2);
              ctx.restore();
            };
          }
        }
      } catch (err) {
        console.error('QR rendering error:', err);
      }
    };

    renderQR();
  }, [url, foregroundColor, backgroundColor, isTransparent, logoType, avatarUrl]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'viewi-custom-qr.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  const applyPreset = (key) => {
    const preset = PRESETS[key];
    if (preset) {
      setForegroundColor(preset.foreground);
      setBackgroundColor(preset.background);
      setIsTransparent(preset.transparent);
      setSelectedPreset(key);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Visual QR Container */}
      <div className="p-5 bg-white rounded-[2rem] mb-6 flex items-center justify-center shadow-xl transition-all duration-300">
        <canvas ref={canvasRef} className="w-48 h-48 block" width={300} height={300} />
      </div>
      
      <div className="flex flex-col gap-3 w-full">
        {/* Toggle Button for Customizer */}
        <button
          onClick={() => setCustomizeOpen(!customizeOpen)}
          className={`w-full flex items-center justify-between px-4 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-xs font-bold ${
            customizeOpen ? 'border-primary/40 bg-primary/5 text-primary' : 'text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-primary" />
            <span>Customize QR Design</span>
          </div>
          {customizeOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {/* Customization Panel */}
        {customizeOpen && (
          <div className="w-full p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-5 animate-entrance">
            {/* Presets */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Design Presets</span>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => applyPreset(key)}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      selectedPreset === key 
                        ? 'border-primary bg-primary/10 text-white' 
                        : 'border-white/5 bg-white/[0.01] text-muted-foreground hover:bg-white/5 hover:border-white/10'
                    }`}
                  >
                    <div 
                      className="w-5 h-5 rounded-full mx-auto mb-1.5 flex items-center justify-center overflow-hidden border border-white/10 shadow" 
                      style={{ background: preset.transparent ? 'repeating-conic-gradient(#555 0% 25%, #333 0% 50%) 50% / 8px 8px' : preset.background }}
                    >
                      <div className="w-2.5 h-2.5 rounded-full shadow-inner" style={{ background: preset.foreground }} />
                    </div>
                    <span className="text-[9px] font-bold block truncate">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Logo badges */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Center Badge / Logo</span>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'none', label: 'None', icon: '❌' },
                  { id: 'v', label: 'Brand V', icon: 'V' },
                  { id: 'link', label: 'Link', icon: '🔗' },
                  { 
                    id: 'avatar', 
                    label: 'Avatar', 
                    icon: avatarUrl ? (
                      <img src={avatarUrl} className="w-4 h-4 rounded-full object-cover border border-white/20" alt="Avatar" />
                    ) : (
                      '👤'
                    ) 
                  }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setLogoType(opt.id)}
                    className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                      logoType === opt.id
                        ? 'border-primary bg-primary/10 text-white'
                        : 'border-white/5 bg-white/[0.01] text-muted-foreground hover:bg-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="text-sm font-black h-5 flex items-center justify-center">{opt.icon}</div>
                    <span className="text-[9px] font-bold block truncate">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Color Pickers */}
            <div className="space-y-3 p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-semibold">Foreground Color</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-white/60 uppercase">{foregroundColor}</span>
                  <div className="relative w-5 h-5 rounded-md overflow-hidden border border-white/10 cursor-pointer">
                    <input 
                      type="color" 
                      value={foregroundColor} 
                      onChange={(e) => {
                        setForegroundColor(e.target.value);
                        setSelectedPreset('custom');
                      }}
                      className="absolute inset-0 scale-[2] cursor-pointer border-none bg-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-semibold">Background Color</span>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono uppercase ${isTransparent ? 'text-white/20 line-through' : 'text-white/60'}`}>
                    {isTransparent ? 'Transparent' : backgroundColor}
                  </span>
                  <div className={`relative w-5 h-5 rounded-md overflow-hidden border border-white/10 cursor-pointer ${isTransparent ? 'opacity-30 cursor-not-allowed' : ''}`}>
                    <input 
                      type="color" 
                      value={backgroundColor} 
                      disabled={isTransparent}
                      onChange={(e) => {
                        setBackgroundColor(e.target.value);
                        setSelectedPreset('custom');
                      }}
                      className="absolute inset-0 scale-[2] cursor-pointer border-none bg-transparent disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input 
                  type="checkbox" 
                  checked={isTransparent} 
                  onChange={(e) => {
                    setIsTransparent(e.target.checked);
                    setSelectedPreset('custom');
                  }}
                  className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary"
                />
                <span className="text-[10px] font-bold text-muted-foreground select-none">Transparent Background</span>
              </label>
            </div>
          </div>
        )}

        {/* Copy Link button */}
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

        {/* Download Button */}
        <button
          onClick={downloadQR}
          className="w-full btn-premium h-12 flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" /> Download QR Code
        </button>
      </div>
    </div>
  );
}
