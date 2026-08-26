import React, { useState, useRef } from 'react';
import { Upload, Camera, Check, RefreshCw, X, Image as ImageIcon, Sparkles, UserCheck, ShieldCheck } from 'lucide-react';

export interface PassportPhotoUploaderProps {
  currentPhoto?: string;
  onPhotoChange: (photoDataUrl: string) => void;
  className?: string;
  compact?: boolean;
}

// Curated high quality executive biometric passport presets
const PRESET_PASSPORT_PHOTOS = [
  {
    id: 'preset_1',
    label: 'Executive (Suit)',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'preset_2',
    label: 'Business Professional',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'preset_3',
    label: 'Corporate Portrait',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'preset_4',
    label: 'Private Wealth Client',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80'
  }
];

export const PassportPhotoUploader: React.FC<PassportPhotoUploaderProps> = ({
  currentPhoto,
  onPhotoChange,
  className = '',
  compact = false
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [isCapturingCamera, setIsCapturingCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<string>(currentPhoto || '');
  const [showPresets, setShowPresets] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPEG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setPreviewPhoto(dataUrl);
        onPhotoChange(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const startCamera = async () => {
    setCameraError(null);
    setIsCapturingCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Camera access unavailable or declined. Please choose a file or preset.');
      setIsCapturingCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCapturingCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 480;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setPreviewPhoto(dataUrl);
        onPhotoChange(dataUrl);
        stopCamera();
      }
    }
  };

  const selectPreset = (url: string) => {
    setPreviewPhoto(url);
    onPhotoChange(url);
    setShowPresets(false);
  };

  const removePhoto = () => {
    setPreviewPhoto('');
    onPhotoChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Camera Live Capture View */}
      {isCapturingCamera ? (
        <div className="p-3 bg-slate-900 text-white rounded-lg border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold pb-2 border-b border-slate-800">
            <span className="flex items-center gap-1.5 text-[#c5a880]">
              <Camera className="w-3.5 h-3.5" /> Passport Biometric Selfie Capture
            </span>
            <button
              type="button"
              onClick={stopCamera}
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="relative aspect-4/3 max-w-xs mx-auto overflow-hidden rounded bg-black border border-white/20">
            <video ref={videoRef} playsInline autoPlay muted className="w-full h-full object-cover" />
            <div className="absolute inset-0 border-2 border-dashed border-[#c5a880]/60 m-4 rounded pointer-events-none flex items-center justify-center">
              <span className="text-[10px] bg-black/60 px-2 py-0.5 rounded text-slate-200">Position face in frame</span>
            </div>
          </div>

          <div className="flex justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={capturePhoto}
              className="px-4 py-1.5 rounded bg-[#012169] hover:bg-[#00174a] text-white text-xs font-semibold flex items-center gap-1.5 border border-[#c5a880] cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" /> Take Photo
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        /* Standard Biometric Passport Upload Box */
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200 dark:border-slate-800">
          {/* Portrait Thumbnail Container */}
          <div className="relative w-20 h-24 sm:w-22 sm:h-28 rounded-md overflow-hidden border-2 border-[#012169] dark:border-[#3b82f6] shrink-0 bg-slate-200 dark:bg-slate-800 shadow-xs flex items-center justify-center mx-auto sm:mx-0">
            {previewPhoto ? (
              <img
                src={previewPhoto}
                alt="Biometric Passport"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="text-center p-2 text-slate-400">
                <ImageIcon className="w-6 h-6 mx-auto mb-1 opacity-50" />
                <span className="text-[9px] font-semibold uppercase block">No Photo</span>
              </div>
            )}

            {previewPhoto && (
              <div className="absolute top-1 right-1 bg-emerald-600 text-white rounded-full p-0.5 shadow-xs">
                <Check className="w-2.5 h-2.5" />
              </div>
            )}
          </div>

          {/* Action and Drop Details */}
          <div className="flex-1 space-y-2 text-center sm:text-left">
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-1.5">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Passport / Profile Picture
                </span>
                {previewPhoto ? (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-300 dark:border-emerald-800">
                    <ShieldCheck className="w-2.5 h-2.5" /> Verified
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                    Required for KYC
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Upload a clear frontal portrait photo (JPEG, PNG, WebP up to 10MB).
              </p>
            </div>

            {/* Upload Buttons Row */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-0.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1.5 rounded bg-[#012169] hover:bg-[#00174a] text-white text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
              >
                <Upload className="w-3 h-3" />
                <span>Upload from Device</span>
              </button>

              <button
                type="button"
                onClick={startCamera}
                className="px-2.5 py-1.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Camera className="w-3 h-3 text-[#012169] dark:text-[#93c5fd]" />
                <span>Take Photo</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPresets(!showPresets)}
                className="px-2.5 py-1.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Sample Portraits</span>
              </button>

              {previewPhoto && (
                <button
                  type="button"
                  onClick={removePhoto}
                  className="px-2 py-1.5 rounded text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[11px] font-semibold transition-colors cursor-pointer"
                  title="Remove current photo"
                >
                  <X className="w-3.5 h-3.5 inline" />
                </button>
              )}
            </div>

            {cameraError && (
              <p className="text-[10px] text-rose-600 dark:text-rose-400">{cameraError}</p>
            )}
          </div>
        </div>
      )}

      {/* Preset Photo Selection Drawer */}
      {showPresets && (
        <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300 pb-1 border-b border-slate-100 dark:border-slate-800">
            <span>Select a Sample Executive Passport Portrait:</span>
            <button
              type="button"
              onClick={() => setShowPresets(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer text-xs"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {PRESET_PASSPORT_PHOTOS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => selectPreset(p.url)}
                className="group relative rounded-md overflow-hidden border-2 border-slate-200 dark:border-slate-700 hover:border-[#012169] dark:hover:border-[#3b82f6] aspect-3/4 bg-slate-100 transition-all cursor-pointer"
              >
                <img
                  src={p.url}
                  alt={p.label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-[9px] text-white py-0.5 text-center truncate px-1">
                  {p.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
