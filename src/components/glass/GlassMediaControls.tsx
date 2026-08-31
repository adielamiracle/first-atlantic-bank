import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  Radio,
  Sparkles,
  Headphones,
  Maximize2,
  Clock,
  AudioWaveform,
  Sliders,
  Check
} from 'lucide-react';
import { GlassPanel } from './GlassPanel';
import { GlassButton } from './GlassButton';
import { GlassSlider } from './GlassSlider';

export interface AudioTrack {
  id: string;
  title: string;
  category: string;
  speaker: string;
  durationSeconds: number;
  description: string;
  frequencyBase: number;
}

const DEFAULT_TRACKS: AudioTrack[] = [
  {
    id: 'track-1',
    title: 'First Atlantic Executive Briefing',
    category: 'Institutional Market Dispatch',
    speaker: 'Chief Investment Officer',
    durationSeconds: 184,
    description: 'Federal Reserve liquidity forecast & cross-border FX clearing analysis.',
    frequencyBase: 220
  },
  {
    id: 'track-2',
    title: 'SWIFT GPI Priority Wire Verification Memo',
    category: 'Secure Voice Authentication',
    speaker: 'Global Treasury Operations',
    durationSeconds: 96,
    description: 'Encrypted confirmation log for international high-value settlement wire #FATL-9821.',
    frequencyBase: 330
  },
  {
    id: 'track-3',
    title: 'Binaural Focus & Calm Soundscape',
    category: 'Wealth Private Audio',
    speaker: 'First Atlantic Audio Lab',
    durationSeconds: 320,
    description: 'Theta-wave 432Hz ambient frequency for analytical clarity and wealth management focus.',
    frequencyBase: 432
  },
  {
    id: 'track-4',
    title: 'AI Fraud Sentinel Pulse Monitor',
    category: 'Real-Time Telemetry Feed',
    speaker: 'Autonomous AML Engine',
    durationSeconds: 145,
    description: 'Telemetry monitoring active multi-currency corridors and zero-trust perimeter health.',
    frequencyBase: 275
  }
];

export interface GlassMediaControlsProps {
  tracks?: AudioTrack[];
  variant?: 'card' | 'compact-bar' | 'floating-dock';
  className?: string;
}

