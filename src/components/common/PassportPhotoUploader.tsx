import React, { useState, useRef } from 'react';
import { Upload, Camera, Check, X, Image as ImageIcon, Sparkles, ShieldCheck, User } from 'lucide-react';

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
  const [isCapturingCamera, setIsCapturingCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<string>(currentPhoto || '');
  const [showPresets, setShowPresets] = useState(false);
  const [dragOver, setDragOver] = useState(false);
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
    <div className={`space-y-4 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Camera Live Capture View */}
      {isCapturingCamera ? (
        <div className="p-4 bg-slate-950 text-white rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold pb-2 border-b border-slate-800">
            <span className="flex items-center gap-1.5 text-[#f8c22d]">
              <Camera className="w-4 h-4" /> Live Passport Selfie Capture
            </span>
            <button
              type="button"
              onClick={stopCamera}
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="relative aspect-square max-w-[240px] mx-auto overflow-hidden rounded-full bg-black border-2 border-[#f8c22d]">
            <video ref={videoRef} playsInline autoPlay muted className="w-full h-full object-cover" />
          </div>

          <div className="flex justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={capturePhoto}
              className="px-5 py-2 rounded-xl bg-[#f8c22d] hover:bg-[#fabc22] text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-transform active:scale-95"
            >
              <Check className="w-4 h-4 stroke-[3]" /> Capture &amp; Use Photo
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        /* Focused Clean Profile Passport Uploader */
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center p-6 sm:p-8 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 transition-all ${
            dragOver ? 'border-[#f8c22d] bg-amber-50/50 dark:bg-amber-950/20' : 'border-slate-200 dark:border-slate-800'
          }`}
        >
          {/* Centered Profile Avatar / Portrait Frame */}
          <div className="relative group mb-4">
            <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center ring-4 ring-slate-900/10 dark:ring-white/10 relative">
              {previewPhoto ? (
                <img
                  src={previewPhoto}
                  alt="Profile Passport"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="text-center p-3 text-slate-400 flex flex-col items-center justify-center">
                  <User className="w-14 h-14 text-slate-400 opacity-60" />
                </div>
              )}
            </div>

            {/* Status or Verified Badge */}
            {previewPhoto ? (
              <div className="absolute bottom-1 right-1 bg-emerald-600 text-white rounded-full p-1.5 shadow-md border-2 border-white dark:border-slate-900">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 bg-[#0a192f] text-white hover:bg-[#132d52] rounded-full p-2 shadow-md border-2 border-white dark:border-slate-900 cursor-pointer transition-transform active:scale-95"
                title="Upload Photo"
              >
                <Upload className="w-3.5 h-3.5 text-[#f8c22d]" />
              </button>
            )}
          </div>

          {/* Profile Name / Status Label */}
          <div className="text-center space-y-1 mb-4">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
              <span>Biometric Passport &amp; Profile Picture</span>
              {previewPhoto && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                  <ShieldCheck className="w-3 h-3" /> Ready
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {previewPhoto
                ? 'Your passport photo is configured and will be displayed across your client profile.'
                : 'Upload a clear frontal photo of yourself or choose from sample executive portraits.'}
            </p>
          </div>

          {/* Action Triggers */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-xl bg-[#0a192f] hover:bg-[#132d52] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-[#f8c22d]" />
              <span>{previewPhoto ? 'Change Photo' : 'Upload Photo'}</span>
            </button>

            <button
              type="button"
              onClick={startCamera}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
              <span>Take Selfie</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPresets(!showPresets)}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Sample Portraits</span>
            </button>

            {previewPhoto && (
              <button
                type="button"
                onClick={removePhoto}
                className="px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-colors cursor-pointer"
                title="Remove photo"
              >
                <X className="w-4 h-4 inline mr-1" />
                <span>Remove</span>
              </button>
            )}
          </div>

          {cameraError && (
            <p className="text-xs text-rose-600 dark:text-rose-400 mt-2 font-medium">{cameraError}</p>
          )}
        </div>
      )}

      {/* Preset Photo Selection Drawer */}
      {showPresets && (
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 animate-in fade-in zoom-in-95 duration-150 shadow-lg">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span>Select a Sample Executive Portrait:</span>
            <button
              type="button"
              onClick={() => setShowPresets(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer text-xs"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PRESET_PASSPORT_PHOTOS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => selectPreset(p.url)}
                className="group relative rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 hover:border-[#f8c22d] aspect-square bg-slate-100 transition-all cursor-pointer shadow-xs hover:shadow-md"
              >
                <img
                  src={p.url}
                  alt={p.label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute bottom-0 inset-x-0 bg-slate-900/85 text-[10px] text-white py-1 text-center truncate px-1 font-medium">
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
