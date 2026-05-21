'use client';

import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Download, Share2, Copy, Check, Palette, ChevronDown, ChevronUp, Upload, Sliders } from 'lucide-react';

const THEMES = {
  emerald: {
    name: 'Emerald Garden',
    foreground: '#10b981',
    qrStyle: 'organic',
    logoType: 'avatar',
    bgType: 'color',
    iconColor: '#10b981'
  },
  gold: {
    name: 'Luxury Gold',
    foreground: '#f59e0b',
    qrStyle: 'rounded',
    logoType: 'avatar',
    bgType: 'color',
    iconColor: '#f59e0b'
  },
  cyber: {
    name: 'Midnight Cyber',
    foreground: '#a855f7',
    qrStyle: 'organic',
    logoType: 'v',
    bgType: 'color',
    iconColor: '#a855f7'
  },
  classic: {
    name: 'Classic Obsidian',
    foreground: '#1e293b',
    qrStyle: 'classic',
    logoType: 'none',
    bgType: 'color',
    iconColor: '#94a3b8'
  }
};

// --- Custom Canvas Helper Functions ---

const isColorDark = (hex) => {
  if (!hex || hex[0] !== '#') return true;
  const c = hex.substring(1);
  if (c.length !== 6) return true;
  const rgb = parseInt(c, 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luma < 140; // Returns true if dark color, false if light color
};

const drawRoundRect = (ctx, x, y, width, height, radius) => {
  if (ctx.roundRect) {
    ctx.roundRect(x, y, width, height, radius);
  } else {
    let r = radius;
    if (r > width / 2) r = width / 2;
    if (r > height / 2) r = height / 2;
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
  }
};

const drawFluidCell = (ctx, x, y, w, h, hasTop, hasBottom, hasLeft, hasRight, radius) => {
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y);
  
  // Top-Right corner
  if (!hasTop && !hasRight) {
    ctx.arcTo(x + w, y, x + w, y + h / 2, radius);
  } else {
    ctx.lineTo(x + w, y);
  }
  
  // Bottom-Right corner
  if (!hasBottom && !hasRight) {
    ctx.arcTo(x + w, y + h, x + w / 2, y + h, radius);
  } else {
    ctx.lineTo(x + w, y + h);
  }
  
  // Bottom-Left corner
  if (!hasBottom && !hasLeft) {
    ctx.arcTo(x, y + h, x, y + h / 2, radius);
  } else {
    ctx.lineTo(x, y + h);
  }
  
  // Top-Left corner
  if (!hasTop && !hasLeft) {
    ctx.arcTo(x, y, x + w / 2, y, radius);
  } else {
    ctx.lineTo(x, y);
  }
  
  ctx.closePath();
};

const isFinderPattern = (r, c, size) => {
  if (r < 7 && c < 7) return true;
  if (r < 7 && c >= size - 7) return true;
  if (r >= size - 7 && c < 7) return true;
  return false;
};

const drawFinderEye = (ctx, x, y, size, style, foreColor, backColor, transparent) => {
  ctx.save();
  ctx.fillStyle = foreColor;
  
  const radiusMap = {
    square: 0,
    rounded: size * 0.22,
    circle: size / 2
  };
  
  const r = radiusMap[style];
  
  // 1. Draw Outer Ring (7x7 cell size)
  ctx.beginPath();
  if (style === 'circle') {
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  } else if (style === 'rounded') {
    drawRoundRect(ctx, x, y, size, size, r);
  } else {
    ctx.rect(x, y, size, size);
  }
  ctx.fill();
  
  // 2. Draw Inner Cutout Gap (5x5 cell size)
  ctx.save();
  if (transparent) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = '#000000';
  } else {
    ctx.fillStyle = backColor;
  }
  
  const gapSize = size * (5 / 7);
  const gapOffset = size * (1 / 7);
  const gapRadius = radiusMap[style] * (5 / 7);
  
  ctx.beginPath();
  if (style === 'circle') {
    ctx.arc(x + size / 2, y + size / 2, gapSize / 2, 0, Math.PI * 2);
  } else if (style === 'rounded') {
    drawRoundRect(ctx, x + gapOffset, y + gapOffset, gapSize, gapSize, gapRadius);
  } else {
    ctx.rect(x + gapOffset, y + gapOffset, gapSize, gapSize);
  }
  ctx.fill();
  ctx.restore();
  
  // 3. Draw Center Dot (3x3 cell size)
  ctx.fillStyle = foreColor;
  const dotSize = size * (3 / 7);
  const dotOffset = size * (2 / 7);
  const dotRadius = radiusMap[style] * (3 / 7);
  
  ctx.beginPath();
  if (style === 'circle') {
    ctx.arc(x + size / 2, y + size / 2, dotSize / 2, 0, Math.PI * 2);
  } else if (style === 'rounded') {
    drawRoundRect(ctx, x + dotOffset, y + dotOffset, dotSize, dotSize, dotRadius);
  } else {
    ctx.rect(x + dotOffset, y + dotOffset, dotSize, dotSize);
  }
  ctx.fill();
  
  ctx.restore();
};

