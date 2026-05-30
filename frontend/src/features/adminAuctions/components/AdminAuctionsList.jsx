/**
 * Module: features/adminAuctions/components/AdminAuctionsList.jsx
 * Purpose: Presents the Admin Auctions List UI fragment so parent files can stay focused on flow and data.
 */
import React from 'react';
import { Eye, Trash2 } from 'lucide-react';

import { getAuctionImage, handleAuctionImageError } from '../../../utils/imageUrl';
import Reveal from '../../../components/ui/Reveal';
import { ActionButton, StatusBadge } from './AdminAuctionsWidgets';

const AdminAuctionsList = ({ filtered, openDetails, handleDeleteAuction }) => (
  <Reveal delay={100}>
    <section className="premium-panel overflow-hidden rounded-2xl">
      <div className="grid gap-4 p-4 lg:hidden">
        {filtered.map((auction) => (
          <div key={auction._id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <img
                src={getAuctionImage(auction.images)}
                alt={auction.title}
                onError={handleAuctionImageError}
                className="h-20 w-20 rounded-2xl border border-slate-200 object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="line-clamp-2 font-bold text-slate-900">{auction.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{auction.category}</p>
                  </div>
                  <StatusBadge status={auction.status} />
                </div>
                <div className="mt-3 space-y-1 text-sm text-slate-600">
                  <p><span className="font-medium text-slate-500">Seller:</span> {auction.seller?.name || 'Unknown'}</p>
                  <p><span className="font-medium text-slate-500">Email:</span> {auction.seller?.email || '-'}</p>
                  <p><span className="font-medium text-slate-500">Price:</span> <span className="font-semibold text-slate-900">${auction.currentPrice}</span></p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <ActionButton onClick={() => openDetails(auction._id)} tone="soft">
                <Eye size={16} /> Details
              </ActionButton>
              <ActionButton onClick={() => handleDeleteAuction(auction._id)} tone="danger">
                <Trash2 size={16} /> Delete
              </ActionButton>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="p-4">Listing</th>
              <th className="p-4">Seller</th>
              <th className="p-4">Price</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filtered.map((auction) => (
              <tr key={auction._id} className="hover:bg-slate-50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={getAuctionImage(auction.images)}
                      alt={auction.title}
                      onError={handleAuctionImageError}
                      className="h-14 w-14 rounded-2xl border border-slate-200 object-cover"
                    />
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-slate-900">{auction.title}</div>
                      <div className="text-xs text-slate-400">{auction.category}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-slate-800">{auction.seller?.name || 'Unknown'}</div>
                  <div className="text-xs text-slate-500">{auction.seller?.email || '-'}</div>
                </td>
                <td className="p-4 font-semibold text-slate-900">${auction.currentPrice}</td>
                <td className="p-4">
                  <StatusBadge status={auction.status} />
                </td>
                <td className="p-4 text-center">
                  <div className="inline-flex gap-2">
                    <ActionButton onClick={() => openDetails(auction._id)} tone="soft">
                      <Eye size={14} /> Details
                    </ActionButton>
                    <ActionButton onClick={() => handleDeleteAuction(auction._id)} tone="danger">
                      <Trash2 size={14} /> Delete
                    </ActionButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="p-10 text-center text-sm text-slate-500">
          No listings matched the current search and status filter.
        </div>
      )}
    </section>
  </Reveal>
);

export default AdminAuctionsList;
