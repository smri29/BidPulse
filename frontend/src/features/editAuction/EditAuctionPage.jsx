/**
 * Module: features/editAuction/EditAuctionPage.jsx
 * Purpose: Renders the Edit Auction Page screen by composing smaller feature-specific sections.
 */
import React from 'react';
import { ImagePlus, Save, XCircle } from 'lucide-react';

import { AUCTION_CATEGORY_OPTIONS } from '../../constants/auctionCategories';
import AuctionField from '../auctionForm/Field';
import { MAX_EDIT_IMAGES, useEditAuctionForm } from './useEditAuctionForm';

const EditAuctionPage = () => {
  const { loading, saving, existingImages, formData, previews, onChange, onSelectImages, removeNewImage, onSubmit } = useEditAuctionForm();

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-xl sm:p-8">
          <h1 className="mb-6 text-2xl font-bold text-gray-900">Edit Listing</h1>
          <form onSubmit={onSubmit} className="space-y-5">
            <AuctionField label="Product Title"><input name="title" value={formData.title} onChange={onChange} className="w-full rounded-lg border border-gray-300 px-3 py-2.5" required /></AuctionField>
            <AuctionField label="Description"><textarea name="description" value={formData.description} onChange={onChange} rows={5} className="w-full rounded-lg border border-gray-300 px-3 py-2.5" required /></AuctionField>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <AuctionField label="Category"><select name="category" value={formData.category} onChange={onChange} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5">{AUCTION_CATEGORY_OPTIONS.map((category) => <option key={category} value={category}>{category}</option>)}</select></AuctionField>
              <AuctionField label="Starting Bid (USD)"><input type="number" name="startingPrice" min={1} value={formData.startingPrice} onChange={onChange} className="w-full rounded-lg border border-gray-300 px-3 py-2.5" required /></AuctionField>
            </div>
            <AuctionField label="Registration Period"><select name="registrationWindowDays" value={formData.registrationTestMinutes ? `test-${formData.registrationTestMinutes}` : formData.registrationWindowDays} onChange={onChange} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5"><option value="test-2">2 minutes (test mode)</option><option value="test-5">5 minutes (test mode)</option><option value="1">1 day</option><option value="5">5 days</option><option value="8">8 days</option><option value="10">10 days</option><option value="15">15 days</option><option value="20">20 days</option></select></AuctionField>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Current Images</label>
              <div className="grid grid-cols-3 gap-3">
                {existingImages.length ? existingImages.slice(0, MAX_EDIT_IMAGES).map((src, index) => <img key={`${src}-${index}`} src={src} alt={`current-${index + 1}`} className="h-24 w-full rounded-lg border border-gray-200 object-cover" />) : <div className="col-span-3 text-sm text-gray-500">No existing images.</div>}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Replace Images (Optional)</label>
              <label className="flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-5 transition hover:border-emerald-400 hover:bg-emerald-50">
                <ImagePlus size={24} className="mb-2 text-emerald-700" />
                <span className="text-sm font-medium text-gray-800">Upload replacement images</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={onSelectImages} />
              </label>
              {previews.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {previews.map((src, index) => (
                    <div key={`${src}-${index}`} className="relative overflow-hidden rounded-lg border border-gray-200">
                      <img src={src} alt={`new-${index + 1}`} className="h-24 w-full object-cover" />
                      <button type="button" onClick={() => removeNewImage(index)} className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"><XCircle size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button type="submit" disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 py-3 font-semibold text-white hover:bg-emerald-800 disabled:opacity-70"><Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditAuctionPage;
