import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { CheckCircle, Clock, DollarSign, ExternalLink, Package, Trophy } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from '../../utils/axiosConfig';
import { getAllAuctions } from '../../redux/auctionSlice';

const BidderDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { auctions, isLoading } = useSelector((state) => state.auction);

  useEffect(() => {
    dispatch(getAllAuctions({ includeBids: true, force: true }));
  }, [dispatch]);

  const wonAuctions = useMemo(
    () => auctions.filter((auction) => auction.winner === user._id && auction.status !== 'active'),
    [auctions, user._id]
  );

  const activeBids = useMemo(
    () =>
      auctions.filter(
        (auction) => auction.status === 'active' && auction.bids && auction.bids.some((bid) => bid.bidder === user._id)
      ),
    [auctions, user._id]
  );

  const inEscrowCount = wonAuctions.filter((auction) => auction.status === 'paid_held_in_escrow').length;

  const handleReleaseFunds = async (auctionId) => {
    if (!window.confirm('Confirm item received? Funds will be released to seller.')) return;
    try {
      await axios.post(`/payment/release/${auctionId}`, {}, { headers: { Authorization: `Bearer ${user.token}` } });
      toast.success('Funds released and transaction closed.');
      dispatch(getAllAuctions({ includeBids: true, force: true }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to release funds');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-cyan-300" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 text-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="mb-8 rounded-2xl border border-cyan-900/40 bg-slate-900/70 backdrop-blur p-6">
          <h1 className="text-3xl font-bold">Bidder Dashboard</h1>
          <p className="text-slate-400 mt-1">Track wins, active bids, and fulfillment actions in one place.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <MetricCard label="Won Auctions" value={wonAuctions.length} icon={<Trophy size={16} />} />
            <MetricCard label="Active Bids" value={activeBids.length} icon={<Clock size={16} />} />
            <MetricCard label="In Escrow" value={inEscrowCount} icon={<Package size={16} />} />
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Purchases & Winnings</h2>
          {wonAuctions.length > 0 ? (
            <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/70">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-800/80 text-slate-300">
                    <tr>
                      <th className="p-4">Item</th>
                      <th className="p-4">Winning Bid</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {wonAuctions.map((auction) => (
                      <tr key={auction._id} className="hover:bg-slate-800/40">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={auction.images?.[0] || 'https://via.placeholder.com/80'}
                              alt={auction.title}
                              className="h-11 w-11 rounded-md object-cover border border-slate-700"
                            />
                            <div>
                              <p className="font-semibold text-slate-100">{auction.title}</p>
                              <p className="text-xs text-slate-400">Ended: {new Date(auction.endTime).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-semibold text-cyan-300">${auction.currentPrice}</td>
                        <td className="p-4">
                          {auction.status === 'completed' && <Badge tone="amber" label="Unpaid" />}
                          {auction.status === 'paid_held_in_escrow' && <Badge tone="blue" label="In Escrow" />}
                          {auction.status === 'closed' && <Badge tone="green" label="Delivered" />}
                        </td>
                        <td className="p-4">
                          {auction.status === 'completed' ? (
                            <Link
                              to={`/auction/${auction._id}`}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 font-semibold text-white hover:bg-emerald-700"
                            >
                              <DollarSign size={14} /> Pay Now
                            </Link>
                          ) : auction.status === 'paid_held_in_escrow' ? (
                            <button
                              onClick={() => handleReleaseFunds(auction._id)}
                              className="inline-flex items-center gap-1 rounded-lg bg-cyan-600 px-3 py-1.5 font-semibold text-white hover:bg-cyan-700"
                            >
                              <CheckCircle size={14} /> Confirm Receipt
                            </button>
                          ) : (
                            <Link to={`/auction/${auction._id}`} className="inline-flex items-center gap-1 text-slate-300 hover:text-white">
                              View Details <ExternalLink size={12} />
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <EmptyState text="You have not won any auctions yet." />
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Active Bids</h2>
          {activeBids.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {activeBids.map((auction) => {
                const isWinning = auction.winner === user._id;
                return (
                  <div key={auction._id} className="rounded-xl border border-slate-800 bg-slate-900/75 p-5">
                    <div className="flex justify-between items-start gap-3 mb-3">
                      <h3 className="font-semibold text-slate-100">{auction.title}</h3>
                      <Badge tone={isWinning ? 'green' : 'red'} label={isWinning ? 'Winning' : 'Outbid'} />
                    </div>
                    <p className="text-sm text-slate-400 mb-4">
                      Current Price: <span className="text-cyan-300 font-semibold">${auction.currentPrice}</span>
                    </p>
                    <Link
                      to={`/auction/${auction._id}`}
                      className={`block rounded-lg text-center py-2.5 font-semibold ${
                        isWinning ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-cyan-600 text-white hover:bg-cyan-700'
                      }`}
                    >
                      {isWinning ? 'View Auction' : 'Place Higher Bid'}
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState text="No active bids at the moment. Explore auctions to start bidding." />
          )}
        </section>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, icon }) => (
  <div className="rounded-xl border border-slate-800 bg-slate-800/60 p-4">
    <p className="text-xs uppercase tracking-wide text-slate-400 flex items-center gap-2">
      {icon}
      {label}
    </p>
    <p className="mt-2 text-2xl font-bold text-white">{value}</p>
  </div>
);

const Badge = ({ tone, label }) => {
  const styles = {
    amber: 'bg-amber-500/20 text-amber-200 border-amber-500/30',
    blue: 'bg-blue-500/20 text-blue-200 border-blue-500/30',
    green: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30',
    red: 'bg-red-500/20 text-red-200 border-red-500/30',
  };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[tone]}`}>{label}</span>;
};

const EmptyState = ({ text }) => (
  <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/70 p-8 text-sm text-slate-400">{text}</div>
);

export default BidderDashboard;
