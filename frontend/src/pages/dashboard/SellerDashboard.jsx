import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { DollarSign, Lock, MapPin, Package, Pencil, Plus, Trash2, X } from 'lucide-react';
import { getAllAuctions, deleteAuction } from '../../redux/auctionSlice';

const SellerDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { auctions, isLoading } = useSelector((state) => state.auction);
  const [shippingModalData, setShippingModalData] = useState(null);

  useEffect(() => {
    if (user?._id) {
      dispatch(getAllAuctions({ seller: user._id, includeBids: false, force: true }));
    }
  }, [dispatch, user?._id]);

  const myAuctions = useMemo(
    () => auctions.filter((auction) => auction.seller?._id === user._id || auction.seller === user._id),
    [auctions, user._id]
  );

  const totalEarnings = myAuctions
    .filter((auction) => auction.status === 'closed')
    .reduce((sum, auction) => sum + auction.currentPrice * 0.92, 0);

  const pendingEscrow = myAuctions
    .filter((auction) => auction.status === 'paid_held_in_escrow')
    .reduce((sum, auction) => sum + auction.currentPrice * 0.92, 0);

  const handleDelete = (id) => {
    if (window.confirm('Delete this listing permanently?')) {
      dispatch(deleteAuction(id));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-emerald-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <section className="rounded-2xl border border-emerald-100 bg-white shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage listings, fulfillment, and payout performance.</p>
            </div>
            <Link
              to="/create-auction"
              className="inline-flex items-center gap-2 bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-emerald-800"
            >
              <Plus size={18} /> Create Listing
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <KpiCard
            label="Released Earnings"
            value={totalEarnings}
            prefix="$"
            color="text-emerald-700"
            icon={<DollarSign size={16} />}
          />
          <KpiCard
            label="Pending in Escrow"
            value={pendingEscrow}
            prefix="$"
            color="text-blue-700"
            icon={<Lock size={16} />}
          />
          <div className="rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 p-5 text-white shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-300">Payout Account</p>
            <h3 className="text-xl font-semibold mt-1">Stripe Connected</h3>
            <a
              href="https://dashboard.stripe.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 rounded-lg bg-white/15 px-3 py-2 text-sm font-medium hover:bg-white/25"
            >
              Open Stripe Dashboard
            </a>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Inventory</h2>
          </div>

          {isLoading ? (
            <div className="p-10 text-center text-gray-500">Loading your listings...</div>
          ) : myAuctions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-700">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3.5">Item</th>
                    <th className="px-6 py-3.5">Price</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Fulfillment</th>
                    <th className="px-6 py-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {myAuctions.map((auction) => (
                    <tr key={auction._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={auction.images?.[0] || 'https://via.placeholder.com/120'}
                            alt={auction.title}
                            className="h-11 w-11 rounded-md border border-gray-200 object-cover"
                          />
                          <div>
                            <p className="font-semibold text-gray-900">{auction.title}</p>
                            <p className="text-xs text-gray-500">{new Date(auction.endTime).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-emerald-700">${auction.currentPrice}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={auction.status} />
                      </td>
                      <td className="px-6 py-4">
                        {auction.status === 'paid_held_in_escrow' || auction.status === 'closed' ? (
                          <button
                            onClick={() => setShippingModalData(auction.shippingDetails)}
                            className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-900 font-medium"
                          >
                            <Package size={15} /> Shipping Info
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xs italic">Waiting for payment</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-3">
                          <Link to={`/edit-auction/${auction._id}`} className="text-blue-600 hover:text-blue-800" title="Edit">
                            <Pencil size={17} />
                          </Link>
                          <button onClick={() => handleDelete(auction._id)} className="text-red-500 hover:text-red-700" title="Delete">
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-14 text-center text-gray-500">No listings yet. Create your first auction to start selling.</div>
          )}
        </section>

        {shippingModalData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Buyer Shipping Details</h3>
                <button onClick={() => setShippingModalData(null)} className="text-gray-400 hover:text-gray-600">
                  <X size={22} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                {shippingModalData?.name ? (
                  <>
                    <div>
                      <p className="text-xs font-semibold uppercase text-gray-500">Receiver</p>
                      <p className="font-semibold text-gray-900">{shippingModalData.name}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-gray-500">Address</p>
                      <p className="text-gray-700 flex items-start gap-2">
                        <MapPin size={16} className="mt-0.5 text-gray-400" />
                        {shippingModalData.address}, {shippingModalData.city}, {shippingModalData.postalCode},{' '}
                        {shippingModalData.country}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-gray-500">Phone</p>
                      <p className="text-gray-700">{shippingModalData.phone || 'N/A'}</p>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">Shipping details are not available yet.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const KpiCard = ({ label, value, prefix = '', color, icon }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
    <p className="text-xs uppercase tracking-wide text-gray-500 flex items-center gap-2">
      {icon}
      {label}
    </p>
    <p className={`text-2xl font-bold mt-2 ${color}`}>
      {prefix}
      {value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </p>
  </div>
);

const StatusBadge = ({ status }) => {
  const label = status === 'paid_held_in_escrow' ? 'Paid & Held' : status;
  const styleMap = {
    active: 'bg-emerald-100 text-emerald-700',
    closed: 'bg-slate-800 text-white',
    paid_held_in_escrow: 'bg-blue-100 text-blue-700',
    completed: 'bg-amber-100 text-amber-700',
    unsold: 'bg-gray-200 text-gray-700',
  };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${styleMap[status] || styleMap.unsold}`}>{label}</span>;
};

export default SellerDashboard;