export const GlassMediaControls: React.FC<GlassMediaControlsProps> = ({
  tracks = DEFAULT_TRACKS,
  variant = 'card',
  className = ''
}) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [showVolumePopup, setShowVolumePopup] = useState(false);
  const [showSpeedSelector, setShowSpeedSelector] = useState(false);

  const activeTrack = tracks[currentTrackIndex] || tracks[0];

  // Web Audio Synth Reference for Real Audio Soundscape Generation
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const timerRef = useRef<any>(null);

  // Initialize Web Audio Synthesizer Safely on User Interaction
  const startAudioTone = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContextClass();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      if (gainNodeRef.current) {
        try {
          gainNodeRef.current.disconnect();
        } catch (e) {}
      }
      if (oscRef.current) {
        try {
          oscRef.current.stop();
          oscRef.current.disconnect();
        } catch (e) {}
      }

      const gain = audioCtxRef.current.createGain();
      const currentVol = isMuted ? 0 : (volume / 100) * 0.08;
      gain.gain.setValueAtTime(currentVol, audioCtxRef.current.currentTime);
      gain.connect(audioCtxRef.current.destination);
      gainNodeRef.current = gain;

      const osc = audioCtxRef.current.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(activeTrack.frequencyBase, audioCtxRef.current.currentTime);
      osc.connect(gain);
      osc.start();
      oscRef.current = osc;
    } catch (err) {
      console.warn('AudioContext playback fallback', err);
    }
  };

  const stopAudioTone = () => {
    if (gainNodeRef.current && audioCtxRef.current) {
      try {
        gainNodeRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.05);
      } catch (e) {}
    }
    setTimeout(() => {
      if (oscRef.current) {
        try {
          oscRef.current.stop();
          oscRef.current.disconnect();
          oscRef.current = null;
        } catch (e) {}
      }
    }, 80);
  };

  // Adjust volume dynamically
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      const currentVol = isMuted ? 0 : (volume / 100) * 0.08;
      gainNodeRef.current.gain.setValueAtTime(currentVol, audioCtxRef.current.currentTime);
    }
  }, [volume, isMuted]);

  // Track playback time interval
  useEffect(() => {
    if (isPlaying) {
      startAudioTone();
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= activeTrack.durationSeconds) {
            if (isRepeat) {
              return 0;
            } else {
              handleNextTrack();
              return 0;
            }
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    } else {
      stopAudioTone();
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopAudioTone();
    };
  }, [isPlaying, currentTrackIndex, playbackSpeed, isRepeat]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNextTrack = () => {
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * tracks.length);
      setCurrentTrackIndex(randomIndex);
    } else {
      setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    }
    setCurrentTime(0);
  };

  const handlePrevTrack = () => {
    if (currentTime > 5) {
      setCurrentTime(0);
    } else {
      setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
      setCurrentTime(0);
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = Math.floor(sec % 60);
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const progressPct = (currentTime / activeTrack.durationSeconds) * 100;

  return (
    <GlassPanel
      variant="elevated"
      blur="xl"
      rounded="3xl"
      glow={isPlaying}
      className={`p-4 sm:p-6 space-y-4 ${className}`}
    >
      {/* Header Bar: Track Category & Live Frequency Signal */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/40 dark:border-white/10">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-700 dark:text-amber-300 shrink-0">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-[#8c6d37] dark:text-[#c5a880] block truncate">
              {activeTrack.category}
            </span>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
              {activeTrack.speaker}
            </p>
          </div>
        </div>

        {/* Live Audio Equalizer Waveform Bars */}
        <div className="flex items-end gap-1 h-5 px-2 py-1 rounded-lg bg-white/60 dark:bg-black/20 border border-white/50 dark:border-white/10">
          <span className={`w-1 rounded-full bg-[#c5a880] ${isPlaying ? 'glass-eq-bar-1' : 'h-1'}`} />
          <span className={`w-1 rounded-full bg-[#c5a880] ${isPlaying ? 'glass-eq-bar-2' : 'h-2'}`} />
          <span className={`w-1 rounded-full bg-[#c5a880] ${isPlaying ? 'glass-eq-bar-3' : 'h-3'}`} />
          <span className={`w-1 rounded-full bg-[#c5a880] ${isPlaying ? 'glass-eq-bar-4' : 'h-1.5'}`} />
          <span className={`w-1 rounded-full bg-[#c5a880] ${isPlaying ? 'glass-eq-bar-5' : 'h-2.5'}`} />
        </div>
      </div>

      {/* Main Track Display & Track Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-1 min-w-0 flex-1">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-serif tracking-tight truncate">
            {activeTrack.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {activeTrack.description}
          </p>
        </div>

        {/* Track Playlist Quick Selector */}
        <div className="flex items-center gap-1 self-stretch sm:self-auto overflow-x-auto no-scrollbar py-0.5">
          {tracks.map((t, idx) => (
            <button
              key={t.id}
              onClick={() => {
                setCurrentTrackIndex(idx);
                setCurrentTime(0);
              }}
              title={t.title}
              className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
                idx === currentTrackIndex
                  ? 'bg-[#0a192f] text-white dark:bg-[#c5a880] dark:text-[#0a192f] shadow-xs'
                  : 'bg-white/50 dark:bg-white/10 text-slate-600 dark:text-slate-400 hover:bg-white/80'
              }`}
            >
              0{idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Scrubbing Glass Slider Bar & Timestamp */}
      <div className="space-y-1.5 pt-1">
        <GlassSlider
          value={currentTime}
          onChange={(val) => setCurrentTime(val)}
          min={0}
          max={activeTrack.durationSeconds}
          showValueBubble={false}
          showMinMax={false}
          variant="gold"
          className="cursor-pointer"
        />

        <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 dark:text-slate-400 font-semibold px-0.5">
          <span>{formatSeconds(currentTime)}</span>
          <span className="text-slate-400">-{formatSeconds(Math.max(0, activeTrack.durationSeconds - currentTime))}</span>
        </div>
      </div>

      {/* Glass Transport Controls Deck (Buttons, Sliders, Speed) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        {/* Left Options: Shuffle & Repeat */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsShuffle(!isShuffle)}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              isShuffle
                ? 'bg-amber-500/20 text-[#c5a880] border border-[#c5a880]/40'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/30'
            }`}
            title="Shuffle Playlist"
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsRepeat(!isRepeat)}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              isRepeat
                ? 'bg-amber-500/20 text-[#c5a880] border border-[#c5a880]/40'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/30'
            }`}
            title="Repeat Current Audio"
          >
            <Repeat className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Center Main Transport: Prev, Big Glass Play/Pause Orb, Next */}
        <div className="flex items-center gap-3">
          <GlassButton
            size="icon-sm"
            pill
            variant="glass-frosted"
            onClick={handlePrevTrack}
            title="Previous / Restart"
          >
            <SkipBack className="w-4 h-4 text-slate-700 dark:text-slate-200" />
          </GlassButton>

          {/* Glowing Play / Pause Glass Orb */}
          <button
            onClick={togglePlay}
            className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shadow-lg active:scale-95 ${
              isPlaying
                ? 'bg-gradient-to-tr from-amber-500 to-[#c5a880] text-slate-950 ring-4 ring-amber-400/30 shadow-[0_0_25px_rgba(217,119,6,0.5)]'
                : 'bg-white/80 dark:bg-white/15 text-slate-900 dark:text-white hover:bg-white dark:hover:bg-white/25 border border-white/80 dark:border-white/20'
            }`}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current translate-x-0.5" />
            )}
          </button>

          <GlassButton
            size="icon-sm"
            pill
            variant="glass-frosted"
            onClick={handleNextTrack}
            title="Next Track"
          >
            <SkipForward className="w-4 h-4 text-slate-700 dark:text-slate-200" />
          </GlassButton>
        </div>

        {/* Right Options: Volume & Speed */}
        <div className="flex items-center gap-2">
          {/* Speed Selector Pill */}
          <div className="relative">
            <button
              onClick={() => setShowSpeedSelector(!showSpeedSelector)}
              className="px-2.5 py-1 rounded-lg bg-white/50 dark:bg-white/10 border border-white/50 dark:border-white/15 text-[11px] font-mono font-bold text-slate-700 dark:text-slate-200 hover:bg-white/80 transition-colors cursor-pointer"
            >
              {playbackSpeed}x
            </button>

            {showSpeedSelector && (
              <div className="absolute bottom-full right-0 mb-2 p-1.5 rounded-xl glass-panel-elevated flex flex-col gap-1 z-30 min-w-[70px] shadow-xl animate-in fade-in">
                {[0.75, 1.0, 1.25, 1.5, 2.0].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setPlaybackSpeed(s);
                      setShowSpeedSelector(false);
                    }}
                    className={`px-2 py-1 rounded-md text-[10px] font-mono text-left font-bold transition-colors cursor-pointer flex items-center justify-between ${
                      playbackSpeed === s
                        ? 'bg-[#c5a880] text-slate-950'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-white/10'
                    }`}
                  >
                    <span>{s}x</span>
                    {playbackSpeed === s && <Check className="w-2.5 h-2.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Volume Control Mute / Slider */}
          <div className="relative flex items-center">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-500" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>

            {/* Compact Volume Slider on Desktop */}
            <div className="hidden sm:block w-16">
              <GlassSlider
                value={isMuted ? 0 : volume}
                onChange={(val) => {
                  setVolume(val);
                  if (isMuted) setIsMuted(false);
                }}
                min={0}
                max={100}
                showValueBubble={false}
                showMinMax={false}
                variant="gold"
              />
            </div>
          </div>
        </div>
      </div>
    </GlassPanel>
  );
};
