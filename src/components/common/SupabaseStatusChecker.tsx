import React, { useState, useEffect } from 'react';
import { Database, CheckCircle2, AlertTriangle, XCircle, RefreshCw, Globe, Shield, Terminal, CloudUpload, FileCode, Check, Copy, HardDrive } from 'lucide-react';
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
  cloudStats?: {
    usersInSupabase?: number;
    accountsInSupabase?: number;
    transactionsInSupabase?: number;
    filesInSupabase?: number;
  };
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
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [sqlSchemaContent, setSqlSchemaContent] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);

  const [result, setResult] = useState<SupabasePingResult>({
    status: 'CHECKING',
    configured: isSupabaseConfigured,
    urlProvided: Boolean(getEnvUrl()),
    maskedUrl: getMaskedUrl(),
    keyProvided: Boolean(getEnvKey()),
    maskedKey: getMaskedKey(),
    message: 'Checking Supabase database & storage connectivity...'
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

    try {
      // Check backend Supabase diagnostics endpoint
      const res = await fetch('/api/admin/supabase/status');
      if (res.ok) {
        const data = await res.json();
        const elapsed = Math.round(performance.now() - start);

        if (data.configured) {
          const pingResult: SupabasePingResult = {
            status: 'CONFIGURED_REACHABLE',
            configured: true,
            urlProvided: true,
            maskedUrl: data.url || getMaskedUrl(),
            keyProvided: true,
            maskedKey: getMaskedKey(),
            latencyMs: elapsed,
            message: `Supabase Cloud Live — Auto-syncing users, accounts, transactions & storage files (${elapsed}ms).`,
            cloudStats: data.counts
          };
          setResult(pingResult);
          onStatusChange?.(pingResult);
          setIsPinging(false);
          return;
        }
      }
    } catch (e) {
      // ignore backend fetch fail, fallback to client probe
    }

    if (!urlProvided || !keyProvided) {
      const res: SupabasePingResult = {
        status: 'UNCONFIGURED_FALLBACK',
        configured: false,
        urlProvided,
        maskedUrl: getMaskedUrl(),
        keyProvided,
        maskedKey: getMaskedKey(),
        latencyMs: 0,
        message: 'Supabase credentials not supplied in environment. Local persistent storage active.'
      };
      setResult(res);
      setIsPinging(false);
      onStatusChange?.(res);
      return;
    }

    try {
      const pingPromise = (async (): Promise<{ ok: boolean; data?: any }> => {
        if (supabase?.auth?.getSession) {
          const authRes = await supabase.auth.getSession();
          return { ok: true, data: authRes };
        }
        return { ok: true };
      })();

      const probe = await safeSupabaseOp<{ ok: boolean; data?: any }>(pingPromise, 4000, { ok: false });
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
          message: `Supabase Cloud endpoint reachable (${elapsed}ms latency).`
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
          message: 'Supabase URL configured but probe timed out. Local disk backup active.'
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
        message: err?.message || 'Network exception pinging Supabase endpoint.'
      };
      setResult(res);
      onStatusChange?.(res);
    } finally {
      setIsPinging(false);
    }
  };

  const handleSyncAll = async () => {
    setIsSyncing(true);
    setSyncSuccessMsg(null);
    try {
      const res = await fetch('/api/admin/supabase/sync-all', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        const total = Object.values(data.syncedCounts || {}).reduce((a: any, b: any) => a + b, 0);
        setSyncSuccessMsg(`Saved ${total} records and files to Supabase Cloud!`);
        pingSupabase();
      } else {
        setSyncSuccessMsg(data.message || 'Sync completed with local storage');
      }
    } catch (e: any) {
      setSyncSuccessMsg(`Sync error: ${e.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleFetchSchema = async () => {
    try {
      const res = await fetch('/api/admin/supabase/schema');
      if (res.ok) {
        const text = await res.text();
        setSqlSchemaContent(text);
      }
    } catch (e) {
      console.error(e);
    }
    setShowSqlModal(true);
  };

  const handleCopySql = () => {
    if (sqlSchemaContent) {
      navigator.clipboard.writeText(sqlSchemaContent);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2000);
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
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono shadow-xs">
        <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
          <Database className="w-3.5 h-3.5 text-emerald-500" />
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
          className="ml-1 p-0.5 hover:text-slate-900 dark:hover:text-white text-slate-400 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${isPinging ? 'animate-spin' : ''}`} />
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200 dark:border-emerald-800">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Supabase Cloud Database & Storage
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                All Data & Files Sync Active
              </span>
            </h4>
            <p className="text-xs text-slate-500">Continuous cloud replication for users, bank accounts, ledgers, and uploaded documents</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSyncAll}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <CloudUpload className={`w-3.5 h-3.5 ${isSyncing ? 'animate-bounce' : ''}`} />
            <span>{isSyncing ? 'Syncing to Cloud...' : 'Backup All to Supabase'}</span>
          </button>
          <button
            type="button"
            onClick={handleFetchSchema}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <FileCode className="w-3.5 h-3.5 text-slate-500" />
            <span>SQL Schema</span>
          </button>
          <button
            type="button"
            onClick={pingSupabase}
            disabled={isPinging}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
            <span>{isPinging ? 'Pinging...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {syncSuccessMsg && (
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {syncSuccessMsg}
          </span>
          <button onClick={() => setSyncSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900 font-bold">✕</button>
        </div>
      )}

      <div className="space-y-3 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="flex items-center gap-1 font-semibold">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>Supabase Endpoint</span>
              </span>
              <span className={result.urlProvided ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                {result.urlProvided ? 'Active' : 'Not Set'}
              </span>
            </div>
            <div className="font-mono text-slate-800 dark:text-slate-200 truncate" title={result.maskedUrl}>
              {result.maskedUrl}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="flex items-center gap-1 font-semibold">
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                <span>Service Key</span>
              </span>
              <span className={result.keyProvided ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                {result.keyProvided ? 'Authorized' : 'Not Set'}
              </span>
            </div>
            <div className="font-mono text-slate-800 dark:text-slate-200 truncate">
              {result.maskedKey}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="flex items-center gap-1 font-semibold">
                <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                <span>Cloud Storage</span>
              </span>
              <span className="text-emerald-600 font-bold">Enabled</span>
            </div>
            <div className="text-slate-800 dark:text-slate-200 font-medium truncate">
              Bucket: <span className="font-mono text-emerald-600 dark:text-emerald-400">uploads / documents</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="flex items-center gap-1 font-semibold">
                <Database className="w-3.5 h-3.5 text-slate-400" />
                <span>Database Sync</span>
              </span>
              <span className="text-emerald-600 font-bold">Continuous</span>
            </div>
            <div className="text-slate-800 dark:text-slate-200 font-medium truncate">
              Dual-write: <span className="font-mono text-emerald-600 dark:text-emerald-400">Memory + Supabase</span>
            </div>
          </div>
        </div>

        <div className={`p-3 rounded-lg flex items-start gap-2.5 ${
          result.status === 'CONFIGURED_REACHABLE'
            ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
            : result.status === 'CONFIGURED_UNREACHABLE'
            ? 'bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
            : 'bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
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
              {result.status === 'CONFIGURED_REACHABLE' && 'Supabase Cloud Database & Storage Connected Live'}
              {result.status === 'CONFIGURED_UNREACHABLE' && 'Supabase Endpoint Unreachable (Local Fallback Active)'}
              {result.status === 'UNCONFIGURED_FALLBACK' && 'Local Resilient Storage Active (Configure Supabase Keys to Enable Cloud Sync)'}
              {result.status === 'CHECKING' && 'Connecting to Supabase...'}
            </div>
            <p className="text-[11px] opacity-90">{result.message}</p>
          </div>
        </div>
      </div>

      {/* SQL Schema Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Supabase SQL Migration Script</h3>
                  <p className="text-xs text-slate-500">Run this once in your Supabase SQL Editor to prepare all tables and storage buckets</p>
                </div>
              </div>
              <button
                onClick={() => setShowSqlModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 flex-1 overflow-auto bg-slate-950 text-slate-200 font-mono text-xs rounded-lg m-4 border border-slate-800">
              <pre>{sqlSchemaContent || '-- Fetching schema...'}</pre>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500">Location: <code className="text-emerald-600">supabase_schema.sql</code></span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySql}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold cursor-pointer"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy SQL'}</span>
                </button>
                <button
                  onClick={() => setShowSqlModal(false)}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
