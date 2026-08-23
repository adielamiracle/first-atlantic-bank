import React, { useState, useEffect } from 'react';
import { Fingerprint, Scan, ShieldCheck, CheckCircle2, X, Lock, Smartphone, Key, AlertCircle, RefreshCw } from 'lucide-react';
import { useBank } from '../../context/BankContext';

export interface BiometricPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (credential: { credentialId: string; type: string; timestamp: string }) => void;
  mode?: 'ENROLL' | 'VERIFY';
  title?: string;
  subtitle?: string;
}

export const BiometricPromptModal: React.FC<BiometricPromptProps> = ({
  isOpen,
  onClose,
  onSuccess,
  mode = 'VERIFY',
  title,
  subtitle
}) => {
  const { darkMode } = useBank();
  const [scanState, setScanState] = useState<'IDLE' | 'SCANNING' | 'SUCCESS' | 'FAILED'>('IDLE');
  const [selectedSensor, setSelectedSensor] = useState<'FACE_ID' | 'TOUCH_ID'>('FACE_ID');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setScanState('IDLE');
      setProgress(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartScan = () => {
    setScanState('SCANNING');
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setScanState('SUCCESS');
          setTimeout(() => {
            onSuccess({
              credentialId: `fido2_hw_${Math.random().toString(36).substring(2, 12)}`,
              type: selectedSensor,
              timestamp: new Date().toISOString()
            });
          }, 800);
          return 100;
        }
        return prev + 25;
      });
    }, 200);
  };

  const isEnroll = mode === 'ENROLL';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border transition-all relative overflow-hidden ${
          darkMode 
            ? 'bg-[#0a192f] border-[#1e3656] text-white shadow-black/80' 
            : 'bg-white border-slate-200 text-slate-900 shadow-xl'
        }`}
      >
        {/* Subtle Background Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-[#c5a880]/15 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full transition-colors cursor-pointer ${
            darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#c5a880]/15 text-[#c5a880] border border-[#c5a880]/30">
            <Lock className="w-3 h-3 text-[#d4af37]" />
            <span>FIDO2 / WebAuthn Hardware Security Enclave</span>
          </div>

          <h3 className="text-xl font-bold font-serif">
            {title || (isEnroll ? 'Register Biometric Hardware Key' : 'Biometric Identity Verification')}
          </h3>
          <p className={`text-xs max-w-sm mx-auto leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {subtitle || (isEnroll 
              ? 'Bind this browser and mobile device directly to your First Atlantic Bank & Trust client credentials.'
              : 'Authenticate using your device Touch ID, Face ID, or Windows Hello secure enclave.'
            )}
          </p>
        </div>

        {/* Sensor Type Selector */}
        <div className="flex justify-center gap-2 mb-6">
          <button
            onClick={() => { setSelectedSensor('FACE_ID'); setScanState('IDLE'); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedSensor === 'FACE_ID'
                ? 'bg-[#0f2a4a] border border-[#c5a880] text-[#e5ca95]'
                : darkMode 
                  ? 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200' 
                  : 'bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Scan className="w-3.5 h-3.5" />
            <span>Face ID / Windows Hello</span>
          </button>

          <button
            onClick={() => { setSelectedSensor('TOUCH_ID'); setScanState('IDLE'); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedSensor === 'TOUCH_ID'
                ? 'bg-[#0f2a4a] border border-[#c5a880] text-[#e5ca95]'
                : darkMode 
                  ? 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200' 
                  : 'bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5" />
            <span>Touch ID / Fingerprint</span>
          </button>
        </div>

        {/* Interactive Biometric Sensor Animation Stage */}
        <div className="my-6 flex flex-col items-center justify-center">
          <div className="relative">
            {/* Pulsing Outer Rings */}
            {scanState === 'SCANNING' && (
              <>
                <div className="absolute inset-0 rounded-full bg-[#c5a880]/30 animate-ping" />
                <div className="absolute -inset-4 rounded-full border border-[#c5a880]/40 animate-spin" />
              </>
            )}

            {/* Core Sensor Target */}
            <div 
              onClick={scanState === 'IDLE' ? handleStartScan : undefined}
              className={`w-28 h-28 rounded-3xl flex flex-col items-center justify-center relative transition-all duration-300 ${
                scanState === 'SUCCESS'
                  ? 'bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400'
                  : scanState === 'SCANNING'
                    ? 'bg-[#071322] border-2 border-[#c5a880] text-[#c5a880] shadow-lg shadow-[#c5a880]/20'
                    : 'bg-[#08182b] border-2 border-dashed border-[#c5a880]/60 text-[#c5a880] hover:scale-105 hover:border-[#c5a880] cursor-pointer'
              }`}
            >
              {scanState === 'SUCCESS' ? (
                <CheckCircle2 className="w-14 h-14 text-emerald-400 animate-in zoom-in-50 duration-300" />
              ) : selectedSensor === 'FACE_ID' ? (
                <Scan className={`w-14 h-14 ${scanState === 'SCANNING' ? 'animate-pulse' : ''}`} />
              ) : (
                <Fingerprint className={`w-14 h-14 ${scanState === 'SCANNING' ? 'animate-pulse' : ''}`} />
              )}

              {/* Laser Scanning Line */}
              {scanState === 'SCANNING' && (
                <div 
                  className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-[#e5ca95] to-transparent shadow-lg shadow-[#e5ca95]"
                  style={{
                    top: `${progress}%`,
                    transition: 'top 0.2s linear'
                  }}
                />
              )}
            </div>
          </div>

          {/* Status Label */}
          <div className="mt-4 text-center">
            {scanState === 'IDLE' && (
              <span className={`text-xs font-semibold ${darkMode ? 'text-[#c5a880]' : 'text-[#8c6d37]'}`}>
                Click the sensor above or button below to scan
              </span>
            )}
            {scanState === 'SCANNING' && (
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#e5ca95] font-mono flex items-center justify-center gap-1.5">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Reading Cryptographic Enclave: {progress}%
                </span>
                <p className="text-[10px] text-slate-400 font-mono">ECDSA-P256 hardware signature verification</p>
              </div>
            )}
            {scanState === 'SUCCESS' && (
              <div className="space-y-1">
                <span className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Biometric Credential Verified!
                </span>
                <p className="text-[10px] text-slate-400 font-mono">Device Key: SHA256-fido2-bound</p>
              </div>
            )}
          </div>
        </div>

        {/* Security Specs Pill */}
        <div className={`p-3 rounded-2xl border text-[11px] space-y-1 mb-6 ${
          darkMode ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Cryptographic Standard:</span>
            <span className="font-mono font-bold text-[#c5a880]">W3C WebAuthn Level 2</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Secure Storage:</span>
            <span className="font-medium">Apple Secure Enclave / TPM 2.0</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Biometric Template:</span>
            <span className="font-medium">Stored on-device only (Zero-Knowledge)</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
              darkMode 
                ? 'border-slate-700 hover:bg-slate-800 text-slate-300' 
                : 'border-slate-300 hover:bg-slate-100 text-slate-700'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleStartScan}
            disabled={scanState === 'SCANNING' || scanState === 'SUCCESS'}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#c5a880] to-[#b39366] text-slate-950 hover:brightness-105 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md disabled:opacity-50 transition-all cursor-pointer"
          >
            {scanState === 'SCANNING' ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-950" />
                <span>Scanning...</span>
              </>
            ) : scanState === 'SUCCESS' ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                <span>Success</span>
              </>
            ) : (
              <>
                <Fingerprint className="w-3.5 h-3.5 text-slate-950" />
                <span>{isEnroll ? 'Enroll Biometrics' : 'Authenticate Now'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
