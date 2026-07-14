/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  LifeBuoy, 
  Search, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  Send
} from 'lucide-react';
import { Card, TableContainer } from '../ui/Cards/index.tsx';
import { Button } from '../ui/Buttons/index.tsx';

export interface SupportTicket {
  id: string;
  userEmail: string;
  subject: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'Pending Client' | 'Resolved';
  timestamp: string;
  messages: { sender: 'Client' | 'Support'; text: string; time: string }[];
}

interface SupportViewProps {
  tickets: SupportTicket[];
  onReplyTicket: (id: string, text: string) => void;
  onCloseTicket: (id: string) => void;
}

export const SupportView: React.FC<SupportViewProps> = ({ tickets, onReplyTicket, onCloseTicket }) => {
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'All' | 'Low' | 'Medium' | 'High' | 'Critical'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Open' | 'Pending Client' | 'Resolved'>('All');

  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.userEmail.toLowerCase().includes(search.toLowerCase()) ||
                          t.subject.toLowerCase().includes(search.toLowerCase()) ||
                          t.id.toLowerCase().includes(search.toLowerCase());
    const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage) || 1;
  const paginatedTickets = filteredTickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getPriorityBadge = (prio: SupportTicket['priority']) => {
    switch (prio) {
      case 'Critical': return 'bg-rose-50 text-rose-700 border-rose-100/50 font-bold';
      case 'High': return 'bg-red-50 text-red-700 border-red-100/50';
      case 'Medium': return 'bg-amber-50 text-amber-700 border-amber-100/50';
      case 'Low': return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  const getStatusBadge = (status: SupportTicket['status']) => {
    switch (status) {
      case 'Open': return 'bg-blue-50 text-blue-700 border-blue-100/50';
      case 'Pending Client': return 'bg-amber-50 text-amber-700 border-amber-100/50';
      case 'Resolved': return 'bg-emerald-50 text-emerald-700 border-emerald-100/50';
    }
  };

  const selectedTicket = tickets.find(t => t.id === activeTicketId);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeTicketId) return;
    onReplyTicket(activeTicketId, replyText.trim());
    setReplyText('');
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 text-left">
      
      {/* Left panel list of tickets */}
      <div className="xl:col-span-7 space-y-4">
        
        {/* Ticket search filter */}
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="relative flex-grow max-w-sm">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search tickets..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 focus:border-blue-500 rounded-xl focus:outline-none bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="text-xs font-semibold px-2 py-1.5 border border-gray-200 rounded-lg bg-white text-gray-700 cursor-pointer focus:outline-none"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-xs font-semibold px-2 py-1.5 border border-gray-200 rounded-lg bg-white text-gray-700 cursor-pointer focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Pending Client">Pending Client</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Tickets table container */}
        <TableContainer>
          <table className="w-full text-left border-collapse font-sans text-xs sm:text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-2.5 px-4 font-bold text-gray-400 font-mono text-[9px] tracking-wider uppercase text-left w-1/5">
                  Ticket ID
                </th>
                <th className="py-2.5 px-4 font-bold text-gray-400 font-mono text-[9px] tracking-wider uppercase text-left w-1/3">
                  User Email
                </th>
                <th className="py-2.5 px-4 font-bold text-gray-400 font-mono text-[9px] tracking-wider uppercase text-left w-1/3">
                  Subject
                </th>
                <th className="py-2.5 px-4 font-bold text-gray-400 font-mono text-[9px] tracking-wider uppercase text-center w-[12%]">
                  Priority
                </th>
                <th className="py-2.5 px-4 font-bold text-gray-400 font-mono text-[9px] tracking-wider uppercase text-center w-[12%]">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {paginatedTickets.length > 0 ? (
                paginatedTickets.map((t) => (
                  <tr 
                    key={t.id} 
                    onClick={() => setActiveTicketId(t.id)}
                    className={`cursor-pointer transition-colors duration-150 ${
                      activeTicketId === t.id ? 'bg-blue-50/40' : 'hover:bg-gray-50/50'
                    }`}
                  >
                    
                    <td className="py-3 px-4 font-mono text-xs text-gray-900 font-bold select-all">
                      {t.id}
                    </td>

                    <td className="py-3 px-4 text-gray-950 font-semibold max-w-[150px] truncate" title={t.userEmail}>
                      {t.userEmail}
                    </td>

                    <td className="py-3 px-4 text-gray-600 font-medium max-w-[180px] truncate" title={t.subject}>
                      {t.subject}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded font-mono text-[9px] border ${getPriorityBadge(t.priority)}`}>
                        {t.priority}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-mono border ${getStatusBadge(t.status)}`}>
                        {t.status}
                      </span>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400 font-mono text-xs">
                    No active client helpdesk tickets match.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </TableContainer>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] font-mono text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-1 rounded-lg bg-white border border-gray-200 text-gray-500 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1 rounded-lg bg-white border border-gray-200 text-gray-500 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Right panel chat replies */}
      <div className="xl:col-span-5">
        {selectedTicket ? (
          <Card className="p-5 flex flex-col h-[420px] justify-between shadow-sm relative">
            <div className="space-y-4 flex-grow flex flex-col overflow-hidden">
              
              {/* Header */}
              <div className="flex items-start justify-between pb-3 border-b border-gray-100 flex-shrink-0">
                <div className="text-left space-y-1">
                  <span className="text-[10px] font-mono text-gray-400 font-bold uppercase tracking-wider block">SUPPORT TICKET CONTEXT</span>
                  <h4 className="text-xs font-display font-black text-gray-950 uppercase leading-snug">{selectedTicket.subject}</h4>
                  <span className="text-[10px] font-mono text-blue-600 block">{selectedTicket.userEmail}</span>
                </div>
                {selectedTicket.status !== 'Resolved' && (
                  <button
                    onClick={() => onCloseTicket(selectedTicket.id)}
                    className="px-2.5 py-1 text-[10px] font-bold text-emerald-600 hover:bg-emerald-50 border border-emerald-100 rounded-lg transition-colors cursor-pointer"
                  >
                    Mark Resolved
                  </button>
                )}
              </div>

              {/* Message Feed list */}
              <div className="flex-grow overflow-y-auto space-y-3.5 pr-1 font-sans text-xs scrollbar-thin">
                {selectedTicket.messages.map((m, idx) => (
                  <div key={idx} className={`flex flex-col ${m.sender === 'Support' ? 'items-end' : 'items-start'}`}>
                    <div className={`p-3 rounded-2xl max-w-[85%] text-left space-y-1 ${
                      m.sender === 'Support' 
                        ? 'bg-blue-600 text-white rounded-tr-none shadow-xs shadow-blue-500/10' 
                        : 'bg-gray-100 text-gray-800 rounded-tl-none'
                    }`}>
                      <p className="leading-relaxed text-[11px] sm:text-xs">{m.text}</p>
                      <span className={`text-[9px] font-mono block text-right ${m.sender === 'Support' ? 'text-blue-100/80' : 'text-gray-400'}`}>
                        {m.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* Actions Form */}
            {selectedTicket.status !== 'Resolved' ? (
              <form onSubmit={handleSendReply} className="pt-3 border-t border-gray-100 flex items-center gap-2 flex-shrink-0">
                <input
                  type="text"
                  placeholder="Draft dynamic response..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-grow px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 bg-gray-50/50"
                  required
                />
                <button
                  type="submit"
                  className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center justify-center cursor-pointer shadow-sm"
                  title="Send Reply"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <div className="pt-3 border-t border-gray-100 text-center text-xs font-mono text-emerald-600 font-bold uppercase flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                This ticket has been marked resolved.
              </div>
            )}
          </Card>
        ) : (
          <div className="h-[420px] bg-gray-50/30 border border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-center p-5">
            <LifeBuoy className="w-8 h-8 text-gray-300 mb-2.5 animate-spin duration-[10000ms]" />
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block">NO CHAT SELECTED</span>
            <p className="text-xs text-gray-400 max-w-[200px] leading-relaxed mt-1 font-sans">
              Select an active customer support inquiry ticket to review thread details and reply.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
