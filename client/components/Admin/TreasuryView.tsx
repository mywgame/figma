/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Vault,
  ArrowRight,
  RefreshCw,
  Sliders,
  Check,
  AlertTriangle,
  FileText,
  Copy,
  ChevronRight,
  Info,
  Activity,
  UserCheck,
  Play,
  Pause,
  Clock,
  Coins,
  Trash2,
  Settings,
  HelpCircle,
  TrendingDown
} from 'lucide-react';
import { Card, Badge, Button } from '../ui/index.ts';
import { ThemeTokens } from '../ui/themeTokens.ts';

interface TreasuryViewProps {
  t: ThemeTokens;
  isDark: boolean;
}

interface SweepJob {
  id: string;
  network: string;
  sourceAddress: string;
  destinationAddress: string;
  sweepType: 'USER_TO_HOT' | 'HOT_TO_COLD';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  amount: string;
  txHash: string | null;
  errorMessage: string | null;
  attempts: number;
  createdAt: string;
}

interface DepositAddress {
  id: string;
  userId: string;
  network: string;
  address: string;
  onChainBalance: string;
}

interface SweepQueueItem {
  id: string;
  depositId: string;
  userId: string;
  depositAddress: string;
  network: string;
  amount: string;
  status: 'PENDING' | 'WAITING_DELAY' | 'WAITING_GAS' | 'GAS_FUNDING' | 'READY_TO_SWEEP' | 'SWEEPING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  gasStatus: 'LOW' | 'FUNDING_SENT' | 'OK' | 'FAILED';
  gasTxHash: string | null;
  sweepTxHash: string | null;
  errorMessage: string | null;
  attempts: number;
  eligibleAt: string;
  createdAt: string;
  updatedAt: string;
  userEmail: string;
  nativeGasBalance: string;
}

