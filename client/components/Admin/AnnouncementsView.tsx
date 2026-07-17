/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Megaphone,
  Plus,
  Send,
  Trash2,
  Calendar,
  AlertTriangle,
  UserCheck,
  Users,
  Globe
} from 'lucide-react';
import { Card, Button, Input, Select, Badge } from '../ui/index.ts';
import { ThemeTokens } from '../ui/themeTokens.ts';
import { Toast } from '../ui/Feedback/index.tsx';

interface SystemAnnouncement {
  id: string;
  headline: string;
  content: string;
  category: 'Standard' | 'Critical';
  target: string;
  publishedBy: string;
  date: string;
}

const INITIAL_ANNOUNCEMENTS: SystemAnnouncement[] = [
  { id: 'ANN-992', headline: 'Scheduled Platform Maintenance & Database Integrity Tuning', content: 'We are completing an infrastructure optimization run on July 20th, 02:00-04:00 UTC. Ledger modifications will be paused.', category: 'Critical', target: 'All Accounts', publishedBy: 'superadmin', date: 'Jul 15, 2024' },
  { id: 'ANN-991', headline: 'Matched First Deposit Match Commissions Boost!', content: 'Earn an additional 2.5% yield matching commissions when direct referrals fund their balances with over $5,000.', category: 'Standard', target: 'Gold & Diamond Tiers', publishedBy: 'marketing_op', date: 'Jul 12, 2024' },
  { id: 'ANN-990', headline: 'Security Update: Mandatory Two-Factor Validation for Withdrawals', content: 'Starting August 1st, all outgoing transactions must pass dual-factor OTP security checks to secure platform reserves.', category: 'Critical', target: 'All Accounts', publishedBy: 'security_lead', date: 'Jul 10, 2024' }
];

interface AnnouncementsViewProps {
  t: ThemeTokens;
  isDark: boolean;
}

export const AnnouncementsView: React.FC<AnnouncementsViewProps> = ({ t, isDark }) => {
  const [broadcasts, setBroadcasts] = useState<SystemAnnouncement[]>(INITIAL_ANNOUNCEMENTS);
  const [headline, setHeadline] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'Standard' | 'Critical'>('Standard');
  const [target, setTarget] = useState('All Accounts');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const publishBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!headline.trim() || !content.trim()) return;

    const id = `ANN-${990 - broadcasts.length}`;
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const created: SystemAnnouncement = {
      id,
      headline,
      content,
      category,
      target,
      publishedBy: 'superadmin',
      date: dateStr
    };

    // TODO: Replace with real API call
    setBroadcasts(prev => [created, ...prev]);
    setHeadline('');
    setContent('');
    setCategory('Standard');
    setTarget('All Accounts');
    showToast(`Announcement broadcasted to target audience: ${target}`);
  };

  const deleteBroadcast = (id: string) => {
    // TODO: Replace with real API call
    setBroadcasts(prev => prev.filter(b => b.id !== id));
    showToast('Broadcast deleted from historical logs.');
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header Banner */}
      <div>
        <h2 className="text-xl font-bold tracking-tight">System Broadcasts</h2>
        <p className={`text-xs mt-1 ${t.textSub}`}>Draft system announcements, critical banners, promotional banners, and review historical announcements log.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Compose Broadcast */}
        <Card className="lg:col-span-5 p-6 h-fit">
          <form onSubmit={publishBroadcast} className="space-y-4">
            <h3 className="font-display font-bold text-sm border-b pb-2 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-blue-500" />
              <span>Draft Announcement</span>
            </h3>

            <Input
              label="Headline Subject"
              placeholder="e.g. Server Upgrade Completed"
              value={headline}
              onChange={e => setHeadline(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                Announcement Content Body
              </label>
              <textarea
                rows={4}
                placeholder="Type your system announcement details clearly here..."
                value={content}
                onChange={e => setContent(e.target.value)}
                required
                className={`w-full p-3 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all ${t.input}`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Broadcast Severity"
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                options={[
                  { value: 'Standard', label: 'Standard (Blue)' },
                  { value: 'Critical', label: 'Critical Alert (Red)' }
                ]}
              />
              <Select
                label="Target Cohort Group"
                value={target}
                onChange={e => setTarget(e.target.value)}
                options={[
                  { value: 'All Accounts', label: 'All Registered' },
                  { value: 'Gold & Diamond Tiers', label: 'Gold / Diamond VIP' },
                  { value: 'Bronze Level Users', label: 'Bronze Tiers' }
                ]}
              />
            </div>

            <div className="pt-2">
              <Button type="submit" variant="primary" className="w-full" leftIcon={<Send className="w-4 h-4" />}>
                Publish Broadcast
              </Button>
            </div>
          </form>
        </Card>

        {/* Right: Historical Log */}
        <Card className="lg:col-span-7 p-0 overflow-hidden">
          <div className={`p-4 border-b ${t.sep}`}>
            <h3 className="font-display font-bold text-sm flex items-center gap-2">
              <Globe className="w-4 h-4 text-purple-500" />
              <span>Broadcast Historical log</span>
            </h3>
          </div>

          <div className="divide-y divide-gray-100/10">
            {broadcasts.length > 0 ? (
              broadcasts.map(ann => (
                <div key={ann.id} className={`p-5 text-left transition-colors ${t.cardInner}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[10px] font-bold text-gray-400">{ann.id}</span>
                      <Badge variant={ann.category === 'Critical' ? 'rose' : 'primary'}>
                        {ann.category}
                      </Badge>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${t.textMuted}`}>
                        <Users className="w-3 h-3" />
                        {ann.target}
                      </span>
                    </div>

                    <button
                      onClick={() => deleteBroadcast(ann.id)}
                      className="p-1.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Delete Broadcast"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4 className="font-bold text-xs mt-2.5 leading-snug">{ann.headline}</h4>
                  <p className={`text-[11px] leading-relaxed mt-2.5 ${t.textSub}`}>{ann.content}</p>

                  <div className="flex items-center gap-4 mt-3.5 text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{ann.date}</span>
                    </div>
                    <span>Publisher: {ann.publishedBy}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className={`p-12 text-center font-medium ${t.textMuted}`}>
                No announcements published yet.
              </div>
            )}
          </div>
        </Card>
      </div>

      {toastMessage && (
        <Toast
          message={toastMessage}
          variant="success"
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
};
export default AnnouncementsView;
