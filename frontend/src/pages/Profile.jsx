import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { User, Mail, Shield, Calendar, FileText, MapPin, CheckCircle, Save, X } from 'lucide-react';
import { updateProfile } from '../redux/authSlice';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, isLoading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  
  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  if (!user) return <div className="p-10 text-center">Please log in.</div>;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateProfile(formData))
      .unwrap()
      .then(() => {
        toast.success("Profile updated successfully!");
        setIsEditing(false);
      })
      .catch((err) => {
        toast.error(err || "Failed to update profile");
      });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="h-32 bg-gradient-to-r from-bid-purple to-indigo-600"></div>
        <div className="px-8 pb-8 relative">
          
          {/* Avatar (Absolute Position) */}
          <div className="absolute -top-12 left-8">
            <div className="h-24 w-24 bg-white rounded-full p-1 shadow-lg">
              <div className="h-full w-full bg-slate-100 rounded-full flex items-center justify-center text-3xl font-bold text-gray-400">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
          
          {/* Info Section */}
          <div className="mt-14 ml-32 flex justify-between items-end">
            <div>
              {/* EDIT MODE TOGGLE: Show Input or Text */}
              {isEditing ? (
                 <div className="flex flex-col gap-2">
                    <input 
                      type="text" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange}
                      className="border border-gray-300 rounded px-2 py-1 text-sm font-bold"
                    />
                    <input 
                      type="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleChange}
                      className="border border-gray-300 rounded px-2 py-1 text-xs text-gray-600"
                    />
                 </div>
              ) : (
                 <>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      {user.name} 
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <Shield size={12} /> Verified
                      </span>
                    </h1>
                    <p className="text-gray-500 flex items-center gap-2 mt-1">
                      <Mail size={14} /> {user.email}
                    </p>
                 </>
              )}
            </div>

            {/* ACTION BUTTONS */}
            <div>
                {isEditing ? (
                    <div className="flex gap-2">
                        <button 
                          onClick={handleSubmit} 
                          disabled={isLoading}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition flex items-center gap-2"
                        >
                            <Save size={16} /> Save
                        </button>
                        <button 
                          onClick={() => setIsEditing(false)} 
                          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition flex items-center gap-2"
                        >
                            <X size={16} /> Cancel
                        </button>
                    </div>
                ) : (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                    >
                      Edit Profile
                    </button>
                )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Personal Details */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Personal Information</h2>
          
          <div className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="text-xs text-gray-400 uppercase font-semibold">User Role</label>
                   <p className="text-gray-900 font-medium capitalize flex items-center gap-2">
                     <User size={16} className="text-bid-purple" /> {user.role}
                   </p>
                </div>
                <div>
                   <label className="text-xs text-gray-400 uppercase font-semibold">Joined Date</label>
                   <p className="text-gray-900 font-medium flex items-center gap-2">
                     <Calendar size={16} className="text-bid-purple" /> 
                     {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                   </p>
                </div>
             </div>

             <div className="pt-4 border-t border-gray-50">
                 <label className="text-xs text-gray-400 uppercase font-semibold">ID Verification</label>
                 <div className="mt-2 flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <FileText className="text-gray-500" />
                    <div>
                        <p className="text-sm font-bold text-gray-800">
                            {user.idType ? user.idType.toUpperCase() : "NID"} Provided
                        </p>
                        <p className="text-xs text-gray-500">
                            ID: {user.idNumber || "••••••••••"}
                        </p>
                    </div>
                    <div className="ml-auto text-green-600">
                        <CheckCircle size={20} />
                    </div>
                 </div>
             </div>
          </div>
        </div>

        {/* Sidebar Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Reputation</h3>
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Feedback Score</span>
                    <span className="font-bold text-green-600">100%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full w-full"></div>
                </div>
                <div className="flex justify-between items-center pt-2">
                    <span className="text-gray-600 text-sm">Location</span>
                    <span className="text-sm font-medium flex items-center gap-1">
                        <MapPin size={14} /> Bangladesh
                    </span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;