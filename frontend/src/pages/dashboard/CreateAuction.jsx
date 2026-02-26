import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createAuction, reset } from '../../redux/auctionSlice';
import { toast } from 'react-toastify';
import { Sparkles } from 'lucide-react';

const CATEGORY_OPTIONS = [
  'Electronics',
  'Smartphones & Tablets',
  'Computers & Accessories',
  'Gaming',
  'Fashion',
  'Sneakers',
  'Luxury Watches',
  'Jewelry',
  'Art & Collectibles',
  'Trading Cards',
  'Books & Manuscripts',
  'Music Instruments',
  'Automotive',
  'Motorcycles',
  'Home & Decor',
  'Antiques',
  'Real Estate',
  'Industrial Equipment',
  'Sports Memorabilia',
  'Other',
];

const CreateAuction = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Electronics',
    startingPrice: '',
    endTime: '',
    imageUrl: '',
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { isLoading } = useSelector((state) => state.auction);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!user?.emailVerified) {
      toast.error('Verify your email from Profile before creating an auction.');
      return;
    }

    const auctionData = {
      ...formData,
      images: [formData.imageUrl],
    };

    dispatch(createAuction(auctionData))
      .unwrap()
      .then(() => {
        toast.success('Auction Created Successfully!');
        navigate('/dashboard/seller');
        dispatch(reset());
      })
      .catch((error) => {
        toast.error(error);
      });
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white/85 backdrop-blur-xl rounded-2xl shadow-lg mt-10 border border-white animate-fade-up">
      <h2 className="text-2xl font-bold mb-2 text-gray-800 flex items-center gap-2">
        <Sparkles size={20} className="text-bid-purple" /> Create New Listing
      </h2>
      <p className="text-sm text-gray-500 mb-6">High-quality listings get better conversion and stronger bids.</p>

      {!user?.emailVerified && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 p-3 text-sm">
          Your email is not verified. Please verify from your profile to list items.
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Item Title</label>
          <input type="text" name="title" required onChange={onChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-bid-purple focus:ring-bid-purple border p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea name="description" required onChange={onChange} rows="4" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-bid-purple focus:ring-bid-purple border p-2"></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select name="category" onChange={onChange} className="mt-1 block w-full rounded-md border-gray-300 border p-2">
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Starting Price ($)</label>
            <input type="number" name="startingPrice" required onChange={onChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" min="1" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">End Date & Time</label>
          <input type="datetime-local" name="endTime" required onChange={onChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Image URL</label>
          <input type="url" name="imageUrl" placeholder="https://example.com/image.jpg" required onChange={onChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
        </div>

        <button type="submit" disabled={isLoading || !user?.emailVerified} className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-bid-purple hover:bg-indigo-700 disabled:opacity-60">
          {isLoading ? 'Creating...' : 'Launch Auction'}
        </button>
      </form>
    </div>
  );
};

export default CreateAuction;
