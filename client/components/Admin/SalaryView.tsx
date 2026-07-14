/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Coins, CheckCircle2, DollarSign, Send, ShieldCheck } from 'lucide-react';
import { Card, TableContainer } from '../ui/Cards/index.tsx';
import { Button } from '../ui/Buttons/index.tsx';

interface SalaryViewProps {
  onAuditLog: (action: string, module: 'SYSTEM_CONFIG' | 'SETTLEMENT') => void;
}

export const SalaryView: React.FC<SalaryViewProps> = ({ onAuditLog }) => {
  const [clearing, setClearing] = useState(false);
  const [clearingSuccess, setClearingSuccess] = useState(false);

  const handleClearPayroll = () => {
    setClearing(true);
    setClearingSuccess(false);

    setTimeout(() => {
      setClearing(false);
      setClearingSuccess(true);
      onAuditLog('Dispatched monthly staff payroll payouts totaling $245,500.00 USD across authorized whitelisted addresses', 'SETTLEMENT');
      setTimeout(() => setClearingSuccess(false), 3000);
    }, 1200);
  };

  const staffList = [
    { name: 'Dr. Michael Chen', role: 'Head of Quantitative Systems', address: '0x819a...32fe', monthlySalary: '$45,000.00', status: 'Whitelisted' },
    { name: 'Sarah Jenkins', role: 'VP Financial Security Operations', address: '0x72da...18fa', monthlySalary: '$35,000.00', status: 'Whitelisted' },
    { name: 'Alex Khasanov', role: 'Staff Cryptographic Infrastructure Engineer', address: '0x99ea...2041', monthlySalary: '$32,500.00', status: 'Whitelisted' },
    { name: 'Elena Rostova', role: 'General Counsel & Compliance Chief', address: '0x11ab...662e', monthlySalary: '$28,000.00', status: 'Whitelisted' },
  ];

  return (
    <div className="space-y-6 text-left max-w-4xl">
      
      {/* Head stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="p-5 space-y-2">
          <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">PAYROLL BUDGET CAP</span>
          <h3 className="font-display font-extrabold text-gray-950 text-xl">$500,000.00</h3>
          <p className="text-[10px] font-mono text-gray-400">QUARTERLY ALLOCATION</p>
        </Card>

        <Card className="p-5 space-y-2">
          <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">MONTHLY STAFF SALARY COMMITTED</span>
          <h3 className="font-display font-extrabold text-gray-950 text-xl">$140,500.00</h3>
          <p className="text-[10px] font-mono text-emerald-600 font-bold">4 REGISTERED OPERATORS</p>
        </Card>

        <Card className="p-5 space-y-2">
          <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">SETTLEMENT METHOD</span>
          <h3 className="font-display font-extrabold text-gray-950 text-xl">USDC-ERC20 Multichain</h3>
          <p className="text-[10px] font-mono text-gray-400">AUTOMATIC HARDWARE DISPATCH</p>
        </Card>
      </div>

      {/* Staff lists table */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        
        {/* Clearing form details */}
        <div className="md:col-span-4 bg-white border border-gray-100 p-5 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-display font-black text-gray-950 uppercase tracking-tight">
                Corporate Payroll Controller
              </h3>
              <p className="text-[10px] text-gray-400 font-mono block mt-0.5">
                DISPATCH MONTHLY STAFF SALARIES
              </p>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed font-sans">
              Clicking release runs checking mechanisms across all registered staff addresses, validates active key-shares via dual authentication HSM enclaves, and processes instant payouts in USDC.
            </p>
          </div>

          <div className="pt-2">
            {clearingSuccess && (
              <span className="text-xs font-bold text-emerald-600 font-mono flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-xl mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Staff payroll processed successfully!
              </span>
            )}
            <Button
              onClick={handleClearPayroll}
              isLoading={clearing}
              className="w-full text-xs font-bold py-3 rounded-2xl"
              leftIcon={<Send className="w-3.5 h-3.5" />}
            >
              Clear Corporate Payroll
            </Button>
          </div>
        </div>

        {/* Staff accounts table */}
        <div className="md:col-span-8 bg-white border border-gray-100 p-5 rounded-2xl shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-display font-black text-gray-950 uppercase tracking-tight">
              Registered Operator Accounts
            </h3>
            <p className="text-[10px] text-gray-400 font-mono block mt-0.5">
              WHITELISTED RECIPIENTS LEDGER
            </p>
          </div>

          <TableContainer>
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="py-2.5 px-4 font-bold text-gray-400 font-mono text-[9px] uppercase">Recipient Name</th>
                  <th className="py-2.5 px-4 font-bold text-gray-400 font-mono text-[9px] uppercase">Corporate Role</th>
                  <th className="py-2.5 px-4 font-bold text-gray-400 font-mono text-[9px] uppercase">Settlement Address</th>
                  <th className="py-2.5 px-4 font-bold text-gray-400 font-mono text-[9px] uppercase text-right">Committed Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {staffList.map((s, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 text-gray-900 font-bold font-display">{s.name}</td>
                    <td className="py-3 px-4 text-gray-500 font-semibold">{s.role}</td>
                    <td className="py-3 px-4 font-mono font-bold text-gray-400 select-all">{s.address}</td>
                    <td className="py-3 px-4 font-mono font-bold text-gray-900 text-right">{s.monthlySalary}</td>
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
