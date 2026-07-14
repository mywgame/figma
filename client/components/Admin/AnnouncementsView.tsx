/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Megaphone, Trash2, CheckCircle2, FileText, Send, Sparkles } from 'lucide-react';
import { Card } from '../ui/Cards/index.tsx';
import { Button } from '../ui/Buttons/index.tsx';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  status: 'Draft' | 'Published';
  date: string;
}

interface AnnouncementsViewProps {
  announcements: Announcement[];
  onCreate: (title: string, content: string, status: 'Draft' | 'Published') => void;
  onUpdateStatus: (id: string, status: 'Draft' | 'Published') => void;
  onDelete: (id: string) => void;
}

export const AnnouncementsView: React.FC<AnnouncementsViewProps> = ({
  announcements,
  onCreate,
  onUpdateStatus,
  onDelete
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [announcementToDelete, setAnnouncementToDelete] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent, isDraft: boolean) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    onCreate(title.trim(), content.trim(), isDraft ? 'Draft' : 'Published');
    setTitle('');
    setContent('');
  };

  const handleConfirmDelete = () => {
    if (announcementToDelete) {
      onDelete(announcementToDelete);
      setAnnouncementToDelete(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
      
      {/* Left panel: Creator compose form */}
      <div className="lg:col-span-5 space-y-4">
        <div>
          <h3 className="text-sm font-display font-black text-gray-950 uppercase tracking-tight">
            Compose Bulletin Announcement
          </h3>
          <p className="text-[10px] text-gray-400 font-mono block mt-0.5">
            BROADCAST CORPORATE BULLETINS AND SYSTEM STATUS RELEASES
          </p>
        </div>

        <form className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block">
              Announcement Title
            </label>
            <input
              type="text"
              placeholder="e.g., Security Certificate Node Upgrades Complete"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs border border-gray-200 focus:border-blue-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all bg-gray-50/20"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block">
              Bulletin content Markdown
            </label>
            <textarea
              rows={5}
              placeholder="Draft comprehensive platform dispatch..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs border border-gray-200 focus:border-blue-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all resize-none bg-gray-50/20"
              required
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-gray-200 rounded-xl transition-colors cursor-pointer"
            >
              Save as Draft
            </button>
            <Button
              onClick={(e) => handleSubmit(e, false)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold"
              leftIcon={<Send className="w-3.5 h-3.5" />}
            >
              Publish Bulletin
            </Button>
          </div>
        </form>
      </div>

      {/* Right panel: Active Bulletin Feed list */}
      <div className="lg:col-span-7 space-y-4">
        <div>
          <h3 className="text-sm font-display font-black text-gray-950 uppercase tracking-tight">
            Active Bulletins Ledger
          </h3>
          <p className="text-[10px] text-gray-400 font-mono block mt-0.5">
            DRAFTED AND BROADCASTED PUBLIC DESPATCHES
          </p>
        </div>

        <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1.5 scrollbar-thin">
          {announcements.length > 0 ? (
            announcements.map((ann) => (
              <Card key={ann.id} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-blue-100/50 transition-all">
                
                <div className="space-y-1.5 text-left flex-grow max-w-[80%]">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded font-mono text-[8px] font-bold uppercase ${
                      ann.status === 'Published' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/50' 
                        : 'bg-gray-50 text-gray-500 border border-gray-200'
                    }`}>
                      {ann.status}
                    </span>
                    <span className="text-[9px] font-mono text-gray-400 font-semibold">{ann.date}</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-display font-bold text-gray-950 leading-tight">
                    {ann.title}
                  </h4>
                  <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                    {ann.content}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {ann.status === 'Draft' && (
                    <button
                      onClick={() => onUpdateStatus(ann.id, 'Published')}
                      className="px-2.5 py-1 text-[10px] font-bold text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-100/30 transition-colors cursor-pointer"
                      title="Publish active bulletin"
                    >
                      Publish
                    </button>
                  )}
                  {ann.status === 'Published' && (
                    <button
                      onClick={() => onUpdateStatus(ann.id, 'Draft')}
                      className="px-2.5 py-1 text-[10px] font-bold text-gray-500 hover:bg-gray-50 rounded-lg border border-gray-100 transition-colors cursor-pointer"
                      title="Recall bulletin to draft status"
                    >
                      Revert Draft
                    </button>
                  )}
                  <button
                    onClick={() => setAnnouncementToDelete(ann.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all cursor-pointer"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </Card>
            ))
          ) : (
            <div className="py-12 bg-gray-50/20 border border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-center p-5">
              <Megaphone className="w-8 h-8 text-gray-300 mb-2" />
              <span className="text-[10px] font-mono font-bold text-gray-400 uppercase">NO BULLETINS</span>
              <p className="text-xs text-gray-400 mt-0.5 max-w-[220px]">
                No operational bulletins currently loaded. Compose an announcement to alert customers.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Deletion Confirmation Modal */}
      {announcementToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setAnnouncementToDelete(null)}
          />
          <div className="relative bg-white border border-gray-100 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-fade-in text-left">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl flex items-center justify-center bg-red-50 text-red-600">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1 flex-grow">
                <h4 className="text-sm font-display font-extrabold text-gray-950 uppercase tracking-tight">
                  Confirm Bulletin Deletion
                </h4>
                <p className="text-[10px] font-mono text-gray-400 font-bold uppercase tracking-wider">
                  DESTRUCTIVE OPERATIONAL ACTION
                </p>
              </div>
            </div>

            <div className="my-4 p-3.5 bg-gray-50 rounded-xl space-y-2 border border-gray-100">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400 font-mono">Bulletin ID:</span>
                <span className="font-mono font-bold text-gray-900">{announcementToDelete}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400 font-mono">Title:</span>
                <span className="font-semibold text-gray-900 max-w-[240px] truncate">
                  {announcements.find(a => a.id === announcementToDelete)?.title}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed mb-6">
              Are you absolutely sure you want to delete this bulletin announcement permanently? This action cannot be undone and will immediately remove the notice from all customer feeds.
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setAnnouncementToDelete(null)}
                className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-gray-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancel Deletion
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all hover:shadow-md cursor-pointer"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
