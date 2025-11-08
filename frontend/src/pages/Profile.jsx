import React, { useState, useEffect } from "react";
import { User, Mail, Phone, Camera } from "lucide-react"; // Added Camera icon
import { useAuth } from '../context/AuthContext'; // Corrected import path
import toast from 'react-hot-toast';
import axios from '../api/axios'; // Import axios for API calls

const Profile = () => {
  const { user, loading, setUser } = useAuth(); // Use setUser from AuthContext
  const [profileData, setProfileData] = useState({
    name: '',
    username: '',
    email: '',
    profile_picture: '', // To store current profile picture URL
    new_profile_picture: null, // To store the new file object
  });
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        username: user.username || '',
        email: user.email || '',
        profile_picture: user.profile_picture || '',
        new_profile_picture: null,
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setProfileData({
      ...profileData,
      new_profile_picture: e.target.files[0]
    });
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', profileData.name);
      if (profileData.new_profile_picture) {
        formData.append('profile_picture', profileData.new_profile_picture);
      }

      const response = await axios.patch('auth/profile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success('Profile updated successfully!');
      setUser(response.data); // Update user in AuthContext
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error(error.response?.data?.error || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-blue-50 to-green-100">
        <p className="text-lg text-gray-700">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-blue-50 to-green-100">
        <p className="text-lg text-red-500">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-green-100">
      {/* Main Content */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-4xl">
          {/* Profile Avatar */}
          <div className="flex justify-center mb-8 relative">
            <div className="w-32 h-32 rounded-full flex items-center justify-center shadow-xl overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700">
              {profileData.profile_picture ? (
                <img src={profileData.profile_picture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-4xl font-bold">
                  {getInitials(profileData.name || profileData.username)}
                </span>
              )}
            </div>
            {isEditing && (
              <label htmlFor="profile-picture-upload" className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-md">
                <Camera className="w-5 h-5 text-white" />
                <input
                  id="profile-picture-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            )}
          </div>

          {/* Profile Information Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/30">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-800">
                Personal Information
              </h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            <div className="space-y-6">
              {/* Full Name */}
              <div className="bg-gray-50/80 rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <label className="text-gray-500 text-sm font-medium mb-1 block">Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={profileData.name}
                        onChange={handleInputChange}
                        className="w-full text-lg font-semibold text-gray-800 bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none transition-colors duration-200"
                      />
                    ) : (
                      <div className="text-lg font-semibold text-gray-800">{profileData.name || 'N/A'}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Username (Read-only) */}
              <div className="bg-gray-50/80 rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <label className="text-gray-500 text-sm font-medium mb-1 block">User Name</label>
                    <div className="text-lg font-semibold text-gray-800">{profileData.username || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Email (Read-only) */}
              <div className="bg-gray-50/80 rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <label className="text-gray-500 text-sm font-medium mb-1 block">Email</label>
                    <div className="text-lg font-semibold text-gray-800">{profileData.email || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Phone - Placeholder for future (Read-only) */}
              <div className="bg-gray-50/80 rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <Phone className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <label className="text-gray-500 text-sm font-medium mb-1 block">Phone</label>
                    <div className="text-lg font-semibold text-gray-800">{profileData.phone || 'N/A'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            {isEditing && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;