import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Info, Sparkles, UploadCloud, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { createAuction, reset } from '../../redux/auctionSlice';
import { addNotification } from '../../redux/notificationSlice';

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
  'Automotive',
  'Home & Decor',
  'Industrial Equipment',
  'Other',
];

const MAX_IMAGES = 3;

const CreateAuction = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Electronics',
    startingPrice: '',
    registrationWindowDays: '1',
    registrationTestMinutes: '',
  });
  const [imageFiles, setImageFiles] = useState([]);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { isLoading } = useSelector((state) => state.auction);

  const previews = useMemo(() => imageFiles.map((file) => URL.createObjectURL(file)), [imageFiles]);

  useEffect(
    () => () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview));
    },
    [previews]
  );

  const onChange = (event) => {
    const { name, value } = event.target;
    if (name === 'registrationWindowDays') {
      if (value === 'test') {
        setFormData((prev) => ({ ...prev, registrationWindowDays: '1', registrationTestMinutes: '5' }));
        return;
      }
      setFormData((prev) => ({ ...prev, registrationWindowDays: value, registrationTestMinutes: '' }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onSelectImages = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (!selectedFiles.length) return;

    const limited = selectedFiles.slice(0, MAX_IMAGES);
    const validTypes = limited.filter((file) => file.type.startsWith('image/'));
    if (validTypes.length !== limited.length) {
      toast.error('Only image files are allowed.');
      return;
    }

    setImageFiles(validTypes);
  };

  const removeImage = (indexToRemove) => {
    setImageFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const onSubmit = (event) => {
    event.preventDefault();

    if (!user?.emailVerified) {
      toast.error('Verify your email from Profile before submitting a listing.');
      return;
    }

    if (imageFiles.length < 1 || imageFiles.length > MAX_IMAGES) {
      toast.error(`Please upload between 1 and ${MAX_IMAGES} images.`);
      return;
    }

    const payload = new FormData();
    payload.append('title', formData.title.trim());
    payload.append('description', formData.description.trim());
    payload.append('category', formData.category);
    payload.append('startingPrice', String(formData.startingPrice));
    if (formData.registrationTestMinutes) {
      payload.append('registrationWindowMinutes', String(formData.registrationTestMinutes));
    } else {
      payload.append('registrationWindowDays', String(formData.registrationWindowDays));
    }
    imageFiles.forEach((file) => payload.append('images', file));

    dispatch(createAuction(payload))
      .unwrap()
      .then(() => {
        toast.success('Listing submitted for verification');
        dispatch(addNotification({
          title: 'Listing Submitted',
          message: 'Your product was submitted for verification.',
          type: 'success',
        }));
        dispatch(reset());
        navigate('/dashboard/seller');
      })
      .catch((error) => {
        const msg = error || 'Failed to submit listing';
        toast.error(msg);
        dispatch(addNotification({
          title: 'Listing Submission Failed',
          message: msg,
          type: 'warning',
        }));
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl border border-emerald-100 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-700 to-teal-700 px-6 py-5 text-white">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles size={20} /> Submit Product Listing
            </h1>
            <p className="text-sm text-emerald-100 mt-1">
              RiZBiD will inspect and verify this product before publishing it in Future Bids.
            </p>
          </div>

          <div className="p-6 sm:p-8">
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Product Title" required>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    required
                    onChange={onChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
                  />
                </Field>

                <Field label="Category" required>
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
              </div>

              <Field label="Description" required>
                <textarea
                  name="description"
                  value={formData.description}
                  required
                  rows={5}
                  onChange={onChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
                  placeholder="Include physical condition, accessories, and known issues."
                />
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Starting Bid (USD)" required>
                  <input
                    type="number"
                    name="startingPrice"
                    value={formData.startingPrice}
                    required
                    min={1}
                    step="0.01"
                    onChange={onChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
                  />
                </Field>
                <Field label="Registration Period" required>
                  <select
                    name="registrationWindowDays"
                    value={formData.registrationTestMinutes ? 'test' : formData.registrationWindowDays}
                    onChange={onChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 bg-white"
                  >
                    <option value="test">5 minutes (test mode)</option>
                    <option value="1">1 day</option>
                    <option value="5">5 days</option>
                    <option value="8">8 days</option>
                    <option value="10">10 days</option>
                    <option value="15">15 days</option>
                    <option value="20">20 days</option>
                  </select>
                </Field>
              </div>

              <Field label="Upload Images (1 to 3)" required>
                <label className="w-full rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition">
                  <UploadCloud size={26} className="text-emerald-700 mb-2" />
                  <span className="text-sm font-medium text-gray-800">Choose images</span>
                  <span className="text-xs text-gray-500 mt-1">JPG/PNG/WebP, max 5MB each</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={onSelectImages} />
                </label>

                {previews.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    {previews.map((src, index) => (
                      <div key={`${src}-${index}`} className="relative rounded-lg overflow-hidden border border-gray-200">
                        <img src={src} alt={`preview-${index + 1}`} className="h-28 w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-black/80"
                        >
                          <XCircle size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </Field>

              <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800 flex items-start gap-2">
                <Info size={14} className="mt-0.5 shrink-0" />
                If your product is verified and sold, RiZBiD charges a 5% commission on the winning amount.
              </div>

              <button
                type="submit"
                disabled={isLoading || !user?.emailVerified}
                className="w-full rounded-lg bg-emerald-700 text-white font-semibold py-3 hover:bg-emerald-800 disabled:opacity-60"
              >
                {isLoading ? 'Submitting...' : 'Submit for Verification'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label}
      {required ? <span className="text-red-500 ml-1">*</span> : null}
    </label>
    {children}
  </div>
);

export default CreateAuction;
