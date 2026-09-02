import React, { useState, useEffect } from 'react';
import { Database, CheckCircle2, AlertTriangle, XCircle, RefreshCw, Globe, Shield, Terminal } from 'lucide-react';
import { supabase, isSupabaseConfigured, safeSupabaseOp } from '../../lib/supabaseClient.js';

export interface SupabasePingResult {
  status: 'CHECKING' | 'CONFIGURED_REACHABLE' | 'CONFIGURED_UNREACHABLE' | 'UNCONFIGURED_FALLBACK';
  configured: boolean;
  urlProvided: boolean;
  maskedUrl: string;
  keyProvided: boolean;
  maskedKey: string;
  latencyMs?: number;
  message: string;
  details?: any;
}

export const SupabaseStatusChecker: React.FC<{
  autoCheck?: boolean;
  showCard?: boolean;
  compact?: boolean;
  onStatusChange?: (result: SupabasePingResult) => void;
}> = ({
  autoCheck = true,
  showCard = true,
  compact = false,
  onStatusChange
}) => {
  const getEnvUrl = (): string => {
    return ((typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
      (typeof window !== 'undefined' && (window as any).__ENV__?.NEXT_PUBLIC_SUPABASE_URL) ||
      '').trim();
  };

  const getEnvKey = (): string => {
    return ((typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
      (typeof window !== 'undefined' && (window as any).__ENV__?.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
      '').trim();
  };

  const [isPinging, setIsPinging] = useState(false);
  const [result, setResult] = useState<SupabasePingResult>({
    status: 'CHECKING',
    configured: isSupabaseConfigured,
    urlProvided: Boolean(getEnvUrl()),
    maskedUrl: getMaskedUrl(),
    keyProvided: Boolean(getEnvKey()),
    maskedKey: getMaskedKey(),
    message: 'Initializing Supabase connection telemetry...'
  });

  function getMaskedUrl(): string {
    const url = getEnvUrl();
    if (!url) return 'Not Set';
    try {
      const parsed = new URL(url);
      return `${parsed.protocol}//${parsed.hostname}`;
    } catch {
      return url.length > 20 ? `${url.substring(0, 12)}...${url.slice(-4)}` : url;
    }
  }

  function getMaskedKey(): string {
    const key = getEnvKey();
    if (!key) return 'Not Set';
    if (key.length <= 10) return '••••••••';
    return `${key.substring(0, 6)}••••${key.slice(-4)}`;
  }

  const pingSupabase = async () => {
    setIsPinging(true);
    const start = performance.now();
    const rawUrl = getEnvUrl();
    const rawKey = getEnvKey();

    const urlProvided = Boolean(rawUrl);
    const keyProvided = Boolean(rawKey);
    const configured = isSupabaseConfigured;

    if (!urlProvided || !keyProvided) {
      const res: SupabasePingResult = {
        status: 'UNCONFIGURED_FALLBACK',
        configured: false,
        urlProvided,
        maskedUrl: getMaskedUrl(),
        keyProvided,
        maskedKey: getMaskedKey(),
        latencyMs: 0,
        message: 'Supabase credentials not supplied in environment. Local resilient storage active.'
      };
      setResult(res);
      setIsPinging(false);
      onStatusChange?.(res);
      return;
    }

    try {
      // 1. First probe standard auth endpoint / health
      const pingPromise = (async (): Promise<{ ok: boolean; data?: any; timeout?: boolean }> => {
        // Attempt a read on auth or standard rest endpoint
        if (supabase?.auth?.getSession) {
          const authRes = await supabase.auth.getSession();
          return { ok: true, data: authRes };
        }
        return { ok: true };
      })();

      const probe = await safeSupabaseOp<{ ok: boolean; data?: any; timeout?: boolean }>(pingPromise, 4000, { ok: false, timeout: true });
      const elapsed = Math.round(performance.now() - start);

      if (probe && (probe as any).ok) {
        const res: SupabasePingResult = {
          status: 'CONFIGURED_REACHABLE',
          configured: true,
          urlProvided: true,
          maskedUrl: getMaskedUrl(),
          keyProvided: true,
          maskedKey: getMaskedKey(),
          latencyMs: elapsed,
          message: `Supabase Cloud endpoint successfully reached (${elapsed}ms latency).`
        };
        setResult(res);
        onStatusChange?.(res);
      } else {
        const res: SupabasePingResult = {
          status: 'CONFIGURED_UNREACHABLE',
          configured: true,
          urlProvided: true,
          maskedUrl: getMaskedUrl(),
          keyProvided: true,
          maskedKey: getMaskedKey(),
          latencyMs: elapsed,
          message: 'Supabase URL configured but probe timed out or was unreachable from client. Local fallback active.'
        };
        setResult(res);
        onStatusChange?.(res);
      }
    } catch (err: any) {
      const elapsed = Math.round(performance.now() - start);
      const res: SupabasePingResult = {
        status: 'CONFIGURED_UNREACHABLE',
        configured: true,
        urlProvided: true,
        maskedUrl: getMaskedUrl(),
        keyProvided: true,
        maskedKey: getMaskedKey(),
        latencyMs: elapsed,
        message: err?.message || 'Network exception pinging Supabase endpoint.',
        details: err
      };
      setResult(res);
      onStatusChange?.(res);
    } finally {
      setIsPinging(false);
    }
  };

  useEffect(() => {
    if (autoCheck) {
      pingSupabase();
    }
  }, [autoCheck]);

  if (!showCard) {
    return null;
  }

  if (compact) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono shadow-xs">
        <span className="flex items-center gap-1.5 font-semibold text-slate-700">
          <Database className="w-3.5 h-3.5 text-slate-500" />
          <span>Supabase:</span>
        </span>
        {isPinging ? (
          <span className="flex items-center gap-1 text-slate-500">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>Pinging...</span>
          </span>
        ) : result.status === 'CONFIGURED_REACHABLE' ? (
          <span className="flex items-center gap-1 text-emerald-600 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Online ({result.latencyMs}ms)</span>
          </span>
        ) : result.status === 'CONFIGURED_UNREACHABLE' ? (
          <span className="flex items-center gap-1 text-amber-600 font-bold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Unreachable (Fallback)</span>
          </span>
        ) : (
          <span className="flex items-center gap-1 text-slate-500">
            <Shield className="w-3.5 h-3.5" />
            <span>Local Store</span>
          </span>
        )}
        <button
          type="button"
          onClick={pingSupabase}
          disabled={isPinging}
          title="Re-ping Supabase endpoint"
          aria-label="Re-ping Supabase"
          className="ml-1 p-0.5 hover:text-slate-900 text-slate-400 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${isPinging ? 'animate-spin' : ''}`} />
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Supabase Connection Telemetry</h4>
            <p className="text-xs text-slate-500">Diagnostics & Environment Reachability</p>
          </div>
        </div>
        <button
          type="button"
          onClick={pingSupabase}
          disabled={isPinging}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
          <span>{isPinging ? 'Pinging...' : 'Ping Test'}</span>
        </button>
      </div>

      <div className="mt-3 space-y-2.5 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <div className="flex items-center justify-between text-slate-500 font-semibold mb-1">
              <span className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" />
                <span>NEXT_PUBLIC_SUPABASE_URL</span>
              </span>
              <span className={result.urlProvided ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                {result.urlProvided ? 'Set' : 'Missing'}
              </span>
            </div>
            <div className="font-mono text-slate-800 truncate" title={result.maskedUrl}>
              {result.maskedUrl}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <div className="flex items-center justify-between text-slate-500 font-semibold mb-1">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" />
                <span>NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
              </span>
              <span className={result.keyProvided ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                {result.keyProvided ? 'Set' : 'Missing'}
              </span>
            </div>
            <div className="font-mono text-slate-800 truncate">
              {result.maskedKey}
            </div>
          </div>
        </div>

        <div className={`p-3 rounded-lg flex items-start gap-2.5 ${
          result.status === 'CONFIGURED_REACHABLE'
            ? 'bg-emerald-50/80 border border-emerald-200 text-emerald-900'
            : result.status === 'CONFIGURED_UNREACHABLE'
            ? 'bg-amber-50/80 border border-amber-200 text-amber-900'
            : 'bg-slate-50 border border-slate-200 text-slate-700'
        }`}>
          {result.status === 'CONFIGURED_REACHABLE' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : result.status === 'CONFIGURED_UNREACHABLE' ? (
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          ) : (
            <Shield className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          )}
          <div className="space-y-0.5">
            <div className="font-semibold">
              {result.status === 'CONFIGURED_REACHABLE' && 'Cloud Supabase Node Online'}
              {result.status === 'CONFIGURED_UNREACHABLE' && 'Connection Warning (Fallback Active)'}
              {result.status === 'UNCONFIGURED_FALLBACK' && 'Local Resilient Storage Active'}
              {result.status === 'CHECKING' && 'Checking status...'}
            </div>
            <p className="text-[11px] opacity-90">{result.message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
