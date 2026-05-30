/**
 * Module: features/adminAuctions/components/AuctionModerationModal.jsx
 * Purpose: Presents the Auction Moderation Modal dialog and keeps related UI inputs grouped in one place.
 */
import React from 'react';
import { createPortal } from 'react-dom';
import { CalendarClock, CheckCircle, XCircle } from 'lucide-react';

import { getAuctionImage, handleAuctionImageError } from '../../../utils/imageUrl';
import { REGISTRATION_DAY_OPTIONS } from '../constants';

const AuctionModerationModal = ({
  selectedAuction,
  onClose,
  registrationWindowDays,
  setRegistrationWindowDays,
  registrationTestMinutes,
  setRegistrationTestMinutes,
  customEndAt,
  setCustomEndAt,
  disapproveReason,
  setDisapproveReason,
  onApprove,
  onDisapprove,
}) => {
  if (!selectedAuction || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] overflow-y-auto bg-black/55 p-4 backdrop-blur-sm">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl premium-panel">
        <div className="flex items-center justify-between border-b border-slate-100 bg-white/90 px-6 py-4">
          <h3 className="text-xl font-bold text-slate-900">Listing Details</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900" type="button">Close</button>
        </div>

        <div className="space-y-6 p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <img
                src={getAuctionImage(selectedAuction.images)}
                alt={selectedAuction.title}
                onError={handleAuctionImageError}
                className="h-64 w-full rounded-xl border border-slate-200 object-cover"
              />
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-slate-900">{selectedAuction.title}</p>
              <p className="text-sm text-slate-600">{selectedAuction.description}</p>
              <p className="text-sm text-slate-700"><b>Category:</b> {selectedAuction.category}</p>
              <p className="text-sm text-slate-700"><b>Seller:</b> {selectedAuction.seller?.name} ({selectedAuction.seller?.email})</p>
              <p className="text-sm text-slate-700"><b>Starting Price:</b> ${selectedAuction.startingPrice}</p>
              <p className="text-sm text-slate-700"><b>Status:</b> {selectedAuction.status}</p>
              {selectedAuction.verificationNote ? (
                <p className="text-sm text-red-700"><b>Verification Note:</b> {selectedAuction.verificationNote}</p>
              ) : null}
            </div>
          </div>

          {(selectedAuction.status === 'pending_verification' || selectedAuction.status === 'disapproved') && (
            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                <CalendarClock size={14} /> Registration Setup (for Approval)
              </p>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <select
                  value={registrationTestMinutes ? `test-${registrationTestMinutes}` : registrationWindowDays}
                  onChange={(event) => {
                    if (event.target.value === 'test-2' || event.target.value === 'test-5') {
                      setRegistrationTestMinutes(event.target.value === 'test-2' ? '2' : '5');
                      return;
                    }
                    setRegistrationTestMinutes('');
                    setRegistrationWindowDays(event.target.value);
                  }}
                  className="rounded-lg border border-slate-300 px-3 py-2"
                >
                  <option value="test-2">2 minutes (test mode)</option>
                  <option value="test-5">5 minutes (test mode)</option>
                  {REGISTRATION_DAY_OPTIONS.map((days) => (
                    <option key={days} value={days}>{days} day{days > 1 ? 's' : ''}</option>
                  ))}
                </select>
                <input
                  type="datetime-local"
                  value={customEndAt}
                  onChange={(event) => setCustomEndAt(event.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2"
                  placeholder="Optional custom end time"
                />
              </div>
              <p className="text-xs text-slate-500">If custom end time is set, it overrides the selected day count.</p>
              <button onClick={onApprove} className="btn-premium inline-flex items-center gap-2 px-4 py-2 text-sm" type="button">
                <CheckCircle size={16} /> Approve
              </button>
            </div>
          )}

          {(selectedAuction.status === 'pending_verification' || selectedAuction.status === 'disapproved') && (
            <div className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-800">Disapprove Listing</p>
              <textarea
                value={disapproveReason}
                onChange={(event) => setDisapproveReason(event.target.value)}
                rows={3}
                className="w-full rounded-lg border border-red-200 px-3 py-2"
                placeholder="Reason for disapproval (required)"
              />
              <button onClick={onDisapprove} className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700" type="button">
                <XCircle size={16} /> Disapprove
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AuctionModerationModal;
