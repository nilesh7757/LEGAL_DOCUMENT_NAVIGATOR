import React, { useState } from "react";
import { User, Mail, Key } from "lucide-react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import axios from '../api/axios'; // Import axios
import toast from 'react-hot-toast'; // Import toast

const Signup = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    password2: ''
  });
  const [loading, setLoading] = useState(false); // Add loading state

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setLoading(true);

    if (formData.password !== formData.password2) {
      toast.error("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('auth/signup/', formData); // API endpoint
      toast.success(response.data.message);
      if (response.data.requires_verification) {
        // Redirect to a verification page or show a message
        navigate('/verify-otp', { state: { email: response.data.email } }); // Redirect to OTP verification page
      } else {
        navigate('/login');
      }
    } catch (error) {
      console.error('Signup error:', error);
      console.error('Signup error details:', error.response?.data); // Log full error details
      toast.error(error.response?.data?.error || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    toast.error('Google OAuth integration is required for this feature. The current dummy token is invalid.');
    setLoading(false);
    // In a real application, you would use a Google OAuth client library
    // to get an ID token from Google, then send it to your backend.
    // For now, we'll display a message.
  };

  const handleGithubSignup = () => {
    console.log('GitHub signup clicked');
    // Here you would integrate with GitHub OAuth
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-green-100 flex items-center justify-center p-4">
      {/* AdvocAI Brand */}
      <div className="absolute top-8 left-8 text-2xl font-bold text-gray-800">
        AdvocAI
      </div>
      
      {/* Main Card */}
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/30">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
            Signup
          </h2>
          
          <div className="space-y-5">
            {/* Name Input */}
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full pl-12 pr-4 py-4 bg-gray-50/80 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* Username Input */}
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full pl-12 pr-4 py-4 bg-gray-50/80 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* Email Input */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-12 pr-4 py-4 bg-gray-50/80 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <Key className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-12 pr-4 py-4 bg-gray-50/80 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* Confirm Password Input */}
            <div className="relative">
              <Key className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                name="password2"
                placeholder="Confirm Password"
                value={formData.password2}
                onChange={handleInputChange}
                className="w-full pl-12 pr-4 py-4 bg-gray-50/80 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              signup
            </button>
          </div>

          {/* Social Sign-in Buttons */}
          <div className="grid grid-cols-1 gap-3 mt-8">
            <button
              type="button"
              onClick={handleGoogleSignup}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md group"
            >
              <div className="w-5 h-5">
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
              <span className="text-gray-700 font-medium text-sm">Signup with Google</span>
            </button>
          </div>

          <p className="text-center text-gray-600 mt-8 text-sm">
            Already have a Account?{" "}
            <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors duration-200">
              Click Here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;