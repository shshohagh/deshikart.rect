import React, { useState } from 'react';
import { Database, ShieldCheck, Wifi, WifiOff, RefreshCw, CheckCircle, AlertTriangle, Key, ExternalLink } from 'lucide-react';
import { LaravelApiConfig } from '../types';
import { apiService } from '../services/api';

interface ApiConfigModalProps {
  onClose: () => void;
  onConfigSaved: () => void;
}

export const ApiConfigModal: React.FC<ApiConfigModalProps> = ({
  onClose,
  onConfigSaved,
}) => {
  const [config, setConfig] = useState<LaravelApiConfig>(apiService.getConfig());
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    success?: boolean;
    latency?: number;
    message?: string;
  }>({ tested: false });
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>('');

  const offlineQueue = apiService.getOfflineQueue();

  const handleSave = () => {
    apiService.saveConfig(config);
    onConfigSaved();
    onClose();
  };

  const handleTestPing = async () => {
    setIsTesting(true);
    setTestResult({ tested: false });
    try {
      const res = await apiService.testConnection();
      setTestResult({
        tested: true,
        success: res.success,
        latency: res.latency,
        message: res.message,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSyncOfflineQueue = async () => {
    setIsSyncing(true);
    setSyncStatus('');
    try {
      const res = await apiService.syncOfflineQueue();
      setSyncStatus(`Sync complete! ${res.syncedCount} orders updated, ${res.remainingCount} remaining.`);
      onConfigSaved();
    } catch (err: unknown) {
      const e = err as Error;
      setSyncStatus(`Sync error: ${e.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-stone-200">
        {/* Header */}
        <div className="bg-stone-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-600 rounded-lg">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">Laravel PHP REST API Hub</h3>
              <p className="text-stone-400 text-xs">Configure Bearer token, base URL &amp; offline queue</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs sm:text-sm">
          {/* Base URL */}
          <div>
            <label className="block font-semibold text-stone-800 mb-1">
              API Base URL
            </label>
            <input
              type="text"
              value={config.baseUrl}
              onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
              placeholder="https://api.yourdomain.com/api/v1"
              className="w-full px-3 py-2 border border-stone-300 rounded-lg outline-hidden focus:border-amber-600 font-mono text-xs"
            />
            <p className="text-[11px] text-stone-500 mt-1">
              For local Laravel dev with Android emulator, use <code className="bg-stone-100 px-1 py-0.5 rounded">http://10.0.2.2:8000/api/v1</code> or standard backend URL.
            </p>
          </div>

          {/* Bearer Token */}
          <div>
            <label className="block font-semibold text-stone-800 mb-1 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-600" />
              <span>Sanctum / Passport Bearer Token</span>
            </label>
            <input
              type="password"
              value={config.bearerToken}
              onChange={(e) => setConfig({ ...config, bearerToken: e.target.value })}
              placeholder="Bearer Token (e.g. 1|2c3d4e5f6...)"
              className="w-full px-3 py-2 border border-stone-300 rounded-lg outline-hidden focus:border-amber-600 font-mono text-xs"
            />
          </div>

          {/* Live vs Offline toggle */}
          <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between">
            <div>
              <div className="font-semibold text-stone-800 flex items-center gap-1.5">
                {config.isLiveConnection ? (
                  <Wifi className="w-4 h-4 text-emerald-600" />
                ) : (
                  <WifiOff className="w-4 h-4 text-stone-500" />
                )}
                <span>Live Remote Sync Mode</span>
              </div>
              <p className="text-stone-500 text-xs">
                {config.isLiveConnection
                  ? 'Transmits orders directly to your remote Laravel backend.'
                  : 'Runs in zero-latency offline client mode with local database storage.'}
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.isLiveConnection}
                onChange={(e) => setConfig({ ...config, isLiveConnection: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>

          {/* Connection Test */}
          <div className="flex items-center justify-between p-3 border border-stone-200 rounded-xl">
            <div>
              <span className="font-semibold text-stone-800 block">Connection Health</span>
              {testResult.tested && (
                <span
                  className={`text-xs flex items-center gap-1 mt-0.5 ${
                    testResult.success ? 'text-emerald-700 font-semibold' : 'text-rose-600'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle className="w-3.5 h-3.5" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5" />
                  )}
                  {testResult.message} ({testResult.latency}ms)
                </span>
              )}
            </div>

            <button
              onClick={handleTestPing}
              disabled={isTesting}
              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs rounded-lg transition-colors"
            >
              {isTesting ? 'Testing...' : 'Ping Test'}
            </button>
          </div>

          {/* Offline Sync Queue */}
          <div className="p-3 border border-amber-200 bg-amber-50/40 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="font-bold text-amber-900 block">
                  Pending Offline Queue ({offlineQueue.length})
                </span>
                <span className="text-stone-600 text-xs">
                  Orders queued locally awaiting dispatch
                </span>
              </div>
              <button
                onClick={handleSyncOfflineQueue}
                disabled={isSyncing || offlineQueue.length === 0}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white font-semibold text-xs rounded-lg flex items-center gap-1 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Sync Now</span>
              </button>
            </div>
            {syncStatus && (
              <p className="text-xs text-amber-800 font-medium">{syncStatus}</p>
            )}
          </div>

          {/* Laravel Schema Reference */}
          <div className="border border-stone-200 rounded-xl p-3 bg-stone-50">
            <span className="font-bold text-stone-700 text-xs uppercase tracking-wider block mb-1">
              Required Laravel Endpoints
            </span>
            <ul className="text-xs font-mono text-stone-600 space-y-1">
              <li>• <span className="text-emerald-700 font-bold">POST</span> /api/v1/orders (Store checkout payload)</li>
              <li>• <span className="text-amber-700 font-bold">PATCH</span> /api/v1/orders/{`{order_number}`}/status</li>
              <li>• <span className="text-blue-700 font-bold">GET</span> /api/v1/health (Healthcheck probe)</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-stone-300 hover:bg-stone-100 rounded-xl text-stone-700 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