export const TreasuryView: React.FC<TreasuryViewProps> = ({ t, isDark }) => {
  const networks = ['USDT_BEP20', 'USDT_POLYGON', 'USDT_TRC20'];
  const [selectedNetwork, setSelectedNetwork] = useState(networks[0]);

  // General States
  const [config, setConfig] = useState<any>(null);
  const [liveHotBalance, setLiveHotBalance] = useState('0.00000000');
  const [liveColdBalance, setLiveColdBalance] = useState('0.00000000');
  const [totalPendingSweep, setTotalPendingSweep] = useState('0.00000000');
  const [depositAddresses, setDepositAddresses] = useState<DepositAddress[]>([]);
  const [jobs, setJobs] = useState<SweepJob[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Editable Sweep Config States
  const [sweepMode, setSweepMode] = useState<'AUTOMATIC' | 'MANUAL' | 'HYBRID'>('AUTOMATIC');
  const [sweepDelay, setSweepDelay] = useState<string>('IMMEDIATE');
  const [customDelayMinutes, setCustomDelayMinutes] = useState<number>(0);
  const [autoSweepThreshold, setAutoSweepThreshold] = useState('1.00000000');
  const [paused, setPaused] = useState<boolean>(false);

  // Sweep Queue States
  const [sweepQueueItems, setSweepQueueItems] = useState<SweepQueueItem[]>([]);
  const [selectedQueueIds, setSelectedQueueIds] = useState<string[]>([]);
  const [queueLoading, setQueueLoading] = useState(false);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  // Form input
  const [sweepToColdAmount, setSweepToColdAmount] = useState('');

  // Processing indicators
  const [savingConfig, setSavingConfig] = useState(false);
  const [bulkSweeping, setBulkSweeping] = useState(false);
  const [coldSweeping, setColdSweeping] = useState(false);
  const [sweepingAddressId, setSweepingAddressId] = useState<string | null>(null);
  const [retryingJobId, setRetryingJobId] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Single queue item action states
  const [processingQueueId, setProcessingQueueId] = useState<string | null>(null);

  const fetchQueueData = async (network: string) => {
    try {
      setQueueLoading(true);
      const res = await fetch(`/api/v1/admin/treasury/sweep-queue?network=${network}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSweepQueueItems(data.data || []);
        }
      }
    } catch (err) {
      console.error('[TreasuryView] Failed to load sweep queue:', err);
    } finally {
      setQueueLoading(false);
    }
  };

  const fetchTreasuryData = async (network: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/v1/admin/treasury/${network}`);
      if (!res.ok) {
        throw new Error(`Failed to load treasury data: Status ${res.status}`);
      }
      const data = await res.json();
      if (data.success && data.data) {
        const payload = data.data;
        setConfig(payload.config);
        setLiveHotBalance(payload.liveHotBalance || '0.00000000');
        setLiveColdBalance(payload.liveColdBalance || '0.00000000');
        setTotalPendingSweep(payload.totalPendingSweep || '0.00000000');
        setDepositAddresses(payload.depositAddresses || []);
        setJobs(payload.jobs || []);

        // Sync inputs
        setSweepMode(payload.config.sweepMode || 'AUTOMATIC');
        setSweepDelay(payload.config.sweepDelay || 'IMMEDIATE');
        setCustomDelayMinutes(payload.config.customDelayMinutes || 0);
        setAutoSweepThreshold(payload.config.autoSweepThreshold || '1.00000000');
        setPaused(payload.config.paused || false);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshAll = async () => {
    await Promise.all([
      fetchTreasuryData(selectedNetwork),
      fetchQueueData(selectedNetwork)
    ]);
  };

  useEffect(() => {
    refreshAll();
    setSelectedQueueIds([]);
  }, [selectedNetwork]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const showFeedback = (successMsg: string | null, errorMsg: string | null) => {
    if (successMsg) {
      setActionSuccess(successMsg);
      setTimeout(() => setActionSuccess(null), 5000);
    }
    if (errorMsg) {
      setActionError(errorMsg);
      setTimeout(() => setActionError(null), 5000);
    }
  };

  // 1. Update Comprehensive Sweep Rules
  const handleSaveConfig = async () => {
    try {
      setSavingConfig(true);
      const res = await fetch('/api/v1/admin/treasury/sweep-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          network: selectedNetwork,
          sweepMode,
          sweepDelay,
          customDelayMinutes: Number(customDelayMinutes),
          autoSweepThreshold,
          paused,
        }),
      });

      const body = await res.json();
      if (!res.ok) throw new Error(body.message || 'Failed to save sweep rules.');

      showFeedback('Sweep rules and configuration updated successfully!', null);
      refreshAll();
    } catch (err: any) {
      showFeedback(null, err.message);
    } finally {
      setSavingConfig(false);
    }
  };

  // 2. Pause / Resume Toggle
  const handlePauseToggle = async (targetPaused: boolean) => {
    try {
      setSavingConfig(true);
      const res = await fetch('/api/v1/admin/treasury/sweep-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          network: selectedNetwork,
          paused: targetPaused,
        }),
      });

      const body = await res.json();
      if (!res.ok) throw new Error(body.message || 'Failed to toggle paused state.');

      setPaused(targetPaused);
      showFeedback(targetPaused ? 'Sweeps successfully paused!' : 'Sweeps successfully resumed!', null);
      refreshAll();
    } catch (err: any) {
      showFeedback(null, err.message);
    } finally {
      setSavingConfig(false);
    }
  };

  // 3. Manual Single User Address Sweep
  const handleSweepAddress = async (addressId: string) => {
    try {
      setSweepingAddressId(addressId);
      const res = await fetch('/api/v1/admin/treasury/sweep/address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addressId }),
      });

      const body = await res.json();
      if (!res.ok) throw new Error(body.message || 'Address sweep failed.');

      showFeedback(`Address sweep successfully executed! TxHash: ${body.data.txHash}`, null);
      refreshAll();
    } catch (err: any) {
      showFeedback(null, err.message);
    } finally {
      setSweepingAddressId(null);
    }
  };

  // 4. Manual Bulk Sweep
  const handleBulkSweep = async () => {
    if (!window.confirm('Are you sure you want to sweep ALL user deposit addresses with a positive balance to the Hot Wallet?')) {
      return;
    }
    try {
      setBulkSweeping(true);
      const res = await fetch('/api/v1/admin/treasury/sweep/all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ network: selectedNetwork }),
      });

      const body = await res.json();
      if (!res.ok) throw new Error(body.message || 'Bulk sweep failed.');

      const runCount = body.data?.results?.length || 0;
      showFeedback(`Bulk sweep run completed. Triggered ${runCount} sweep transaction(s).`, null);
      refreshAll();
    } catch (err: any) {
      showFeedback(null, err.message);
    } finally {
      setBulkSweeping(false);
    }
  };

  // 5. Hot to Cold Wallet Transfer
  const handleSweepHotToCold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sweepToColdAmount || parseFloat(sweepToColdAmount) <= 0) {
      alert('Please specify a positive numeric transfer amount.');
      return;
    }
    try {
      setColdSweeping(true);
      const res = await fetch('/api/v1/admin/treasury/sweep/hot-to-cold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          network: selectedNetwork,
          amount: parseFloat(sweepToColdAmount).toFixed(8),
        }),
      });

      const body = await res.json();
      if (!res.ok) throw new Error(body.message || 'Transfer to Cold Wallet failed.');

      showFeedback(`Successfully transferred ${sweepToColdAmount} USDT to Cold Storage! TxHash: ${body.data.txHash}`, null);
      setSweepToColdAmount('');
      refreshAll();
    } catch (err: any) {
      showFeedback(null, err.message);
    } finally {
      setColdSweeping(false);
    }
  };

  // 6. Retry Failed Sweep Job
  const handleRetryJob = async (jobId: string) => {
    try {
      setRetryingJobId(jobId);
      const res = await fetch('/api/v1/admin/treasury/sweep/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });

      const body = await res.json();
      if (!res.ok) throw new Error(body.message || 'Failed to retry sweep job.');

      showFeedback(`Sweep job retried successfully! TxHash: ${body.data.txHash}`, null);
      refreshAll();
    } catch (err: any) {
      showFeedback(null, err.message);
    } finally {
      setRetryingJobId(null);
    }
  };

  // 7. Single Sweep Queue: Fund Gas
  const handleQueueFundGas = async (itemId: string) => {
    try {
      setProcessingQueueId(itemId);
      const res = await fetch('/api/v1/admin/treasury/sweep-queue/fund-gas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || 'Gas funding failed.');

      showFeedback(`Gas funding sent successfully! TxHash: ${body.data.txHash}`, null);
      refreshAll();
    } catch (err: any) {
      showFeedback(null, err.message);
    } finally {
      setProcessingQueueId(null);
    }
  };

  // 8. Single Sweep Queue: Execute Sweep
  const handleQueueSweep = async (itemId: string) => {
    try {
      setProcessingQueueId(itemId);
      const res = await fetch('/api/v1/admin/treasury/sweep-queue/sweep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || 'Sweep execution failed.');

      showFeedback(`Sweep transaction successfully broadcasted! TxHash: ${body.data.txHash}`, null);
      refreshAll();
    } catch (err: any) {
      showFeedback(null, err.message);
    } finally {
      setProcessingQueueId(null);
    }
  };

  // 9. Single Sweep Queue: Cancel Item
  const handleQueueCancel = async (itemId: string) => {
    if (!window.confirm('Are you sure you want to cancel this sweep job? It will be permanently shelved.')) {
      return;
    }
    try {
      setProcessingQueueId(itemId);
      const res = await fetch('/api/v1/admin/treasury/sweep-queue/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || 'Failed to cancel item.');

      showFeedback('Sweep job successfully shelved/cancelled.', null);
      refreshAll();
    } catch (err: any) {
      showFeedback(null, err.message);
    } finally {
      setProcessingQueueId(null);
    }
  };

  // 10. Bulk Queue Action
  const handleBulkQueueAction = async (action: 'FUND_GAS' | 'SWEEP' | 'FUND_AND_SWEEP') => {
    if (selectedQueueIds.length === 0) return;
    try {
      setBulkProcessing(true);
      const res = await fetch('/api/v1/admin/treasury/sweep-queue/bulk-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemIds: selectedQueueIds, action }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || 'Bulk execution failed.');

      showFeedback(`Bulk action completed! Verified: ${body.data?.results?.length || 0} transaction(s).`, null);
      setSelectedQueueIds([]);
      refreshAll();
    } catch (err: any) {
      showFeedback(null, err.message);
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleSelectAllQueue = () => {
    const activeIds = sweepQueueItems
      .filter(item => item.status !== 'COMPLETED' && item.status !== 'CANCELLED')
      .map(item => item.id);

    if (selectedQueueIds.length === activeIds.length) {
      setSelectedQueueIds([]);
    } else {
      setSelectedQueueIds(activeIds);
    }
  };

  const handleSelectQueueItem = (id: string) => {
    if (selectedQueueIds.includes(id)) {
      setSelectedQueueIds(selectedQueueIds.filter(i => i !== id));
    } else {
      setSelectedQueueIds([...selectedQueueIds, id]);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Vault className="w-5 h-5 text-amber-500" />
            Treasury Sweep Management
          </h2>
          <p className={`text-xs mt-1 ${t.textSub}`}>
            Secure Hot/Cold wallet balances, customizable delays, manual overrides, and real-time gas status queues.
          </p>
        </div>
        <div className="flex gap-2">
          {paused ? (
            <button
              onClick={() => handlePauseToggle(false)}
              disabled={savingConfig}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 disabled:opacity-55"
            >
              <Play className="w-3.5 h-3.5" />
              Resume Auto Sweeping
            </button>
          ) : (
            <button
              onClick={() => handlePauseToggle(true)}
              disabled={savingConfig}
              className="bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 disabled:opacity-55"
            >
              <Pause className="w-3.5 h-3.5" />
              Pause Sweeps
            </button>
          )}
          <button
            onClick={refreshAll}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
              isDark ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
            disabled={loading}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Network Tabs Selector */}
      <div className="flex border-b border-gray-200/20 gap-2">
        {networks.map((net) => (
          <button
            key={net}
            onClick={() => setSelectedNetwork(net)}
            className={`px-4 py-2 text-xs font-semibold tracking-wide border-b-2 transition-all ${
              selectedNetwork === net
                ? 'border-blue-500 text-blue-500 font-bold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            {net.replace('USDT_', '')} Network
          </button>
        ))}
      </div>

      {/* Operation Feedback Toast */}
      {actionSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-lg text-xs flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}
      {actionError && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-lg text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {loading && !config ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
          <p className="text-xs text-gray-400">Querying on-chain balances and loading treasury logs...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-lg text-xs">
          <p className="font-semibold">Failed to fetch Treasury data for {selectedNetwork}:</p>
          <p className="mt-1">{error}</p>
        </div>
      ) : (
        <>
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: 'Hot Wallet Balance',
                value: `${parseFloat(liveHotBalance).toFixed(4)} USDT`,
                desc: 'Operates automated user withdrawals',
                address: config?.hotAddress || '',
                label: 'hot'
              },
              {
                title: 'Cold Storage Balance',
                value: `${parseFloat(liveColdBalance).toFixed(4)} USDT`,
                desc: 'Deep institutional cold security',
                address: config?.coldAddress || '',
                label: 'cold'
              },
              {
                title: 'Awaiting Sweep',
                value: `${parseFloat(totalPendingSweep).toFixed(4)} USDT`,
                desc: 'On-chain user deposit balance',
                descColor: 'text-amber-500'
              },
              {
                title: 'Total Network Pool',
                value: `${(parseFloat(liveHotBalance) + parseFloat(liveColdBalance) + parseFloat(totalPendingSweep)).toFixed(4)} USDT`,
                desc: 'Hot + Cold + Pending Sweep combined',
                descColor: 'text-blue-500'
              }
            ].map((metric) => (
              <Card key={metric.title} className="p-4 flex flex-col justify-between min-h-[110px] relative border-slate-800">
                <div>
                  <span className={`text-[9px] font-mono font-bold tracking-wider ${t.textMuted} uppercase`}>
                    {metric.title}
                  </span>
                  <div className={`text-lg font-extrabold font-display leading-tight mt-1.5`}>
                    {metric.value}
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-gray-400 font-medium">
                  {metric.desc}
                  {metric.address && (
                    <div className="flex items-center gap-1 mt-1 font-mono text-[9px] text-gray-500 bg-slate-900/50 p-1 rounded border border-slate-800">
                      <span className="truncate max-w-[120px]">{metric.address}</span>
                      <button
                        onClick={() => handleCopy(metric.address, metric.label)}
                        className="text-blue-400 hover:text-blue-300 ml-auto shrink-0"
                      >
                        {copiedText === metric.label ? 'Copied' : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Operational & Controls Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Configuration Panel */}
            <Card className="p-5 flex flex-col justify-between border-slate-800">
              <div>
                <h3 className="text-xs font-bold font-mono tracking-widest text-blue-400 uppercase flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  Sweep Rules & Configuration
                </h3>
                <p className="text-[11px] text-gray-400 mt-1">
                  Adjust target configurations for on-chain sweeping, gas handling, and execution delays.
                </p>

                <div className="mt-5 space-y-4">
                  {/* Sweep Mode */}
                  <div>
                    <label className="text-xs font-semibold block mb-1">Sweep Mode</label>
                    <select
                      value={sweepMode}
                      onChange={(e: any) => setSweepMode(e.target.value)}
                      className={`px-3 py-1.5 rounded text-xs w-full border ${
                        isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-gray-50 border-gray-200 text-gray-900'
                      }`}
                    >
                      <option value="AUTOMATIC">Automatic (Autonomous sweeping and gas funding)</option>
                      <option value="MANUAL">Manual (All sweeps wait for admin trigger)</option>
                      <option value="HYBRID">Hybrid (Delay timer auto sweeps; otherwise manual)</option>
                    </select>
                  </div>

                  {/* Delay Config */}
                  {sweepMode !== 'MANUAL' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold block mb-1">Delay Setting</label>
                        <select
                          value={sweepDelay}
                          onChange={(e) => setSweepDelay(e.target.value)}
                          className={`px-3 py-1.5 rounded text-xs w-full border ${
                            isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-gray-50 border-gray-200 text-gray-900'
                          }`}
                        >
                          <option value="IMMEDIATE">Immediate</option>
                          <option value="1_HOUR">1 Hour</option>
                          <option value="6_HOURS">6 Hours</option>
                          <option value="24_HOURS">24 Hours</option>
                          <option value="3_DAYS">3 Days</option>
                          <option value="7_DAYS">7 Days</option>
                          <option value="CUSTOM">Custom Minutes</option>
                          <option value="MANUAL_ONLY">Manual Only</option>
                        </select>
                      </div>

                      {sweepDelay === 'CUSTOM' && (
                        <div>
                          <label className="text-xs font-semibold block mb-1">Minutes</label>
                          <input
                            type="number"
                            min="1"
                            value={customDelayMinutes}
                            onChange={(e) => setCustomDelayMinutes(Number(e.target.value))}
                            className={`px-3 py-1.5 rounded text-xs font-mono w-full border ${
                              isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-gray-50 border-gray-200 text-gray-900'
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Threshold & Save */}
                  <div>
                    <label className="text-xs font-semibold block mb-1">
                      Minimum Sweep Threshold (USDT)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.1"
                        value={autoSweepThreshold}
                        onChange={(e) => setAutoSweepThreshold(e.target.value)}
                        className={`px-3 py-1.5 rounded text-xs font-mono w-full border ${
                          isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-gray-50 border-gray-200 text-gray-900'
                        }`}
                        placeholder="e.g. 1.00"
                      />
                      <button
                        onClick={handleSaveConfig}
                        disabled={savingConfig}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded text-xs font-semibold shrink-0 disabled:opacity-50"
                      >
                        {savingConfig ? 'Saving...' : 'Save Config'}
                      </button>
                    </div>
                    <span className="text-[9px] text-gray-500 mt-1 block">
                      Requires at least 0.00000001 precision. Deposits below this are logged but never auto-funded or swept.
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200/10 pt-4 mt-5">
                <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                  <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>
                    Current blockchain: <strong className="text-white">{selectedNetwork.replace('USDT_', '')}</strong>. Rules execute in-memory inside SweepQueueProcessor.
                  </span>
                </div>
              </div>
            </Card>

            {/* Right: Sweeps & Transfers Trigger Panel */}
            <Card className="p-5 flex flex-col justify-between border-slate-800">
              <div>
                <h3 className="text-xs font-bold font-mono tracking-widest text-amber-500 uppercase flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  Manual Operations Console
                </h3>
                <p className="text-[11px] text-gray-400 mt-1">
                  Trigger manual overrides, bulk sweeps, or safely offload hot wallet liquidity to your cold storage.
                </p>

                <div className="mt-5 space-y-5">
                  {/* Bulk User Sweep Action */}
                  <div className="border border-slate-800 p-3 rounded bg-slate-900/40">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-xs font-semibold block text-slate-200">Force Sweep All Addresses</span>
                        <span className="text-[10px] text-gray-400 mt-0.5 block">
                          Triggers manual sweep operations for all registered addresses that currently hold a positive balance.
                        </span>
                      </div>
                      <button
                        onClick={handleBulkSweep}
                        disabled={bulkSweeping || parseFloat(totalPendingSweep) <= 0}
                        className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded text-xs font-semibold shrink-0 disabled:opacity-40"
                      >
                        {bulkSweeping ? 'Sweeping...' : 'Sweep All Now'}
                      </button>
                    </div>
                  </div>

                  {/* Sweep Hot to Cold form */}
                  <form onSubmit={handleSweepHotToCold} className="border border-slate-800 p-3 rounded bg-slate-900/40">
                    <span className="text-xs font-semibold block text-slate-200">Vault Transfer (Hot → Cold)</span>
                    <span className="text-[10px] text-gray-400 mt-0.5 block mb-2">
                      Transfer excess liquidity from Hot Wallet to cold storage securely.
                    </span>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.0001"
                        value={sweepToColdAmount}
                        onChange={(e) => setSweepToColdAmount(e.target.value)}
                        className={`px-3 py-1.5 rounded text-xs font-mono w-full border ${
                          isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-gray-50 border-gray-200 text-gray-900'
                        }`}
                        placeholder="Amount in USDT"
                        required
                      />
                      <button
                        type="submit"
                        disabled={coldSweeping || parseFloat(liveHotBalance) <= 0}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded text-xs font-semibold shrink-0 disabled:opacity-40 flex items-center gap-1"
                      >
                        {coldSweeping ? 'Transferring...' : 'Transfer to Cold'}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <div className="border-t border-gray-200/10 pt-4 mt-5">
                <span className="text-[9px] text-gray-500 font-mono block text-center uppercase tracking-wider">
                  SECURE CRYPTOGRAPHIC PROTOCOLS • IDEMPOTENT BLOCKCHAIN SWEEPS
                </span>
              </div>
            </Card>
          </div>

          {/* SWEEP QUEUE STATE MACHINE DASHBOARD */}
          <Card className="p-0 overflow-hidden border-slate-800">
            <div className="p-4 border-b border-gray-200/10 bg-slate-900/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-xs font-bold font-mono tracking-wider uppercase flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-emerald-400" />
                  Gas & Sweep Processing Queue (State Machine)
                </h3>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Active state tracking for deposit sweeps, live gas balances, and transaction dispatch pipelines.
                </p>
              </div>

              {selectedQueueIds.length > 0 && (
                <div className="flex items-center gap-2 bg-blue-950/40 border border-blue-800 px-2 py-1 rounded">
                  <span className="text-[10px] font-mono text-blue-300 font-bold">
                    {selectedQueueIds.length} Selected
                  </span>
                  <button
                    onClick={() => handleBulkQueueAction('FUND_GAS')}
                    disabled={bulkProcessing}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded text-[9px] font-bold disabled:opacity-50"
                  >
                    Bulk Fund Gas
                  </button>
                  <button
                    onClick={() => handleBulkQueueAction('SWEEP')}
                    disabled={bulkProcessing}
                    className="bg-amber-600 hover:bg-amber-500 text-white px-2 py-1 rounded text-[9px] font-bold disabled:opacity-50"
                  >
                    Bulk Sweep
                  </button>
                  <button
                    onClick={() => handleBulkQueueAction('FUND_AND_SWEEP')}
                    disabled={bulkProcessing}
                    className="bg-purple-600 hover:bg-purple-500 text-white px-2 py-1 rounded text-[9px] font-bold disabled:opacity-50"
                  >
                    Bulk Fund & Sweep
                  </button>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/20 text-[10px] font-mono tracking-wider uppercase text-gray-400 border-b border-gray-200/10">
                    <th className="py-2.5 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={selectedQueueIds.length > 0 && selectedQueueIds.length === sweepQueueItems.filter(i => i.status !== 'COMPLETED' && i.status !== 'CANCELLED').length}
                        onChange={handleSelectAllQueue}
                        className="rounded border-slate-800"
                      />
                    </th>
                    <th className="py-2.5 px-4">User & Deposit ID</th>
                    <th className="py-2.5 px-4">Address</th>
                    <th className="py-2.5 px-4 text-right">USDT Amount</th>
                    <th className="py-2.5 px-4">Sweep Status</th>
                    <th className="py-2.5 px-4">Native Gas Balance</th>
                    <th className="py-2.5 px-4 text-center">Override Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/10 text-xs font-mono">
                  {sweepQueueItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-500 text-xs">
                        No active items in the processing queue for this network.
                      </td>
                    </tr>
                  ) : (
                    sweepQueueItems.map((item) => {
                      const isFinished = item.status === 'COMPLETED' || item.status === 'CANCELLED';
                      const isSelected = selectedQueueIds.includes(item.id);
                      return (
                        <tr key={item.id} className="hover:bg-slate-900/10">
                          <td className="py-2.5 px-4">
                            {!isFinished ? (
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleSelectQueueItem(item.id)}
                                className="rounded border-slate-800"
                              />
                            ) : (
                              <span className="text-gray-600">—</span>
                            )}
                          </td>
                          <td className="py-2.5 px-4">
                            <div className="flex flex-col">
                              <span className="text-[11px] font-semibold text-slate-200 truncate max-w-[140px]" title={item.userEmail}>
                                {item.userEmail}
                              </span>
                              <span className="text-[9px] text-gray-500">
                                Dep: {item.depositId.slice(0, 8)}...
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5 px-4 text-gray-400">
                            <div className="flex items-center gap-1">
                              <span className="text-[11px]">{item.depositAddress.slice(0, 8)}...{item.depositAddress.slice(-8)}</span>
                              <button
                                onClick={() => handleCopy(item.depositAddress, item.id + '_addr')}
                                className="text-gray-500 hover:text-gray-300"
                              >
                                {copiedText === item.id + '_addr' ? 'Copied' : <Copy className="w-3 h-3" />}
                              </button>
                            </div>
                          </td>
                          <td className="py-2.5 px-4 text-right font-bold text-slate-100">
                            {parseFloat(item.amount).toFixed(4)} USDT
                          </td>
                          <td className="py-2.5 px-4">
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold leading-none ${
                              item.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              item.status === 'READY_TO_SWEEP' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse' :
                              item.status === 'SWEEPING' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 animate-pulse' :
                              item.status === 'GAS_FUNDING' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 animate-pulse' :
                              item.status === 'WAITING_GAS' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                              item.status === 'WAITING_DELAY' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 animate-pulse' :
                              item.status === 'FAILED' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                              item.status === 'CANCELLED' ? 'bg-slate-500/10 text-slate-400 border border-slate-500/20' :
                              'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-4">
                            <div className="flex flex-col">
                              <span className="text-[11px] text-slate-300">
                                {parseFloat(item.nativeGasBalance || '0.00000000').toFixed(6)} {item.network === 'USDT_BEP20' ? 'BNB' : item.network === 'USDT_POLYGON' ? 'POL' : 'TRX'}
                              </span>
                              <span className={`text-[9px] font-semibold ${
                                item.gasStatus === 'OK' ? 'text-emerald-500' :
                                item.gasStatus === 'FUNDING_SENT' ? 'text-blue-500 animate-pulse' :
                                item.gasStatus === 'LOW' ? 'text-amber-500' : 'text-rose-500'
                              }`}>
                                Gas status: {item.gasStatus}
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            {!isFinished ? (
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => handleQueueFundGas(item.id)}
                                  disabled={processingQueueId === item.id || item.status === 'READY_TO_SWEEP' || item.status === 'SWEEPING'}
                                  className="text-[9px] px-1.5 py-0.5 rounded bg-blue-600/10 border border-blue-600/30 text-blue-400 hover:bg-blue-600/20 transition-colors disabled:opacity-40"
                                >
                                  Fund Gas
                                </button>
                                <button
                                  onClick={() => handleQueueSweep(item.id)}
                                  disabled={processingQueueId === item.id || item.status === 'SWEEPING'}
                                  className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-600/10 border border-emerald-600/30 text-emerald-400 hover:bg-emerald-600/20 transition-colors disabled:opacity-40"
                                >
                                  Sweep
                                </button>
                                <button
                                  onClick={() => handleQueueCancel(item.id)}
                                  disabled={processingQueueId === item.id}
                                  className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700 transition-colors disabled:opacity-40"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : item.status === 'COMPLETED' ? (
                              <div className="flex flex-col items-center justify-center">
                                <span className="text-[9px] text-gray-500">Completed</span>
                                {item.sweepTxHash && (
                                  <div className="flex items-center gap-1 mt-0.5">
                                    <span className="text-[8px] text-gray-400 max-w-[60px] truncate">{item.sweepTxHash}</span>
                                    <button
                                      onClick={() => handleCopy(item.sweepTxHash!, item.id + '_tx')}
                                      className="text-gray-500 hover:text-gray-300"
                                    >
                                      {copiedText === item.id + '_tx' ? 'Copied' : <Copy className="w-2.5 h-2.5" />}
                                    </button>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-600">Shelved</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* User Deposit Addresses Section */}
          <Card className="p-0 overflow-hidden border-slate-800">
            <div className="p-4 border-b border-gray-200/10 bg-slate-900/40 flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold font-mono tracking-wider uppercase">User Permanent Deposit Addresses</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">Real-time on-chain funds currently resting on permanent deposit addresses.</p>
              </div>
              <Badge color={depositAddresses.length > 0 ? 'emerald' : 'amber'}>
                {depositAddresses.length} Addresses Registered
              </Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/20 text-[10px] font-mono tracking-wider uppercase text-gray-400 border-b border-gray-200/10">
                    <th className="py-2.5 px-4">User Ref</th>
                    <th className="py-2.5 px-4">Deposit Address</th>
                    <th className="py-2.5 px-4 text-right">Balance Rest (On-Chain)</th>
                    <th className="py-2.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/10 text-xs font-mono">
                  {depositAddresses.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-500 text-xs">
                        No permanent deposit addresses registered yet for this network.
                      </td>
                    </tr>
                  ) : (
                    depositAddresses.map((addr) => {
                      const balFloat = parseFloat(addr.onChainBalance);
                      return (
                        <tr key={addr.id} className="hover:bg-slate-900/10">
                          <td className="py-2.5 px-4 text-gray-300 font-medium">
                            <span className="flex items-center gap-1.5">
                              <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                              <span className="text-[11px]">{addr.userId.slice(0, 8)}...</span>
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-gray-400">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px]">{addr.address}</span>
                              <button
                                onClick={() => handleCopy(addr.address, addr.id)}
                                className="text-gray-500 hover:text-gray-300"
                              >
                                {copiedText === addr.id ? 'Copied' : <Copy className="w-3 h-3" />}
                              </button>
                            </div>
                          </td>
                          <td className={`py-2.5 px-4 text-right font-bold text-slate-100`}>
                            {balFloat.toFixed(4)} USDT
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <button
                              onClick={() => handleSweepAddress(addr.id)}
                              disabled={balFloat <= 0 || sweepingAddressId === addr.id}
                              className={`text-[10px] px-2.5 py-1 rounded transition-colors font-medium cursor-pointer ${
                                balFloat <= 0
                                  ? 'bg-slate-900/60 text-gray-600 border border-transparent'
                                  : 'bg-amber-600/20 border border-amber-600/40 text-amber-300 hover:bg-amber-600/30'
                              }`}
                            >
                              {sweepingAddressId === addr.id ? 'Sweeping...' : 'Sweep Address'}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Sweep History & Job Logs */}
          <Card className="p-0 overflow-hidden border-slate-800">
            <div className="p-4 border-b border-gray-200/10 bg-slate-900/40 flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold font-mono tracking-wider uppercase flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-400" />
                  Historical Sweep Audit Logs (Idempotent Jobs)
                </h3>
                <p className="text-[10px] text-gray-400 mt-0.5">Full cryptographic ledger records of previous and pending sweep transfers.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/20 text-[10px] font-mono tracking-wider uppercase text-gray-400 border-b border-gray-200/10">
                    <th className="py-2.5 px-4">Job ID</th>
                    <th className="py-2.5 px-4">Operation</th>
                    <th className="py-2.5 px-4">Amount</th>
                    <th className="py-2.5 px-4">Source → Destination</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Tx Hash / Error</th>
                    <th className="py-2.5 px-4 text-center">Trigger</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/10 text-xs font-mono">
                  {jobs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-500 text-xs">
                        No sweep jobs processed for this network yet.
                      </td>
                    </tr>
                  ) : (
                    jobs.map((job) => (
                      <tr key={job.id} className="hover:bg-slate-900/10">
                        <td className="py-3 px-4 text-gray-400 text-[10px] font-bold">
                          {job.id.slice(0, 8)}...
                        </td>
                        <td className="py-3 px-4">
                          <Badge color={job.sweepType === 'USER_TO_HOT' ? 'blue' : 'purple'}>
                            {job.sweepType === 'USER_TO_HOT' ? 'USER → HOT' : 'HOT → COLD'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-slate-100 font-bold">
                          {parseFloat(job.amount).toFixed(4)} USDT
                        </td>
                        <td className="py-3 px-4 text-gray-400">
                          <div className="flex items-center gap-1 text-[10px]">
                            <span className="truncate max-w-[80px]" title={job.sourceAddress}>{job.sourceAddress}</span>
                            <ChevronRight className="w-3 h-3 text-gray-600" />
                            <span className="truncate max-w-[80px]" title={job.destinationAddress}>{job.destinationAddress}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold leading-none ${
                            job.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            job.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse' :
                            job.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {job.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 max-w-[200px] truncate text-[11px]">
                          {job.status === 'COMPLETED' ? (
                            <div className="flex items-center gap-1">
                              <span className="text-gray-400 truncate">{job.txHash}</span>
                              <button
                                onClick={() => handleCopy(job.txHash || '', job.id)}
                                className="text-gray-500 hover:text-gray-300 shrink-0"
                              >
                                {copiedText === job.id ? 'Copied' : <Copy className="w-3 h-3" />}
                              </button>
                            </div>
                          ) : job.errorMessage ? (
                            <span className="text-rose-400 font-medium" title={job.errorMessage}>
                              {job.errorMessage}
                            </span>
                          ) : (
                            <span className="text-gray-500">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {job.status === 'FAILED' ? (
                            <button
                              onClick={() => handleRetryJob(job.id)}
                              disabled={retryingJobId === job.id}
                              className="text-[10px] px-2 py-0.5 rounded bg-blue-600/10 border border-blue-600/30 text-blue-400 hover:bg-blue-600/20 transition-colors cursor-pointer"
                            >
                              {retryingJobId === job.id ? 'Retrying...' : 'Retry Job'}
                            </button>
                          ) : (
                            <span className="text-gray-600">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};
export default TreasuryView;
