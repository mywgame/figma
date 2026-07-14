/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TrendingUp, Award, DollarSign, ArrowUpRight, Cpu, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Card, TableContainer } from '../ui/Cards/index.tsx';
import { Button } from '../ui/Buttons/index.tsx';
import { Input } from '../ui/Inputs/index.tsx';

interface IncomeViewProps {
  platformBalance: string;
  onAuditLog: (action: string, module: 'SYSTEM_CONFIG' | 'SETTLEMENT') => void;
}

export const IncomeView: React.FC<IncomeViewProps> = ({ platformBalance, onAuditLog }) => {
  const [baseYieldRate, setBaseYieldRate] = useState('8.5');
  const [compounding, setCompounding] = useState(false);
  const [compoundingSuccess, setCompoundingSuccess] = useState(false);

  const handleCompoundYield = () => {
    setCompounding(true);
    setCompoundingSuccess(false);

    setTimeout(() => {
      setCompounding(false);
      setCompoundingSuccess(true);
      onAuditLog(`Triggered overnight compounding interest yield processing at base rate of ${baseYieldRate}%`, 'SETTLEMENT');
      setTimeout(() => setCompoundingSuccess(false), 3000);
    }, 1200);
  };

  const yieldLogs = [
    { id: 'YLD-81203', baseRate: '8.50%', totalCompounded: '$124,510.45', timestamp: '2026-06-28 00:00:15 UTC', status: 'Success' },
    { id: 'YLD-81192', baseRate: '8.50%', totalCompounded: '$123,892.12', timestamp: '2026-06-27 00:00:20 UTC', status: 'Success' },
    { id: 'YLD-81181', baseRate: '8.40%', totalCompounded: '$121,902.18', timestamp: '2026-06-26 00:00:08 UTC', status: 'Success' },
  ];

  return (
    <div className="space-y-6 text-left max-w-4xl">
      
      {/* Overview statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">ASSETS UNDER MANAGEMENT</span>
            <DollarSign className="text-blue-500 w-4 h-4" />
          </div>
          <h3 className="font-display font-extrabold text-gray-950 text-xl">{platformBalance}</h3>
          <p className="text-[10px] font-mono text-gray-400">LIQUID POOLS BALANCE</p>
        </Card>

        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">BASE APY RATE</span>
            <TrendingUp className="text-emerald-500 w-4 h-4" />
          </div>
          <h3 className="font-display font-extrabold text-gray-950 text-xl">{baseYieldRate}% APY</h3>
          <p className="text-[10px] font-mono text-emerald-600 font-bold">SYSTEM ACTIVE</p>
        </Card>

        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">DAILY COMMITTED PAYOUTS</span>
            <Award className="text-purple-500 w-4 h-4" />
          </div>
          <h3 className="font-display font-extrabold text-gray-950 text-xl">~$124.5k USD</h3>
          <p className="text-[10px] font-mono text-gray-400">AVERAGE HISTORIC SLIPPAGE</p>
        </Card>

      </div>

      {/* Manual Processing form */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        
        <div className="md:col-span-5 bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-display font-black text-gray-950 uppercase tracking-tight">
                Interest Accrual Processor
              </h3>
              <p className="text-[10px] text-gray-400 font-mono block mt-0.5">
                EXECUTE CRON OVERNIGHT COMPOUNDING
              </p>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed font-sans">
              Compounding calculates active balances against VIP multiplier configurations, posting individual sub-ledger entries and updating client wallets securely.
            </p>

            <Input
              label="Standard Base APY Rate (%)"
              type="number"
              step="0.1"
              value={baseYieldRate}
              onChange={(e) => setBaseYieldRate(e.target.value)}
              required
            />
          </div>

          <div className="pt-2">
            {compoundingSuccess && (
              <span className="text-xs font-bold text-emerald-600 font-mono flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-xl mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Ledger compounded successfully!
              </span>
            )}
            <Button
              onClick={handleCompoundYield}
              isLoading={compounding}
              className="w-full text-xs font-bold py-3 rounded-2xl"
              leftIcon={<Cpu className="w-3.5 h-3.5" />}
            >
              Simulate Nightly Yield Release
            </Button>
          </div>
        </div>

        <div className="md:col-span-7 bg-white border border-gray-100 p-5 rounded-2xl shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-display font-black text-gray-950 uppercase tracking-tight">
              Interest Accrual Log
            </h3>
            <p className="text-[10px] text-gray-400 font-mono block mt-0.5">
              COMPLETED YIELD DISTRIBUTION EVENTS
            </p>
          </div>

          <TableContainer>
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="py-2.5 px-4 font-bold text-gray-400 font-mono text-[9px] uppercase">ID</th>
                  <th className="py-2.5 px-4 font-bold text-gray-400 font-mono text-[9px] uppercase">Rate</th>
                  <th className="py-2.5 px-4 font-bold text-gray-400 font-mono text-[9px] uppercase text-right">Value Distributed</th>
                  <th className="py-2.5 px-4 font-bold text-gray-400 font-mono text-[9px] uppercase">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {yieldLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-bold text-gray-900">{log.id}</td>
                    <td className="py-2.5 px-4 font-mono font-semibold text-gray-600">{log.baseRate}</td>
                    <td className="py-2.5 px-4 font-display font-bold text-emerald-600 text-right">{log.totalCompounded}</td>
                    <td className="py-2.5 px-4 text-gray-400 font-mono text-[10px]">{log.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableContainer>
        </div>

      </div>

    </div>
  );
};
