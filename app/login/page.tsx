"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/utils/apiClient';
import Image from 'next/image';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    farmName: '',
    mainCrop: '',
    farmSizeHectares: '',
    latitude: '',
    longitude: '',
    locationName: '',
    organicOnly: false,
    voiceModeEnabled: true,
    role: 'user'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      // Convert form data to match backend expectations
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : {
            email: formData.email,
            password: formData.password,
            firstName: formData.firstName,
            lastName: formData.lastName,
            farmName: formData.farmName || null,
            mainCrop: formData.mainCrop || null,
            farmSizeHectares: formData.farmSizeHectares ? parseFloat(formData.farmSizeHectares) : null,
            latitude: formData.latitude ? parseFloat(formData.latitude) : null,
            longitude: formData.longitude ? parseFloat(formData.longitude) : null,
            locationName: formData.locationName || null,
            organicOnly: formData.organicOnly,
            voiceModeEnabled: formData.voiceModeEnabled,
            role: formData.role,
          };
      const data = await apiClient.post<{access_token: string, user: any}>(endpoint, payload);
      
      if (data) {
        console.log('Login successful, data:', data);
        login(data.access_token, data.user);
        
        console.log('Redirecting to dashboard...');
        router.push('/');
      } else {
        console.log('Login failed:', data);
        setError((data as any).message || 'An error occurred');
      }
    } catch (err) {
      console.log('Login failed:', err);
      setError(err instanceof Error ? err.message : 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Dark Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800 animate-gradient"></div>
      
      {/* Floating Orbs - Dark Theme */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-gray-700 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-40 right-20 w-72 h-72 bg-gray-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-gray-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Glassmorphism Container */}
      <div className="max-w-md w-full relative z-10">
        <div className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 space-y-8">
          {/* Logo & Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30 shadow-lg transform hover:scale-105 transition-all duration-300">
                <Image
                  src="/logo.png"
                  alt="Company Logo"
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </div>
            </div>
            <h2 className="text-4xl font-bold text-white tracking-tight">
              {isLogin ? 'Welcome Back' : 'Join Us'}
            </h2>
            <p className="text-sm text-white/80">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="cursor-pointer font-semibold text-gray-300 hover:text-white transition-colors duration-200 underline underline-offset-4"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
          
          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/20 backdrop-blur-xl border border-red-300/30 text-red-100 px-4 py-3 rounded-xl animate-shake">
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              {/* Email Input with Floating Label */}
              <div className="floating-input-container">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="floating-input"
                  placeholder=" "
                />
                <label htmlFor="email" className="floating-label">
                  Email address
                </label>
              </div>

              {/* Password Input with Floating Label */}
              <div className="floating-input-container">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  className="floating-input"
                  placeholder=" "
                />
                <label htmlFor="password" className="floating-label">
                  Password
                </label>
              </div>

              {/* Signup Fields */}
              {!isLogin && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="floating-input-container">
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                        className="floating-input"
                        placeholder=" "
                      />
                      <label htmlFor="firstName" className="floating-label">
                        First Name
                      </label>
                    </div>
                    <div className="floating-input-container">
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={handleChange}
                        className="floating-input"
                        placeholder=" "
                      />
                      <label htmlFor="lastName" className="floating-label">
                        Last Name
                      </label>
                    </div>
                  </div>

                  {/* Farm Profile Section */}
                  <div className="border-t border-white/20 pt-4 mt-4">
                    <h3 className="text-white font-semibold mb-4 text-sm">Farm Profile</h3>
                    
                    <div className="floating-input-container">
                      <input
                        id="farmName"
                        name="farmName"
                        type="text"
                        value={formData.farmName}
                        onChange={handleChange}
                        className="floating-input"
                        placeholder=" "
                      />
                      <label htmlFor="farmName" className="floating-label">
                        Farm Name (optional)
                      </label>
                    </div>

                    <div className="floating-input-container mt-4">
                      <input
                        id="mainCrop"
                        name="mainCrop"
                        type="text"
                        value={formData.mainCrop}
                        onChange={handleChange}
                        className="floating-input"
                        placeholder=" "
                      />
                      <label htmlFor="mainCrop" className="floating-label">
                        Main Crop (optional)
                      </label>
                    </div>

                    <div className="floating-input-container mt-4">
                      <input
                        id="farmSizeHectares"
                        name="farmSizeHectares"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.farmSizeHectares}
                        onChange={handleChange}
                        className="floating-input"
                        placeholder=" "
                      />
                      <label htmlFor="farmSizeHectares" className="floating-label">
                        Farm Size (Hectares) (optional)
                      </label>
                    </div>
                  </div>

                  {/* Location Section */}
                  <div className="border-t border-white/20 pt-4 mt-4">
                    <h3 className="text-white font-semibold mb-4 text-sm">Location</h3>
                    
                    <div className="floating-input-container">
                      <input
                        id="locationName"
                        name="locationName"
                        type="text"
                        value={formData.locationName}
                        onChange={handleChange}
                        className="floating-input"
                        placeholder=" "
                      />
                      <label htmlFor="locationName" className="floating-label">
                        Location Name (e.g., Limpopo, SA) (optional)
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div className="floating-input-container">
                        <input
                          id="latitude"
                          name="latitude"
                          type="number"
                          step="0.000001"
                          value={formData.latitude}
                          onChange={handleChange}
                          className="floating-input"
                          placeholder=" "
                        />
                        <label htmlFor="latitude" className="floating-label">
                          Latitude (optional)
                        </label>
                      </div>
                      <div className="floating-input-container">
                        <input
                          id="longitude"
                          name="longitude"
                          type="number"
                          step="0.000001"
                          value={formData.longitude}
                          onChange={handleChange}
                          className="floating-input"
                          placeholder=" "
                        />
                        <label htmlFor="longitude" className="floating-label">
                          Longitude (optional)
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Preferences Section */}
                  <div className="border-t border-white/20 pt-4 mt-4">
                    <h3 className="text-white font-semibold mb-4 text-sm">Preferences</h3>
                    
                    <div className="flex items-center gap-3 mb-4">
                      <input
                        id="organicOnly"
                        name="organicOnly"
                        type="checkbox"
                        checked={formData.organicOnly}
                        onChange={handleChange}
                        className="w-5 h-5 rounded border-white/30 bg-white/10 text-purple-600 focus:ring-purple-500 focus:ring-2"
                      />
                      <label htmlFor="organicOnly" className="text-white text-sm cursor-pointer">
                        Organic Only
                      </label>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        id="voiceModeEnabled"
                        name="voiceModeEnabled"
                        type="checkbox"
                        checked={formData.voiceModeEnabled}
                        onChange={handleChange}
                        className="w-5 h-5 rounded border-white/30 bg-white/10 text-purple-600 focus:ring-purple-500 focus:ring-2"
                      />
                      <label htmlFor="voiceModeEnabled" className="text-white text-sm cursor-pointer">
                        Enable Voice Mode (default: enabled)
                      </label>
                    </div>
                  </div>

                  <div className="floating-input-container">
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="floating-input"
                    >
                      <option value="user" className="bg-gray-900">User</option>
                      <option value="manager" className="bg-gray-900">Manager</option>
                      <option value="admin" className="bg-gray-900">Admin</option>
                    </select>
                    <label htmlFor="role" className="floating-label-select">
                      Role
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="cursor-pointer group relative w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent text-base font-bold rounded-xl text-white bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 hover:from-gray-600 hover:via-gray-500 hover:to-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl shadow-lg"
              >
                {loading && (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                <span>{loading ? 'Please wait...' : (isLogin ? 'Sign in' : 'Create Account')}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        /* Floating Label Container */
        .floating-input-container {
          position: relative;

        }

        /* Floating Input Styles */
        .floating-input {
          width: 100%;
          padding: 0.75rem 1rem;
          background: none;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 0.75rem;
          color: white;
          font-size: 1rem;
          outline: none;
          transition: all 0.3s ease;
        }

        .floating-input:hover {
          
        }

        .floating-input:focus {
          border-color: rgba(156, 163, 175, 0.8);
          box-shadow: 0 0 0 2px rgba(156, 163, 175, 0.4);
        }

        /* Floating Label Styles - Positioned OUTSIDE the input */
        .floating-label {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255, 255, 255, 0.6);
          font-size: 1rem;
          font-weight: 500;
          pointer-events: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: transparent;
          padding: 0 0.25rem;
        }

        /* Label moves ABOVE the input box when focused or filled */
        .floating-input:focus ~ .floating-label,
        .floating-input:not(:placeholder-shown) ~ .floating-label {
          top: 0;
          left: 0.75rem;
          transform: translateY(-90%) scale(0.85);
          color: rgba(255, 255, 255, 0.9);
          font-weight: 600;
         
          padding: 0 0.5rem;
        }

        /* Special handling for select elements - label always stays above */
        .floating-label-select {
          position: absolute;
          left: 0.75rem;
          top: 0;
          transform: translateY(-50%) scale(0.85);
          color: rgba(255, 255, 255, 0.9);
          font-size: 1rem;
          font-weight: 600;
          pointer-events: none;
          background: linear-gradient(to bottom, transparent 40%, rgba(0, 0, 0, 0.8) 40%, rgba(0, 0, 0, 0.8) 60%, transparent 60%);
          padding: 0 0.5rem;
        }

        select.floating-input {
          cursor: pointer;
        }

        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes blob {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-5px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(5px);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 15s ease infinite;
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-shake {
          animation: shake 0.5s;
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
