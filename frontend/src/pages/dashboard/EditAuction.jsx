import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ImagePlus, Save, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import axios from '../../utils/axiosConfig';

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

const MAX_IMAGES = 3;

const EditAuction = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingImages, setExistingImages] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Electronics',
    endTime: '',
  });

  const previews = useMemo(() => newImageFiles.map((file) => URL.createObjectURL(file)), [newImageFiles]);

  useEffect(
    () => () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview));
    },
    [previews]
  );

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const response = await axios.get(`/auctions/${id}`);
        const auction = response.data;

        if (auction.seller?._id !== user?._id && auction.seller !== user?._id) {
          toast.error('Unauthorized');
          navigate('/dashboard/seller');
          return;
        }

        setFormData({
          title: auction.title || '',
          description: auction.description || '',
          category: auction.category || 'Electronics',
          endTime: auction.endTime ? new Date(auction.endTime).toISOString().slice(0, 16) : '',
        });
        setExistingImages(auction.images || []);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load auction');
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) fetchAuction();
  }, [id, navigate, user?._id]);

  const onChange = (event) => {
    setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onSelectImages = (event) => {
    const selected = Array.from(event.target.files || []).slice(0, MAX_IMAGES);
    if (!selected.length) return;
    if (!selected.every((file) => file.type.startsWith('image/'))) {
      toast.error('Only image files are allowed.');
      return;
    }
    setNewImageFiles(selected);
  };

  const removeNewImage = (indexToRemove) => {
    setNewImageFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = new FormData();
      payload.append('title', formData.title.trim());
      payload.append('description', formData.description.trim());
      payload.append('category', formData.category);
      payload.append('endTime', formData.endTime);
      newImageFiles.forEach((file) => payload.append('images', file));

      await axios.put(`/auctions/${id}`, payload, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      toast.success('Auction updated');
      navigate('/dashboard/seller');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl border border-emerald-100 shadow-xl p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Auction Listing</h1>

          <form onSubmit={onSubmit} className="space-y-5">
            <Field label="Item Title">
              <input
                name="title"
                value={formData.title}
                onChange={onChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
                required
              />
            </Field>

            <Field label="Description">
              <textarea
                name="description"
                value={formData.description}
                onChange={onChange}
                rows={5}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
                required
              />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Category">
                <select
                  name="category"
                  value={formData.category}
                  onChange={onChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 bg-white"
                >
                  {CATEGORY_OPTIONS.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="End Date & Time">
                <input
                  type="datetime-local"
                  name="endTime"
                  value={formData.endTime}
                  onChange={onChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
                  required
                />
              </Field>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Images</label>
              <div className="grid grid-cols-3 gap-3">
                {existingImages.length ? (
                  existingImages.slice(0, MAX_IMAGES).map((src, index) => (
                    <img key={`${src}-${index}`} src={src} alt={`current-${index + 1}`} className="h-24 w-full object-cover rounded-lg border border-gray-200" />
                  ))
                ) : (
                  <div className="col-span-3 text-sm text-gray-500">No existing images.</div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Replace Images (Optional, max 3)</label>
              <label className="w-full rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-5 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition">
                <ImagePlus size={24} className="text-emerald-700 mb-2" />
                <span className="text-sm font-medium text-gray-800">Upload replacement images</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={onSelectImages} />
              </label>
              {previews.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-3">
                  {previews.map((src, index) => (
                    <div key={`${src}-${index}`} className="relative rounded-lg overflow-hidden border border-gray-200">
                      <img src={src} alt={`new-${index + 1}`} className="h-24 w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-black/80"
                      >
                        <XCircle size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-emerald-700 text-white font-semibold py-3 hover:bg-emerald-800 disabled:opacity-70 inline-flex justify-center items-center gap-2"
            >
              <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
    {children}
  </div>
);

export default EditAuction;
