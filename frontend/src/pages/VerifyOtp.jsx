import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import toast from 'react-hot-toast';

const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email; // Get email from signup redirect
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  if (!email) {
    // If no email is passed, redirect to signup or login
    toast.error('No email provided for OTP verification. Please sign up again.');
    navigate('/signup');
    return null;
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('auth/verify-otp/', { email, otp_code: otp });
      toast.success(response.data.message);
      // Assuming successful verification leads to login or home
      navigate('/login'); // Or navigate to home if tokens are returned and handled
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error(error.response?.data?.error || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const response = await axios.post('auth/resend-otp/', { email });
      toast.success(response.data.message);
    } catch (error) {
      console.error('Resend OTP error:', error);
      toast.error(error.response?.data?.error || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/30">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
            Verify OTP
          </h2>
          <p className="text-center text-gray-600 mb-6">
            An OTP has been sent to <span className="font-semibold">{email}</span>. Please enter it below to verify your account.
          </p>
          
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              maxLength="6"
              className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-gray-700 placeholder-gray-400 text-center text-xl tracking-widest"
              required
            />
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify Account'}
            </button>
          </form>

          <div className="text-center mt-6">
            <button
              onClick={handleResendOtp}
              disabled={loading}
              className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Resend OTP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
