import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Check,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Crop as CropIcon,
  Maximize2,
  Image as ImageIcon
} from 'lucide-react';

export type CropPreset = 'passport' | 'stamp' | 'signature' | 'payment' | 'free';

interface ImageCropperModalProps {
  imageUrl: string;
  title?: string;
  preset?: CropPreset;
  initialPreset?: CropPreset;
  onCrop: (croppedBase64: string) => void;
  onClose: () => void;
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  imageUrl,
  title = 'Image Cropper / ছবি ও পেমেন্ট স্লিপ ক্রপ',
  preset: propPreset,
  initialPreset = 'passport',
  onCrop,
  onClose
}) => {
  const [preset, setPreset] = useState<CropPreset>(propPreset || initialPreset);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0); // degrees
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Aspect ratio definitions: [width, height]
  const presetRatios: Record<CropPreset, { label: string; ratio: number; desc: string }> = {
    passport: { label: 'Passport Photo', ratio: 3.5 / 4.5, desc: '3.5 x 4.5 cm (পাসপোর্ট সাইজ)' },
    stamp: { label: 'Stamp Size', ratio: 2.5 / 3.0, desc: '2.5 x 3.0 cm (স্ট্যাম্প সাইজ)' },
    signature: { label: 'Signature', ratio: 3.0 / 1.0, desc: '3:1 Banner (স্বাক্ষর/সই)' },
    payment: { label: 'Payment Receipt', ratio: 1.0 / 1.0, desc: '1:1 / UTR Slip (পেমেন্ট স্লিপ)' },
    free: { label: 'Free / Document', ratio: 1.0 / 1.414, desc: 'A4 / Document (ডকুমেন্ট)' }
  };

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    img.onload = () => {
      imgRef.current = img;
      setImageLoaded(true);
      setOffset({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
    };
  }, [imageUrl]);

  // Render on canvas whenever zoom, rotation, offset, or preset changes
  useEffect(() => {
    if (!imageLoaded || !imgRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imgRef.current;
    const targetRatio = presetRatios[preset].ratio;

    // Viewport box dimensions
    const boxWidth = 360;
    const boxHeight = boxWidth / targetRatio;

    canvas.width = boxWidth;
    canvas.height = boxHeight;

    ctx.clearRect(0, 0, boxWidth, boxHeight);
    ctx.save();

    // Center point of canvas
    ctx.translate(boxWidth / 2 + offset.x, boxHeight / 2 + offset.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Draw image centered
    const imgAspect = img.width / img.height;
    let drawW = boxWidth;
    let drawH = boxWidth / imgAspect;

    // Ensure it fills the crop area
    if (drawH < boxHeight) {
      drawH = boxHeight;
      drawW = boxHeight * imgAspect;
    }

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  }, [imageLoaded, preset, zoom, rotation, offset]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - offset.x, y: e.touches[0].clientY - offset.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setOffset({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    });
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleApplyCrop = () => {
    if (!canvasRef.current) return;
    // Export high-res cropped data URL
    const croppedUrl = canvasRef.current.toDataURL('image/jpeg', 0.92);
    onCrop(croppedUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <CropIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{title}</h3>
              <p className="text-[11px] text-slate-400">{presetRatios[preset].desc}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Selector */}
        <div className="p-3 bg-slate-950/50 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {(Object.keys(presetRatios) as CropPreset[]).map(key => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setPreset(key);
                setOffset({ x: 0, y: 0 });
                setZoom(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                preset === key
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {presetRatios[key].label}
            </button>
          ))}
        </div>

        {/* Cropper Canvas Area */}
        <div 
          className="relative flex-1 min-h-[300px] max-h-[460px] bg-slate-950 flex items-center justify-center p-4 overflow-hidden select-none cursor-move"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
        >
          {/* Subtle guide grid */}
          <div className="relative border-2 border-dashed border-cyan-400/90 rounded-lg shadow-2xl overflow-hidden bg-black/40">
            <canvas
              ref={canvasRef}
              className="block pointer-events-none max-h-[380px] w-auto"
            />
            {/* Rule-of-thirds grid overlay */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none border border-cyan-500/20">
              <div className="border-r border-b border-cyan-500/30" />
              <div className="border-r border-b border-cyan-500/30" />
              <div className="border-b border-cyan-500/30" />
              <div className="border-r border-b border-cyan-500/30" />
              <div className="border-r border-b border-cyan-500/30" />
              <div className="border-b border-cyan-500/30" />
              <div className="border-r border-cyan-500/30" />
              <div className="border-r border-cyan-500/30" />
              <div />
            </div>
          </div>

          <div className="absolute bottom-2 left-4 text-[11px] text-slate-400 bg-slate-900/90 px-2.5 py-1 rounded-md border border-slate-800 pointer-events-none">
            Drag to pan / মাউস দিয়ে পজিশন করুন
          </div>
        </div>

        {/* Tool Controls Bar */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 space-y-3">
          
          <div className="flex items-center justify-between gap-4">
            
            {/* Zoom Slider */}
            <div className="flex items-center gap-2 flex-1">
              <ZoomOut className="w-4 h-4 text-slate-400" />
              <input
                type="range"
                min="0.8"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <ZoomIn className="w-4 h-4 text-slate-400" />
              <span className="font-mono text-xs text-slate-300 w-10 text-right">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            {/* Rotate Button */}
            <button
              type="button"
              onClick={handleRotate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
              title="Rotate 90 degrees"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Rotate 90°</span>
            </button>
            
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-850">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel (বাতিল)
            </button>
            <button
              type="button"
              onClick={handleApplyCrop}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 shadow-md shadow-cyan-400/20 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Apply & Save Crop (ক্রপ সম্পন্ন করুন)</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
