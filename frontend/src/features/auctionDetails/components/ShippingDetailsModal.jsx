import React from 'react';
import { DollarSign, Lock, X } from 'lucide-react';

const ShippingDetailsModal = ({
  shippingDetails,
  onChange,
  onClose,
  onSubmit,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
    <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-6 py-4">
        <h3 className="text-lg font-bold text-gray-900">Shipping Details</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600" type="button">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 p-6">
        <input type="text" required className="w-full rounded-lg border-gray-300" placeholder="Full Name" value={shippingDetails.name} onChange={(event) => onChange('name', event.target.value)} />
        <input type="text" required className="w-full rounded-lg border-gray-300" placeholder="Shipping Address" value={shippingDetails.address} onChange={(event) => onChange('address', event.target.value)} />
        <div className="grid grid-cols-2 gap-4">
          <input type="text" required className="w-full rounded-lg border-gray-300" placeholder="City" value={shippingDetails.city} onChange={(event) => onChange('city', event.target.value)} />
          <input type="text" required className="w-full rounded-lg border-gray-300" placeholder="Postal Code" value={shippingDetails.postalCode} onChange={(event) => onChange('postalCode', event.target.value)} />
        </div>
        <input type="text" required className="w-full rounded-lg border-gray-300" placeholder="Country" value={shippingDetails.country} onChange={(event) => onChange('country', event.target.value)} />
        <input type="tel" required className="w-full rounded-lg border-gray-300" placeholder="Phone Number" value={shippingDetails.phone} onChange={(event) => onChange('phone', event.target.value)} />

        <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 py-3 font-bold text-white transition hover:bg-green-700">
          <DollarSign size={18} /> Pay & Confirm Order
        </button>
        <p className="mt-3 flex items-center justify-center gap-1 text-center text-xs text-gray-400">
          <Lock size={12} /> Secure Payment via Stripe
        </p>
      </form>
    </div>
  </div>
);

export default ShippingDetailsModal;
