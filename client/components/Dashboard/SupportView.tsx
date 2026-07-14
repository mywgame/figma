/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Card, TableContainer } from '../ui/Cards/index.tsx';
import { Button } from '../ui/Buttons/index.tsx';
import { Input, Textarea } from '../ui/Inputs/index.tsx';
import { Badge } from '../ui/Feedback/index.tsx';
import { HelpCircle, Mail, MessageSquare, ArrowUpRight, Send, HelpCircle as HelpIcon } from 'lucide-react';

export const SupportView: React.FC = () => {
  const [success, setSuccess] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const activeTickets = [
    { id: 'TKT-9281', category: 'Deposit Sync', title: 'Collateral transfer verify request', status: 'Closed', date: '2026-06-25' },
    { id: 'TKT-9405', category: 'VIP Upgrade', title: 'VIP tier rate validation check', status: 'Open', date: '2026-06-28' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setSubject('');
      setMessage('');
    }, 3000);
  };

  return (
    <div className="space-y-6 text-left" id="support-view-tab">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Support Request left */}
        <Card hoverEffect={true} className="lg:col-span-7 space-y-6">
          <div className="space-y-0.5 pb-4 border-b border-gray-100">
            <h3 className="text-sm font-display font-extrabold text-gray-950 tracking-tight">
              Support Priority Gateway
            </h3>
            <p className="text-xs text-gray-400 font-sans">
              Transmit an encrypted ticket directly to our secure institutional support nodes.
            </p>
          </div>

          {success ? (
            <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs rounded-2xl font-mono space-y-2">
              <span className="font-bold block">✓ Priority Ticket Transmitted</span>
              <p className="font-sans leading-normal">
                Ticket queued under reference ID #{Math.floor(Math.random() * 9000 + 1000)}. Lead operators will establish a secure chat sequence shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Ticket Subject"
                placeholder="e.g., Vault Deposit Verification Node Indexing Delay"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
              <Textarea
                label="Detailed Description"
                placeholder="Please outline transaction hashes, dates, and node references..."
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
              <Button type="submit" variant="primary" size="md" rightIcon={<Send className="w-4 h-4" />}>
                Transmit Priority Ticket
              </Button>
            </form>
          )}
        </Card>

        {/* Tickets and Knowledge base right */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Tickets List */}
          <Card hoverEffect={true} className="space-y-4">
            <h4 className="text-sm font-display font-bold text-gray-950">Active Incident Tickets</h4>
            
            <TableContainer>
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="py-2.5 px-4 font-semibold text-gray-500 font-display">ID</th>
                    <th className="py-2.5 px-4 font-semibold text-gray-500 font-display">Topic</th>
                    <th className="py-2.5 px-4 font-semibold text-gray-500 font-display">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-gray-700">
                  {activeTickets.map((tkt) => (
                    <tr key={tkt.id} className="hover:bg-gray-50/40">
                      <td className="py-2 px-4 font-mono font-bold text-gray-950">{tkt.id}</td>
                      <td className="py-2 px-4">
                        <div className="space-y-0.5">
                          <span className="font-bold block leading-tight">{tkt.title}</span>
                          <span className="text-[10px] text-gray-400 font-mono block leading-none">{tkt.category}</span>
                        </div>
                      </td>
                      <td className="py-2 px-4">
                        <Badge variant={tkt.status === 'Open' ? 'amber' : 'neutral'}>
                          {tkt.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableContainer>
          </Card>

          {/* Quick Help card */}
          <Card hoverEffect={true} className="p-4 bg-blue-50/20 border border-blue-100/50 text-left space-y-2">
            <div className="flex items-center space-x-2 text-blue-700">
              <Mail className="w-4 h-4" />
              <span className="text-xs font-bold font-display">Immediate Live Chat Portal</span>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed font-sans">
              For direct urgent assistance regarding multi-sig ledger resets, email desk support at <span className="font-bold text-blue-600">desk@cefi.platform</span> directly.
            </p>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default SupportView;
