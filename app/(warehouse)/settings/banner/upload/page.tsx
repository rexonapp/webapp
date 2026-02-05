'use client'
import React, { useState, useEffect } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Loader, ImageIcon, User } from 'lucide-react';

export default function BannerUploadAdmin() {
  const [bannerImages, setBannerImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<{ userId: number | null; isLoggedIn: boolean }>({ 
    userId: null, 
    isLoggedIn: false 
  });

  useEffect(() => {
    fetchBannerImages();
  }, []);

  const fetchBannerImages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/banner-images');
      
      if (response.status === 401) {
        showMessage('error', 'Please log in to view your banner images');
        setUserInfo({ userId: null, isLoggedIn: false });
        setLoading(false);
        return;
      }

      const data = await response.json();
      
      if (response.ok) {
        setBannerImages(data.images || []);
        setUserInfo({ 
          userId: data.userId || null, 
          isLoggedIn: true 
        });
      } else {
        showMessage('error', data.error || 'Failed to load banner images');
      }
    } catch (error) {
      showMessage('error', 'Failed to load banner images');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: any, text: any) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleFileSelect = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showMessage('error', 'Please select a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showMessage('error', 'Image size should be less than 5MB');
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showMessage('error', 'Please select an image first');
      return;
    }

    if (!userInfo.isLoggedIn) {
      showMessage('error', 'Please log in to upload banner images');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/banner-images', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('success', 'Banner image uploaded successfully!');
        setSelectedFile(null);
        setPreviewUrl(null);
        fetchBannerImages();
      } else {
        showMessage('error', data.error || 'Upload failed');
      }
    } catch (error) {
      showMessage('error', 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  // Show login message if not authenticated
  if (!loading && !userInfo.isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-6">
            Please log in to access the banner image management system.
          </p>
          <a
            href="/login"
            className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Banner Image Management
              </h1>
              <p className="text-gray-600">
                Upload and manage your personal banner images for the homepage hero section
              </p>
            </div>
            {/* {userInfo.userId && (
              <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
                <User className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  User ID: {userInfo.userId}
                </span>
              </div>
            )} */}
          </div>
        </div>

        {/* Alert Messages */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Upload New Banner
          </h2>

          {/* File Input */}
          <div className="mb-6">
            <label className="block">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-red-400 hover:bg-red-50 transition-all duration-300">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium mb-2">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-gray-500">
                  JPG, PNG or WebP (max. 5MB)
                </p>
              </div>
            </label>
          </div>

          {/* Preview */}
          {previewUrl && (
            <div className="mb-6">
              <div className="relative rounded-xl overflow-hidden border-2 border-gray-200">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-64 object-cover"
                />
                <button
                  onClick={clearSelection}
                  className="absolute top-4 right-4 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                >
                  <X className="w-5 h-5 text-gray-700" />
                </button>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <ImageIcon className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-600 font-medium">
                  {selectedFile?.name}
                </span>
                <span className="text-sm text-gray-500">
                  ({selectedFile && (selectedFile.size / 1024).toFixed(1)} KB)
                </span>
              </div>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 ${
              !selectedFile || uploading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-xl'
            }`}
          >
            {uploading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Upload Banner Image
              </>
            )}
          </button>
        </div>

        {/* Current Banners */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Your Banner Images
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 text-red-600 animate-spin" />
            </div>
          ) : bannerImages.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="font-medium">No banner images found</p>
              <p className="text-sm">Upload your first banner to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bannerImages.map((image, index) => (
                <div
                  key={index}
                  className="relative group rounded-xl overflow-hidden border-2 border-gray-200 hover:border-red-400 transition-all duration-300 shadow-md hover:shadow-xl"
                >
                  <img
                    src={image}
                    alt={`Banner ${index + 1}`}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                    <span className="text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      Banner {index + 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Guidelines */}
          <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
            <h3 className="font-bold text-blue-900 mb-3">Image Guidelines</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Recommended dimensions: 1920x1080 (16:9 ratio)</li>
              <li>• Maximum file size: 5MB</li>
              <li>• Supported formats: JPEG, PNG, WebP</li>
              <li>• Use high-quality images of commercial properties</li>
              {/* <li>• Images are stored in your personal folder (banners/{userInfo.userId}/)</li> */}
              <li>• Images will auto-rotate every 5 seconds on homepage</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}