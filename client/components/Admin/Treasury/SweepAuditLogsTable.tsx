/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FileText, ChevronRight, Copy } from 'lucide-react';
import { Card, Badge } from '../../ui/index.ts';
import { SweepJob, TreasuryComponentProps } from './TreasuryTypes.ts';

interface SweepAuditLogsTableProps extends TreasuryComponentProps {
  jobs: SweepJob[];
  handleRetryJob: (id: string) => void;
  retryingJobId: string | null;
}

export const SweepAuditLogsTable: React.FC<SweepAuditLogsTableProps> = ({
  jobs,
  handleRetryJob,
  retryingJobId,
}) => {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <Card className="p-0 overflow-hidden border-slate-800">
      <div className="p-4 border-b border-gray-200/10 bg-slate-900/40 flex justify-between items-center">
        <div>
          <h3 className="text-xs font-bold font-mono tracking-wider uppercase flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-blue-400" />
            Historical Sweep Audit Logs (Idempotent Jobs)
          </h3>
          <p className="text-[10px] text-gray-400 mt-0.5">
            Full cryptographic ledger records of previous and pending sweep transfers.
          </p>
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
                      <span className="truncate max-w-[80px]" title={job.sourceAddress}>
                        {job.sourceAddress}
                      </span>
                      <ChevronRight className="w-3 h-3 text-gray-600" />
                      <span className="truncate max-w-[80px]" title={job.destinationAddress}>
                        {job.destinationAddress}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold leading-none ${
                        job.status === 'COMPLETED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : job.status === 'IN_PROGRESS'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse'
                          : job.status === 'PENDING'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
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
  );
};