export default function QRCodeDisplay({ url, avatarUrl }) {
  const canvasRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  
  // Simplified Customizer States
  const [foregroundColor, setForegroundColor] = useState('#10b981'); // Emerald default
  const [selectedTheme, setSelectedTheme] = useState('emerald'); // 'emerald' | 'gold' | 'cyber' | 'classic' | 'custom'
  const [logoType, setLogoType] = useState('avatar'); // 'none' | 'avatar' | 'v' | 'link' | 'profile'
  const [qrStyle, setQrStyle] = useState('organic'); // 'classic' | 'organic' | 'rounded'
  const [bgType, setBgType] = useState('color'); // 'color' | 'avatar' | 'custom'
  const [customBgImage, setCustomBgImage] = useState(''); // base64 DataURL
  const [bgBlend, setBgBlend] = useState(0.4); // 0.0 - 1.0 (Controls opacity and protective overlays)
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Load configuration from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('viewi-qr-config-simplified-v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.foregroundColor) setForegroundColor(parsed.foregroundColor);
        if (parsed.selectedTheme) setSelectedTheme(parsed.selectedTheme);
        if (parsed.logoType) setLogoType(parsed.logoType);
        if (parsed.qrStyle) setQrStyle(parsed.qrStyle);
        if (parsed.bgType) setBgType(parsed.bgType);
        if (parsed.customBgImage) setCustomBgImage(parsed.customBgImage);
        if (parsed.bgBlend !== undefined) setBgBlend(parsed.bgBlend);
        if (parsed.showAdvanced !== undefined) setShowAdvanced(parsed.showAdvanced);
      }
    } catch (e) {
      console.error('Failed to load QR config from localStorage:', e);
    }
  }, []);

  // Save configuration to localStorage with quota safety
  useEffect(() => {
    try {
      const config = {
        foregroundColor,
        selectedTheme,
        logoType,
        qrStyle,
        bgType,
        customBgImage,
        bgBlend,
        showAdvanced
      };
      localStorage.setItem('viewi-qr-config-simplified-v2', JSON.stringify(config));
    } catch (e) {
      console.warn('LocalStorage quota exceeded, saving fallback without image data.');
      try {
        const fallbackConfig = {
          foregroundColor,
          selectedTheme,
          logoType,
          qrStyle,
          bgType,
          bgBlend,
          showAdvanced
        };
        localStorage.setItem('viewi-qr-config-simplified-v2', JSON.stringify(fallbackConfig));
      } catch (err) {
        console.error('Failed to save fallback config:', err);
      }
    }
  }, [foregroundColor, selectedTheme, logoType, qrStyle, bgType, customBgImage, bgBlend, showAdvanced]);

  // Render QR Code with dynamic modules custom styles and background image
  useEffect(() => {
    if (!url) return;

    const renderQR = async () => {
      try {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // 1. Generate core QR structure with maximum redundancy (High error correction level)
        const qr = QRCode.create(url, { errorCorrectionLevel: 'H' });
        const size = qr.modules.size;
        const canvasSize = 300;
        const cellSize = canvasSize / size;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        canvas.width = canvasSize;
        canvas.height = canvasSize;
        ctx.clearRect(0, 0, canvasSize, canvasSize);

        // Helper to load image safely
        const loadImage = (src) => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = (e) => reject(e);
            img.src = src;
          });
        };

        // Determine derived background styles based on simplified themes
        const isDarkTheme = isColorDark(foregroundColor);
        const autoBgColor = isDarkTheme ? '#ffffff' : '#09090b';

        // Map simplified QR Style to technical canvas parameters
        const dotStyle = qrStyle === 'organic' ? 'fluid' : (qrStyle === 'rounded' ? 'circle' : 'square');
        const eyeStyle = qrStyle === 'organic' ? 'circle' : (qrStyle === 'rounded' ? 'rounded' : 'square');
        const dotScale = qrStyle === 'rounded' ? 0.85 : 1.0;

        let bgImg = null;
        if (bgType === 'avatar' && avatarUrl) {
          try {
            bgImg = await loadImage(avatarUrl);
          } catch (e) {
            console.error('Failed to load avatar bg image:', e);
          }
        } else if (bgType === 'custom' && customBgImage) {
          try {
            bgImg = await loadImage(customBgImage);
          } catch (e) {
            console.error('Failed to load custom uploaded image:', e);
          }
        }

        // Draw background mode
        if (bgImg) {
          ctx.save();
          // Mix background visibility safely based on slider
          ctx.globalAlpha = 0.2 + bgBlend * 0.8;
          
          // Crop and fill cover inside the 300x300 canvas
          const aspect = bgImg.width / bgImg.height;
          let drawW, drawH, drawX, drawY;
          if (aspect > 1) {
            drawH = canvasSize;
            drawW = canvasSize * aspect;
            drawX = (canvasSize - drawW) / 2;
            drawY = 0;
          } else {
            drawW = canvasSize;
            drawH = canvasSize / aspect;
            drawX = 0;
            drawY = (canvasSize - drawH) / 2;
          }
          ctx.drawImage(bgImg, drawX, drawY, drawW, drawH);
          ctx.restore();

          // Intelligent Glass Protector overlay to guarantee 100% contrast & reading success
          ctx.save();
          const glassOpacity = 0.15 + (1.0 - bgBlend) * 0.65;
          ctx.fillStyle = isDarkTheme ? `rgba(255,255,255,${glassOpacity})` : `rgba(9,9,11,${glassOpacity})`;
          ctx.fillRect(0, 0, canvasSize, canvasSize);
          ctx.restore();
        } else {
          // Solid color background fill matching theme contrast
          ctx.save();
          ctx.fillStyle = autoBgColor;
          ctx.fillRect(0, 0, canvasSize, canvasSize);
          ctx.restore();
        }

        // Render QR Code modules
        ctx.save();
        ctx.fillStyle = foregroundColor;

        for (let r = 0; r < size; r++) {
          for (let c = 0; c < size; c++) {
            if (isFinderPattern(r, c, size)) continue;

            if (qr.modules.get(r, c) === 1) {
              const x = c * cellSize;
              const y = r * cellSize;

              if (dotStyle === 'square') {
                ctx.fillRect(x, y, cellSize, cellSize);
              } else if (dotStyle === 'circle') {
                ctx.beginPath();
                ctx.arc(x + cellSize / 2, y + cellSize / 2, (cellSize / 2) * dotScale, 0, Math.PI * 2);
                ctx.fill();
              } else if (dotStyle === 'fluid') {
                // Connected organic maze modules
                const hasTop = r > 0 && qr.modules.get(r - 1, c) === 1 && !isFinderPattern(r - 1, c, size);
                const hasBottom = r < size - 1 && qr.modules.get(r + 1, c) === 1 && !isFinderPattern(r + 1, c, size);
                const hasLeft = c > 0 && qr.modules.get(r, c - 1) === 1 && !isFinderPattern(r, c - 1, size);
                const hasRight = c < size - 1 && qr.modules.get(r, c + 1) === 1 && !isFinderPattern(r, c + 1, size);

                const drawSize = cellSize * dotScale;
                const offset = (cellSize - drawSize) / 2;
                const rCell = drawSize / 2;

                ctx.beginPath();
                drawFluidCell(
                  ctx, 
                  x + offset, 
                  y + offset, 
                  drawSize, 
                  drawSize, 
                  hasTop, 
                  hasBottom, 
                  hasLeft, 
                  hasRight, 
                  rCell
                );
                ctx.fill();
              }
            }
          }
        }
        ctx.restore();

        // 2. Render Special Stylized Finder Eyes
        const eyeSize = 7 * cellSize;
        // Top-Left Eye
        drawFinderEye(ctx, 0, 0, eyeSize, eyeStyle, foregroundColor, autoBgColor, false);
        // Top-Right Eye
        drawFinderEye(ctx, (size - 7) * cellSize, 0, eyeSize, eyeStyle, foregroundColor, autoBgColor, false);
        // Bottom-Left Eye
        drawFinderEye(ctx, 0, (size - 7) * cellSize, eyeSize, eyeStyle, foregroundColor, autoBgColor, false);

        // 3. Render Branding logo badge in center
        if (logoType !== 'none') {
          const logoSize = canvasSize * 0.22;
          const lx = (canvasSize - logoSize) / 2;
          const ly = (canvasSize - logoSize) / 2;
          const radius = 8;

          ctx.save();
          ctx.fillStyle = autoBgColor;
          ctx.strokeStyle = foregroundColor;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          drawRoundRect(ctx, lx - 2, ly - 2, logoSize + 4, logoSize + 4, radius);
          ctx.fill();
          ctx.stroke();
          ctx.restore();

          if (logoType === 'v') {
            ctx.save();
            ctx.font = 'black 34px sans-serif';
            ctx.fillStyle = foregroundColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('V', canvasSize / 2, canvasSize / 2);
            ctx.restore();
          } else if (logoType === 'link') {
            ctx.save();
            ctx.font = '28px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🔗', canvasSize / 2, canvasSize / 2);
            ctx.restore();
          } else if (logoType === 'profile') {
            ctx.save();
            ctx.font = '28px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('👤', canvasSize / 2, canvasSize / 2);
            ctx.restore();
          } else if (logoType === 'avatar' && avatarUrl) {
            try {
              const img = await loadImage(avatarUrl);
              ctx.save();
              ctx.beginPath();
              ctx.arc(canvasSize / 2, canvasSize / 2, logoSize / 2, 0, Math.PI * 2);
              ctx.clip();
              ctx.drawImage(img, lx, ly, logoSize, logoSize);
              ctx.restore();
            } catch (err) {
              ctx.save();
              ctx.font = '28px sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('👤', canvasSize / 2, canvasSize / 2);
              ctx.restore();
            }
          }
        }
      } catch (err) {
        console.error('QR rendering error:', err);
      }
    };

    renderQR();
  }, [url, foregroundColor, logoType, avatarUrl, qrStyle, bgType, customBgImage, bgBlend]);

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

  const applyTheme = (key) => {
    const theme = THEMES[key];
    if (theme) {
      setForegroundColor(theme.foreground);
      setQrStyle(theme.qrStyle);
      setLogoType(theme.logoType);
      setBgType(theme.bgType);
      setSelectedTheme(key);
    }
  };

  const handleCustomBgUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (typeof dataUrl === 'string') {
        setCustomBgImage(dataUrl);
        setBgType('custom');
        setSelectedTheme('custom');
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Visual QR Container */}
      <div 
        className="p-3 bg-white rounded-2xl mb-4 flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-[1.02]"
        style={{
          boxShadow: `0 10px 30px -10px ${foregroundColor}40`
        }}
      >
        <canvas ref={canvasRef} className="w-34 h-34 block" width={300} height={300} />
      </div>
      
      <div className="flex flex-col gap-2.5 w-full">
        {/* Toggle Button for Customizer */}
        <button
          onClick={() => setCustomizeOpen(!customizeOpen)}
          className="w-full flex items-center justify-between px-3 h-9 rounded-lg hover:bg-white/[0.08] transition-all text-xs font-bold select-none cursor-pointer border"
          style={customizeOpen ? {
            borderColor: `${foregroundColor}40`,
            backgroundColor: `${foregroundColor}0c`,
            color: foregroundColor
          } : {
            borderColor: 'rgba(255, 255, 255, 0.08)',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            color: '#fafafa'
          }}
        >
          <div className="flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5" style={{ color: foregroundColor }} />
            <span>Customize QR Design</span>
          </div>
          {customizeOpen ? <ChevronUp className="w-3.5 h-3.5 opacity-80" /> : <ChevronDown className="w-3.5 h-3.5 opacity-80" />}
        </button>

        {/* Customization Panel */}
        {customizeOpen && (
          <div className="w-full p-3 rounded-xl bg-zinc-950/20 backdrop-blur-sm border border-white/[0.05] space-y-3 animate-entrance max-h-[290px] overflow-y-auto custom-scrollbar">
            
            {/* 1. Theme Look Selection */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">1. Choose Theme</span>
                {selectedTheme !== 'custom' ? (
                  <span 
                    className="text-[8.5px] font-black px-1.5 py-0.5 rounded-md border shadow-sm transition-all"
                    style={{ 
                      color: foregroundColor,
                      borderColor: `${foregroundColor}30`,
                      backgroundColor: `${foregroundColor}10`
                    }}
                  >
                    {THEMES[selectedTheme]?.name}
                  </span>
                ) : (
                  <span 
                    className="text-[8.5px] font-black px-1.5 py-0.5 rounded-md border shadow-sm transition-all text-white/60 bg-white/5 border-white/10"
                  >
                    Custom Style
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 bg-zinc-900/30 border border-white/[0.03] p-2 rounded-xl">
                <div className="flex items-center gap-1.5">
                  {Object.entries(THEMES).map(([key, theme]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => applyTheme(key)}
                      className={`w-6.5 h-6.5 rounded-full transition-all flex items-center justify-center shrink-0 relative select-none cursor-pointer ${
                        selectedTheme === key 
                          ? 'ring-2 ring-offset-2 ring-offset-zinc-950 ring-white scale-110 shadow-lg' 
                          : 'hover:scale-105 opacity-60 hover:opacity-100'
                      }`}
                      style={{ 
                        background: `linear-gradient(135deg, ${theme.foreground}, ${theme.foreground}aa)`,
                        borderColor: 'rgba(255, 255, 255, 0.15)'
                      }}
                      title={theme.name}
                    >
                      {selectedTheme === key && (
                        <Check className="w-3 h-3 text-white drop-shadow" />
                      )}
                    </button>
                  ))}
                  {/* Iridescent Custom Theme Indicator dot when selectedTheme is custom */}
                  {selectedTheme === 'custom' && (
                    <button
                      type="button"
                      className="w-6.5 h-6.5 rounded-full ring-2 ring-offset-2 ring-offset-zinc-950 ring-white scale-110 shadow-lg flex items-center justify-center shrink-0 relative select-none cursor-pointer"
                      style={{ 
                        background: 'linear-gradient(135deg, #a855f7, #f59e0b, #10b981)',
                        borderColor: 'rgba(255, 255, 255, 0.2)'
                      }}
                      title="Custom Design"
                    >
                      <Check className="w-3 h-3 text-white drop-shadow" />
                    </button>
                  )}
                </div>
                <div className="min-w-0 flex-1 pl-3 border-l border-white/[0.06]">
                  <span className="text-[8px] text-white/40 block leading-none mb-0.5 uppercase tracking-wider">Style Pattern</span>
                  <span className="text-[9.5px] font-black text-white block capitalize leading-none truncate">
                    {selectedTheme !== 'custom' ? THEMES[selectedTheme]?.qrStyle : 'Custom Design'}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Logo Selector (Segmented iOS Control) */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest block">2. Center Logo Badge</span>
              <div className="bg-zinc-950/40 p-0.5 rounded-lg border border-white/[0.05] grid grid-cols-3 gap-0.5">
                {[
                  { id: 'none', label: 'None' },
                  { id: 'avatar', label: 'Profile Pic' },
                  { id: 'v', label: 'Brand V' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setLogoType(opt.id);
                      setSelectedTheme('custom');
                    }}
                    className={`py-1 rounded-md text-[9px] font-bold transition-all text-center leading-none select-none cursor-pointer ${
                      logoType === opt.id
                        ? 'text-white shadow-sm'
                        : 'text-white/40 hover:text-white/80 hover:bg-white/[0.01]'
                    }`}
                    style={logoType === opt.id ? {
                      backgroundColor: `${foregroundColor}20`,
                      border: `1px solid ${foregroundColor}40`
                    } : {
                      border: `1px solid transparent`
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Background selector (Segmented iOS Control) */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest block">3. Background Style</span>
              <div className="bg-zinc-950/40 p-0.5 rounded-lg border border-white/[0.05] grid grid-cols-2 gap-0.5">
                {[
                  { id: 'color', label: 'Clean Contrast' },
                  { id: 'avatar', label: 'Artistic Photo' }
                ].map((opt) => {
                  const isActive = opt.id === 'color' ? bgType === 'color' : (bgType === 'avatar' || bgType === 'custom');
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        if (opt.id === 'color') {
                          setBgType('color');
                        } else {
                          setBgType(customBgImage ? 'custom' : 'avatar');
                        }
                        setSelectedTheme('custom');
                      }}
                      className={`py-1 rounded-md text-[9px] font-bold transition-all text-center leading-none select-none cursor-pointer ${
                        isActive
                          ? 'text-white shadow-sm'
                          : 'text-white/40 hover:text-white/80 hover:bg-white/[0.01]'
                      }`}
                      style={isActive ? {
                        backgroundColor: `${foregroundColor}20`,
                        border: `1px solid ${foregroundColor}40`
                      } : {
                        border: `1px solid transparent`
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Single friendly photo blend slider */}
            {bgType !== 'color' && (
              <div className="space-y-1.5 p-2 bg-zinc-900/20 border border-white/[0.03] rounded-xl text-[10px] animate-entrance">
                <div className="flex justify-between text-white/50 font-bold">
                  <span>Photo Contrast Blend</span>
                  <span className="font-mono text-white/80" style={{ color: foregroundColor }}>{Math.round(bgBlend * 100)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0.1" 
                  max="1.0" 
                  step="0.05"
                  value={bgBlend}
                  onChange={(e) => setBgBlend(parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg cursor-pointer appearance-none transition-all"
                  style={{ accentColor: foregroundColor }}
                />
              </div>
            )}

            {/* Advanced design settings collapsed drawer */}
            <div className="pt-2 border-t border-white/[0.06]">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-center gap-1.5 py-1 text-[8px] font-bold text-white/30 hover:text-white/60 uppercase tracking-widest transition-colors select-none cursor-pointer"
              >
                <Sliders className="w-3 h-3 opacity-60" style={{ color: showAdvanced ? foregroundColor : undefined }} />
                <span>{showAdvanced ? '[-] Hide Advanced Settings' : '[+] Advanced Design Settings'}</span>
              </button>

              {showAdvanced && (
                <div className="space-y-3 pt-3 animate-entrance border-t border-white/[0.03] mt-1.5">
                  
                  {/* Granular Module Shape Selection */}
                  <div className="space-y-1.5">
                    <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest block">QR Code Style Shape</span>
                    <div className="bg-zinc-950/40 p-0.5 rounded-lg border border-white/[0.05] grid grid-cols-3 gap-0.5">
                      {[
                        { id: 'organic', label: 'Fluid Organic' },
                        { id: 'rounded', label: 'Smooth Round' },
                        { id: 'classic', label: 'Classic Square' }
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setQrStyle(opt.id);
                            setSelectedTheme('custom');
                          }}
                          className={`py-1 rounded-md text-[8.5px] font-bold transition-all text-center leading-none select-none cursor-pointer ${
                            qrStyle === opt.id
                              ? 'text-white shadow-sm'
                              : 'text-white/40 hover:text-white/80 hover:bg-white/[0.01]'
                          }`}
                          style={qrStyle === opt.id ? {
                            backgroundColor: `${foregroundColor}20`,
                            border: `1px solid ${foregroundColor}40`
                          } : {
                            border: `1px solid transparent`
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Complete Center Badge Selection */}
                  <div className="space-y-1.5">
                    <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest block">Center Badge Icons</span>
                    <div className="bg-zinc-950/40 p-0.5 rounded-lg border border-white/[0.05] grid grid-cols-5 gap-0.5">
                      {[
                        { id: 'none', label: 'None' },
                        { id: 'v', label: 'Brand V' },
                        { id: 'link', label: 'Link' },
                        { id: 'profile', label: 'User' },
                        { id: 'avatar', label: 'Avatar' }
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setLogoType(opt.id);
                            setSelectedTheme('custom');
                          }}
                          className={`py-1 rounded-md text-[7.5px] font-bold transition-all text-center leading-none select-none cursor-pointer ${
                            logoType === opt.id
                              ? 'text-white shadow-sm'
                              : 'text-white/40 hover:text-white/80 hover:bg-white/[0.01]'
                          }`}
                          style={logoType === opt.id ? {
                            backgroundColor: `${foregroundColor}20`,
                            border: `1px solid ${foregroundColor}40`
                          } : {
                            border: `1px solid transparent`
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Advanced Custom Foreground Color Picker */}
                  <div className="space-y-2 p-2 bg-zinc-900/20 border border-white/[0.03] rounded-xl">
                    <div className="flex items-center justify-between text-[9.5px]">
                      <span className="text-white/40 font-bold">Custom Foreground Color</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[8.5px] font-mono text-white/60 uppercase">{foregroundColor}</span>
                        <div className="relative w-4 h-4 rounded overflow-hidden border border-white/10 cursor-pointer">
                          <input 
                            type="color" 
                            value={foregroundColor} 
                            onChange={(e) => {
                              setForegroundColor(e.target.value);
                              setSelectedTheme('custom');
                            }}
                            className="absolute inset-0 scale-[2] cursor-pointer border-none bg-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Custom Background Upload */}
                  <div className="space-y-1.5">
                    <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest block">Custom Background Photo</span>
                    <div className="flex items-center gap-2 bg-zinc-900/20 p-2 border border-white/[0.03] rounded-xl">
                      <label className="flex items-center justify-center gap-1.5 h-7 px-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-[9px] font-bold text-white cursor-pointer transition-all shrink-0 select-none">
                        <Upload className="w-3 h-3 text-white/50" />
                        <span>Upload Photo</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => {
                            handleCustomBgUpload(e);
                            setSelectedTheme('custom');
                          }} 
                          className="hidden" 
                        />
                      </label>
                      {customBgImage ? (
                        <div className="flex items-center gap-1 overflow-hidden">
                          <img src={customBgImage} className="w-4 h-4 rounded object-cover border border-white/15 shrink-0" alt="Preview" />
                          <span className="text-[8.5px] text-green-400 font-bold truncate">Custom Active</span>
                        </div>
                      ) : (
                        <span className="text-[8px] text-white/30 truncate">No photo uploaded</span>
                      )}
                    </div>
                  </div>

                </div>
              )}
            </div>

          </div>
        )}

        {/* Copy Link button */}
        <button
          onClick={copyToClipboard}
          className="w-full flex items-center justify-between px-3 h-9 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all select-none cursor-pointer hover:border-white/20 group"
        >
          <div className="flex items-center gap-1.5 overflow-hidden">
            <Share2 className="w-3.5 h-3.5 text-white/40 group-hover:text-white/60 transition-colors flex-shrink-0" />
            <span className="text-xs truncate text-white/60 group-hover:text-white/80 transition-colors font-mono">{url}</span>
          </div>
          {copied ? (
            <Check className="w-3.5 h-3.5 text-green-400" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-white/40 group-hover:text-white/70 transition-colors" />
          )}
        </button>

        {/* Download Button */}
        <button
          onClick={downloadQR}
          className="w-full h-9 text-xs font-bold flex items-center justify-center gap-1.5 rounded-lg text-white select-none cursor-pointer transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] shadow-md border"
          style={{
            background: `linear-gradient(135deg, ${foregroundColor}, ${foregroundColor}dd)`,
            boxShadow: `0 4px 14px ${foregroundColor}28`,
            borderColor: `${foregroundColor}40`
          }}
        >
          <Download className="w-3.5 h-3.5" /> Download QR Code
        </button>
      </div>
    </div>
  );
}
