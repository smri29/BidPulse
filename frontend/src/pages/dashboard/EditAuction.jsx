import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../utils/axiosConfig';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const EditAuction = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    currentPrice: '',
    endTime: '',
    imageUrl: ''
  });
  const [loading, setLoading] = useState(true);

  // 1. Fetch existing data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/auctions/${id}`);
        const data = res.data;
        
        // Check ownership
        if (data.seller._id !== user._id && data.seller !== user._id) {
            toast.error("Unauthorized");
            navigate('/');
            return;
        }

        setFormData({
            title: data.title,
            description: data.description,
            category: data.category,
            currentPrice: data.currentPrice,
            // Format date for input field (YYYY-MM-DDThh:mm)
            endTime: new Date(data.endTime).toISOString().slice(0, 16),
            imageUrl: data.images[0] || ''
        });
        setLoading(false);
      } catch (err) {
        toast.error("Error loading auction");
      }
    };
    fetchData();
  }, [id, user, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
        // We use direct Axios here since we didn't make a Redux action for 'update' yet
        const config = {
            headers: { Authorization: `Bearer ${user.token}` }
        };
        
        // Only send fields we want to update
        const updateData = {
            title: formData.title,
            description: formData.description,
            category: formData.category,
            endTime: formData.endTime,
            images: [formData.imageUrl] 
        };

        await axios.put(`/auctions/${id}`, updateData, config);
        toast.success("Auction Updated!");
        navigate('/dashboard/seller');
    } catch (error) {
        toast.error(error.response?.data?.message || "Update failed");
    }
  };

  if(loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-xl shadow-lg mt-10">
      <h2 className="text-2xl font-bold mb-6">Edit Listing</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input 
            type="text" 
            value={formData.title} 
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full border p-2 rounded" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea 
            rows="4"
            value={formData.description} 
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full border p-2 rounded" 
          />
        </div>
        <div>
           <label className="block text-sm font-medium">Category</label>
           <select 
             value={formData.category} 
             onChange={(e) => setFormData({...formData, category: e.target.value})} 
             className="w-full border p-2 rounded"
           >
               <option>Electronics</option>
               <option>Fashion</option>
               <option>Art</option>
               <option>Automotive</option>
               <option>Real Estate</option>
           </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Image URL</label>
          <input 
            type="url" 
            value={formData.imageUrl} 
            onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
            className="w-full border p-2 rounded" 
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
            Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditAuction;