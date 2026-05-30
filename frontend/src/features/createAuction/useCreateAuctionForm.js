import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { createAuction, reset } from '../../redux/auctionSlice';
import { addNotification } from '../../redux/notificationSlice';

export const MAX_AUCTION_IMAGES = 3;

export const useCreateAuctionForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Electronics',
    startingPrice: '',
    registrationWindowDays: '1',
    registrationTestMinutes: '',
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [turnstileToken, setTurnstileToken] = useState('');
  const turnstileRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { isLoading } = useSelector((state) => state.auction);
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  const previews = useMemo(() => imageFiles.map((file) => URL.createObjectURL(file)), [imageFiles]);
  useEffect(() => () => previews.forEach((preview) => URL.revokeObjectURL(preview)), [previews]);

  const onChange = (event) => {
    const { name, value } = event.target;
    if (name === 'registrationWindowDays') {
      if (value === 'test-2' || value === 'test-5') {
        setFormData((prev) => ({ ...prev, registrationWindowDays: '1', registrationTestMinutes: value === 'test-2' ? '2' : '5' }));
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
    const limited = selectedFiles.slice(0, MAX_AUCTION_IMAGES);
    const validTypes = limited.filter((file) => file.type.startsWith('image/'));
    if (validTypes.length !== limited.length) {
      toast.error('Only image files are allowed.');
      return;
    }
    setImageFiles(validTypes);
  };

  const removeImage = (indexToRemove) => setImageFiles((prev) => prev.filter((_, index) => index !== indexToRemove));

  const onSubmit = (event) => {
    event.preventDefault();
    if (!user?.emailVerified) {
      toast.error('Verify your profile from the Profile page before submitting a listing.');
      return;
    }
    if (imageFiles.length < 1 || imageFiles.length > MAX_AUCTION_IMAGES) {
      toast.error(`Please upload between 1 and ${MAX_AUCTION_IMAGES} images.`);
      return;
    }
    if (!turnstileToken) {
      toast.error('Please complete the human verification challenge.');
      return;
    }

    const payload = new FormData();
    payload.append('title', formData.title.trim());
    payload.append('description', formData.description.trim());
    payload.append('category', formData.category);
    payload.append('startingPrice', String(formData.startingPrice));
    if (formData.registrationTestMinutes) payload.append('registrationWindowMinutes', String(formData.registrationTestMinutes));
    else payload.append('registrationWindowDays', String(formData.registrationWindowDays));
    payload.append('turnstileToken', turnstileToken);
    imageFiles.forEach((file) => payload.append('images', file));

    dispatch(createAuction(payload))
      .unwrap()
      .then(() => {
        toast.success('Listing submitted for verification');
        dispatch(addNotification({ title: 'Listing Submitted', message: 'Your product was submitted for verification.', type: 'success' }));
        dispatch(reset());
        navigate('/dashboard/seller');
      })
      .catch((error) => {
        setTurnstileToken('');
        turnstileRef.current?.reset();
        const message = error || 'Failed to submit listing';
        toast.error(message);
        dispatch(addNotification({ title: 'Listing Submission Failed', message, type: 'warning' }));
      });
  };

  return {
    formData,
    imageFiles,
    turnstileToken,
    setTurnstileToken,
    turnstileRef,
    turnstileSiteKey,
    user,
    isLoading,
    previews,
    onChange,
    onSelectImages,
    removeImage,
    onSubmit,
  };
};
