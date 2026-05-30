/**
 * Module: features/adminSupport/components/sections/AdminSupportChatPanel.jsx
 * Purpose: Presents the Admin Support Chat Panel UI fragment so parent files can stay focused on flow and data.
 */
import React from 'react';
import { MessageCircle, Send } from 'lucide-react';

const AdminSupportChatPanel = ({
  chatMessages,
  chatInput,
  setChatInput,
  sendLiveMessage,
}) => (
  <div className="premium-panel overflow-hidden rounded-2xl">
    <div className="border-b border-slate-200 bg-slate-50/80 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-bold text-slate-900">
            <MessageCircle size={18} className="text-emerald-600" /> Live Support Monitor
          </h2>
          <p className="mt-1 text-xs text-slate-500">Watch active support traffic and reply directly as the admin support desk.</p>
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          {chatMessages.length} message{chatMessages.length === 1 ? '' : 's'}
        </span>
      </div>
    </div>

    <div className="h-[520px] space-y-3 overflow-y-auto bg-slate-50 p-4">
      {chatMessages.length === 0 ? (
        <div className="flex h-full items-center justify-center text-center text-sm text-slate-500">Waiting for live support activity.</div>
      ) : (
        chatMessages.map((msg) => (
          <div key={msg.id} className={`text-sm ${msg.role === 'admin' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block max-w-[88%] rounded-2xl px-3 py-2.5 ${msg.role === 'admin' ? 'bg-slate-900 text-white' : msg.role === 'system' ? 'bg-amber-100 text-amber-800' : 'border border-slate-200 bg-white text-slate-800'}`}>
              <div className="mb-1 text-[11px] opacity-70">{msg.name || 'System'}</div>
              <div className="leading-relaxed">{msg.message}</div>
            </div>
          </div>
        ))
      )}
    </div>

    <form onSubmit={sendLiveMessage} className="border-t border-slate-100 bg-white p-4">
      <div className="flex gap-2">
        <input value={chatInput} onChange={(event) => setChatInput(event.target.value)} className="flex-1 rounded-xl border border-slate-300 px-3 py-2.5 text-sm" placeholder="Reply as admin..." />
        <button className="btn-premium inline-flex items-center gap-1 rounded-xl px-4 text-sm font-semibold" type="submit">
          <Send size={14} /> Send
        </button>
      </div>
    </form>
  </div>
);

export default AdminSupportChatPanel;
