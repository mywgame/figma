/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Filter,
  Search,
  AlertCircle
} from 'lucide-react';
import { Card, Button, Badge } from '../ui/index.ts';
import { ThemeTokens } from '../ui/themeTokens.ts';
import { AdminTicket } from './types.ts';
import { TICKETS_MOCK } from './mockData.ts';

interface SupportViewProps {
  t: ThemeTokens;
  isDark: boolean;
}

export const SupportView: React.FC<SupportViewProps> = ({ t, isDark }) => {
  const [tickets, setTickets] = useState<AdminTicket[]>(TICKETS_MOCK);
  const [selectedId, setSelectedId] = useState<string>(TICKETS_MOCK[0]?.id || '');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'Open' | 'Pending' | 'Resolved'>('All');
  const [replyText, setReplyText] = useState('');

  const activeTicket = tickets.find(tk => tk.id === selectedId);

  // Send message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeTicket) return;

    const newMessage = {
      sender: 'admin' as const,
      text: replyText,
      time: 'Just now'
    };

    // TODO: Replace with real API call
    setTickets(prev =>
      prev.map(tk => {
        if (tk.id === activeTicket.id) {
          return {
            ...tk,
            status: 'Pending' as const, // Waiting on user response now
            messages: [...tk.messages, newMessage]
          };
        }
        return tk;
      })
    );

    setReplyText('');
  };

  // Resolve ticket
  const resolveTicket = (id: string) => {
    // TODO: Replace with real API call
    setTickets(prev =>
      prev.map(tk => (tk.id === id ? { ...tk, status: 'Resolved' as const } : tk))
    );
  };

  // Close ticket
  const closeTicket = (id: string) => {
    // TODO: Replace with real API call
    setTickets(prev =>
      prev.map(tk => (tk.id === id ? { ...tk, status: 'Closed' as const } : tk))
    );
  };

  // Filter & Search
  const filteredTickets = tickets.filter(tk => {
    const matchesSearch =
      tk.user.toLowerCase().includes(search.toLowerCase()) ||
      tk.subject.toLowerCase().includes(search.toLowerCase()) ||
      tk.id.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (filter === 'All') return true;
    return tk.status === filter;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Header Banner */}
      <div>
        <h2 className="text-xl font-bold tracking-tight">Support Tickets</h2>
        <p className={`text-xs mt-1 ${t.textSub}`}>Interact with members, review user inquiries, and adjust troubleshooting tickets statuses.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[580px]">
        {/* Left pane: Tickets List */}
        <Card className="lg:col-span-5 p-0 overflow-hidden flex flex-col h-full">
          {/* List Search & Filters */}
          <div className={`p-4 border-b space-y-3 ${t.sep}`}>
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${t.textMuted}`} />
              <input
                type="text"
                placeholder="Search tickets by ID, title, or name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all ${t.input}`}
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {(['All', 'Open', 'Pending', 'Resolved'] as const).map(tab => {
                const active = filter === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold tracking-tight transition-all cursor-pointer ${
                      active
                        ? 'bg-blue-600 text-white shadow-xs'
                        : `${isDark ? 'bg-white/5 text-gray-400 hover:bg-white/8' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scrollable list */}
          <div className="flex-grow overflow-y-auto divide-y divide-gray-100/10">
            {filteredTickets.length > 0 ? (
              filteredTickets.map(tk => {
                const active = tk.id === selectedId;
                return (
                  <div
                    key={tk.id}
                    onClick={() => setSelectedId(tk.id)}
                    className={`p-4 text-left cursor-pointer transition-all ${
                      active
                        ? `${isDark ? 'bg-white/5 border-l-4 border-blue-500' : 'bg-blue-50/50 border-l-4 border-blue-600'}`
                        : `${t.cardInner}`
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] font-bold text-blue-500">{tk.id}</span>
                      <span className={`text-[10px] font-medium ${t.textMuted}`}>{tk.date}</span>
                    </div>

                    <h4 className="font-bold text-xs mt-1.5 line-clamp-1 tracking-tight">{tk.subject}</h4>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        <span className={`text-[10px] font-semibold ${t.textSub}`}>{tk.user}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Badge variant={tk.priority === 'High' ? 'rose' : tk.priority === 'Medium' ? 'amber' : 'neutral'}>
                          {tk.priority}
                        </Badge>
                        <Badge variant={tk.status === 'Open' ? 'rose' : tk.status === 'Pending' ? 'amber' : 'emerald'}>
                          {tk.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className={`p-8 text-center font-medium ${t.textMuted}`}>
                No inquiry tickets found.
              </div>
            )}
          </div>
        </Card>

        {/* Right pane: Chat details */}
        <Card className="lg:col-span-7 p-0 overflow-hidden flex flex-col h-full relative">
          {activeTicket ? (
            <>
              {/* Header details bar */}
              <div className={`p-4 border-b flex items-center justify-between gap-4 ${t.sep}`}>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-blue-500">{activeTicket.id}</span>
                    <Badge variant={activeTicket.priority === 'High' ? 'rose' : activeTicket.priority === 'Medium' ? 'amber' : 'neutral'}>
                      {activeTicket.priority} Priority
                    </Badge>
                  </div>
                  <h4 className="font-display font-bold text-xs tracking-tight truncate mt-1">{activeTicket.subject}</h4>
                </div>

                <div className="flex gap-1.5 shrink-0">
                  {activeTicket.status !== 'Resolved' && activeTicket.status !== 'Closed' && (
                    <>
                      <button
                        onClick={() => resolveTicket(activeTicket.id)}
                        className="p-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-500 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                        title="Mark Resolved"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => closeTicket(activeTicket.id)}
                        className="p-1.5 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Close Ticket"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Chat Messages Feed */}
              <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-black/10">
                {activeTicket.messages.map((msg, idx) => {
                  const isAdmin = msg.sender === 'admin';
                  return (
                    <div
                      key={idx}
                      className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] rounded-2xl p-3.5 text-xs text-left shadow-xs ${
                        isAdmin
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : `${isDark ? 'bg-white/5 text-gray-200' : 'bg-white text-gray-800'} border border-white/5 rounded-tl-none`
                      }`}>
                        <div className="flex items-center justify-between gap-4 mb-1 border-b border-white/10 pb-0.5">
                          <span className="font-mono text-[9px] uppercase tracking-wider font-extrabold opacity-75">
                            {isAdmin ? 'System Auditor' : activeTicket.user}
                          </span>
                          <span className="text-[8px] opacity-60 font-mono font-medium">{msg.time}</span>
                        </div>
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input area */}
              {activeTicket.status !== 'Closed' && activeTicket.status !== 'Resolved' ? (
                <form onSubmit={handleSendMessage} className={`p-4 border-t flex gap-2 ${t.sep}`}>
                  <input
                    type="text"
                    placeholder="Type your message or solution details here..."
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    className={`flex-grow px-4 py-3 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all ${t.input}`}
                  />
                  <Button type="submit" variant="primary" className="p-3 shrink-0 rounded-xl" leftIcon={<Send className="w-4 h-4" />} />
                </form>
              ) : (
                <div className={`p-4 border-t text-center font-bold text-xs ${t.sep} ${t.textMuted}`}>
                  This inquiry is settled and finalized. Re-open to send messages.
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-gray-500">
              <MessageSquare className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm font-semibold">No Ticket Selected</p>
              <p className="text-xs text-gray-400 mt-1">Select an item from the left panel to begin reviewing troubleshooting communications.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
export default SupportView;
