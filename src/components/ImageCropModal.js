'use client';

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, Check } from 'lucide-react';
import getCroppedImg from '@/lib/cropImage';

const ImageCropModal = ({ image, onClose, onCropComplete }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropCompleteInternal = useCallback((_croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    try {
      if (!croppedAreaPixels) return;
      const croppedImageBlob = await getCroppedImg(image, croppedAreaPixels);
      onCropComplete(croppedImageBlob);
      onClose();
    } catch (e) {
      console.error('Error cropping image:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="bg-[#09090b] border border-white/10 rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
          <h3 className="text-xl font-bold">Adjust Photo</h3>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cropper Area */}
        <div className="relative h-[40vh] min-h-[300px] max-h-[450px] bg-[#111] overflow-hidden">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onCropComplete={onCropCompleteInternal}
            onZoomChange={setZoom}
            classes={{
              containerClassName: 'h-full',
              cropAreaClassName: 'border-2 border-white/50',
            }}
          />
        </div>

        {/* Controls */}
        <div className="p-8 space-y-8">
          <div className="space-y-4">
            <div className="flex justify-between text-sm font-medium text-muted-foreground">
              <span className="flex items-center gap-2">
                Zoom
              </span>
              <span className="text-violet-500 font-mono">{Math.round(zoom * 100)}%</span>
            </div>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.01}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-violet-500 hover:accent-violet-400"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 h-12 rounded-2xl border border-white/10 font-bold hover:bg-white/5 transition-all text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-[2] h-12 rounded-2xl bg-violet-600 font-bold hover:bg-violet-700 transition-all flex items-center justify-center gap-2 px-8 text-sm shadow-lg shadow-violet-500/20"
            >
              <Check className="w-5 h-5" /> Set Profile Photo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropModal;
