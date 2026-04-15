import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bot, LifeBuoy, MessageCircle, Send, User, X } from 'lucide-react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { socketUrl } from '../../utils/axiosConfig';

const createWelcomeMessage = () => ({
  id: 'floating-support-welcome',
  role: 'system',
  name: 'BidPulse Bot',
  message: 'Welcome to live support. Send a message and our team can reply from the help desk.',
  createdAt: new Date().toISOString(),
});

const normalizeMessage = (payload, fallbackRole = 'user') => ({
  id: payload?.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  role: payload?.role || fallbackRole,
  name: payload?.name || (fallbackRole === 'system' ? 'BidPulse Bot' : 'Support'),
  message: payload?.message || '',
  createdAt: payload?.createdAt || new Date().toISOString(),
});

const appendIfNotDuplicate = (messages, incomingMessage) => {
  const isDuplicate = messages.some((existingMessage) => {
    const sameRole = existingMessage.role === incomingMessage.role;
    const sameName = existingMessage.name === incomingMessage.name;
    const sameMessage = existingMessage.message === incomingMessage.message;
    return sameRole && sameName && sameMessage;
  });

  if (isDuplicate) {
    return messages;
  }

  return [...messages, incomingMessage];
};

const FloatingSupportChat = () => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const isOpenRef = useRef(false);
  const [isOpen, setIsOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([createWelcomeMessage()]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  const shouldRender = Boolean(user?.token) && user?.role !== 'admin';
  const isHelpPage = location.pathname === '/help';
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isVisible = shouldRender && !isHelpPage && !isAdminRoute;

  const statusLabel = useMemo(
    () => (isConnected ? 'Support online' : 'Connecting to support'),
    [isConnected]
  );

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    if (!isVisible) {
      setIsOpen(false);
      setUnreadCount(0);
      return undefined;
    }

    const socket = io(socketUrl, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    const joinSupportRoom = () => {
      socket.emit('support:join', {
        name: user?.name || 'Guest User',
        role: user?.role || 'user',
      });
    };

    socket.on('connect', () => {
      setIsConnected(true);
      joinSupportRoom();
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('support:message', (payload) => {
      if (!payload?.message) return;
      setChatMessages((prev) =>
        appendIfNotDuplicate(prev, normalizeMessage(payload, payload?.role || 'user'))
      );
      if (!isOpenRef.current) {
        setUnreadCount((prev) => prev + 1);
      }
    });

    socket.on('support:system', (payload) => {
      setChatMessages((prev) =>
        appendIfNotDuplicate(prev, normalizeMessage({ ...payload, role: 'system' }, 'system'))
      );
      if (!isOpenRef.current) {
        setUnreadCount((prev) => prev + 1);
      }
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('support:message');
      socket.off('support:system');
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [isVisible, user?.name, user?.role]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [chatMessages, isOpen]);

  const sendLiveMessage = (event) => {
    event.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed) return;

    socketRef.current?.emit('support:message', {
      name: user?.name || 'Guest User',
      role: user?.role || 'user',
      message: trimmed,
    });

    setChatInput('');
  };

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[calc(100vw-2rem)] max-w-[21rem] flex-col items-end sm:bottom-5 sm:right-5">
      {isOpen ? (
        <div className="pointer-events-auto mb-3 w-full overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_24px_60px_-30px_rgba(15,23,42,0.45)]">
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 px-4 py-3.5 text-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-white/95">
                  <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10">
                    <LifeBuoy size={16} />
                  </span>
                  BidPulse Support
                </div>
                <p className="mt-2.5 text-[13px] leading-5 text-slate-200">
                  Ask a quick question here or continue in the full help center.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-white/15 bg-white/10 p-2 text-white transition hover:bg-white/15"
                aria-label="Close support chat"
              >
                <X size={14} />
              </button>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 text-[11px]">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-2.5 py-1 font-semibold text-emerald-200">
                <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-300' : 'bg-amber-300'}`} />
                {statusLabel}
              </span>
              <Link
                to="/help"
                className="rounded-full border border-white/15 px-2.5 py-1 font-semibold text-slate-100 transition hover:bg-white/10"
              >
                Open Help Center
              </Link>
            </div>
          </div>

          <div className="bg-slate-50 px-3.5 py-3.5">
            <div className="mb-3 h-64 space-y-3 overflow-y-auto rounded-[22px] border border-slate-200 bg-white p-3.5">
              {chatMessages.map((msg) => {
                const isSystem = msg.role === 'system';
                const isAdmin = msg.role === 'admin';
                const isUser = !isSystem && !isAdmin;

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isSystem ? 'justify-center' : isAdmin ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[86%] rounded-2xl px-3 py-2.5 text-[13px] shadow-sm ${
                        isSystem
                          ? 'border border-amber-200 bg-amber-50 text-amber-900'
                          : isAdmin
                          ? 'bg-slate-900 text-white'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      <div className="mb-1.5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] opacity-80">
                        {isUser ? <User size={11} /> : <Bot size={11} />}
                        {msg.name || (isSystem ? 'BidPulse Bot' : 'Support')}
                      </div>
                      <p className="leading-5">{msg.message}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendLiveMessage} className="rounded-[22px] border border-slate-200 bg-white p-2 shadow-sm">
              <div className="flex items-end gap-2">
                <textarea
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  rows={2}
                  placeholder="Type your message for live support"
                  className="min-h-[52px] flex-1 resize-none rounded-2xl border-0 bg-transparent px-3 py-2 text-[13px] text-slate-700 outline-none placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  aria-label="Send support message"
                >
                  <Send size={15} />
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="pointer-events-auto inline-flex items-center gap-2.5 rounded-full bg-slate-950 px-3.5 py-2.5 text-sm font-semibold text-white shadow-[0_20px_50px_-24px_rgba(15,23,42,0.7)] transition hover:-translate-y-0.5 hover:bg-slate-900"
      >
        <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-white">
          <MessageCircle size={17} />
          {unreadCount > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          ) : null}
        </span>
        <span className="text-left leading-tight">
          <span className="block">Live Support</span>
          <span className="block text-[11px] font-medium text-slate-300">Chat with BidPulse</span>
        </span>
      </button>
    </div>
  );
};

export default FloatingSupportChat;
