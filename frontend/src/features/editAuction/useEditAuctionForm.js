/**
 * Module: features/editAuction/useEditAuctionForm.js
 * Purpose: Contains the state, effects, and event handlers that drive the use Edit Auction Form flow.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import axios from '../../utils/axiosConfig';

export const MAX_EDIT_IMAGES = 3;

export const useEditAuctionForm = () => {
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
    startingPrice: '',
    registrationWindowDays: '1',
    registrationTestMinutes: '',
  });

  const previews = useMemo(() => newImageFiles.map((file) => URL.createObjectURL(file)), [newImageFiles]);
  useEffect(() => () => previews.forEach((preview) => URL.revokeObjectURL(preview)), [previews]);

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
        const testMinutes = (auction.registrationWindowHours || 24) < 1 ? String(Math.round((auction.registrationWindowHours || 24) * 60)) : '';
        setFormData({
          title: auction.title || '',
          description: auction.description || '',
          category: auction.category || 'Electronics',
          startingPrice: String(auction.startingPrice || ''),
          registrationWindowDays: String(Math.round((auction.registrationWindowHours || 24) / 24)),
          registrationTestMinutes: testMinutes === '2' || testMinutes === '5' ? testMinutes : '',
        });
        setExistingImages(auction.images || []);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load listing');
      } finally {
        setLoading(false);
      }
    };
    if (user?._id) fetchAuction();
  }, [id, navigate, user?._id]);

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
    const selected = Array.from(event.target.files || []).slice(0, MAX_EDIT_IMAGES);
    if (!selected.length) return;
    if (!selected.every((file) => file.type.startsWith('image/'))) {
      toast.error('Only image files are allowed.');
      return;
    }
    setNewImageFiles(selected);
  };

  const removeNewImage = (indexToRemove) => setNewImageFiles((prev) => prev.filter((_, index) => index !== indexToRemove));

  const onSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = new FormData();
      payload.append('title', formData.title.trim());
      payload.append('description', formData.description.trim());
      payload.append('category', formData.category);
      payload.append('startingPrice', formData.startingPrice);
      if (formData.registrationTestMinutes) payload.append('registrationWindowMinutes', formData.registrationTestMinutes);
      else payload.append('registrationWindowDays', formData.registrationWindowDays);
      newImageFiles.forEach((file) => payload.append('images', file));
      await axios.put(`/auctions/${id}`, payload, { headers: { Authorization: `Bearer ${user.token}` } });
      toast.success('Listing updated');
      navigate('/dashboard/seller');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return {
    loading,
    saving,
    existingImages,
    formData,
    previews,
    onChange,
    onSelectImages,
    removeNewImage,
    onSubmit,
  };
};
