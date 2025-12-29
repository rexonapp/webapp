'use client'
import { useState } from 'react';
import { Upload, X, CheckCircle, AlertCircle, MapPin, Building2, User, IndianRupee, FileText, Image as ImageIcon } from 'lucide-react';
import MapSelector from './MapSelector';
import { useRouter } from 'next/navigation';

interface WarehouseFormData {
  title: string;
  description: string;
  propertyType: string;
  totalArea: string;
  sizeUnit: 'sqft' | 'sqm';
  availableFrom: string;
  listingType: 'sale' | 'rent';
  pricePerSqFt: string;
  totalPrice: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  roadConnectivity: string;
  contactPersonName: string;
  contactPersonPhone: string;
  contactPersonEmail: string;
  contactPersonDesignation: string;
  latitude: string;
  longitude: string;
  amenities: string[];
  images: File[];
}

const PROPERTY_TYPES = [
  'Warehouse',
  'Cold Storage',
  'Industrial Shed',
  'Manufacturing Unit',
  'Godown',
  'Factory Space',
  'Logistics Hub',
  'Distribution Center'
];

const AMENITIES = [
  'Parking',
  'Security',
  'CCTV'
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Puducherry'
];

const ROAD_CONNECTIVITY = [
  'National Highway',
  'State Highway',
  'Main Road',
  'Interior Road',
  'Service Road'
];

export default function WarehouseUploadForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<WarehouseFormData>({
    title: '',
    description: '',
    propertyType: '',
    totalArea: '',
    sizeUnit: 'sqft',
    availableFrom: '',
    listingType: 'rent',
    pricePerSqFt: '',
    totalPrice: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    roadConnectivity: '',
    contactPersonName: '',
    contactPersonPhone: '',
    contactPersonEmail: '',
    contactPersonDesignation: '',
    latitude: '',
    longitude: '',
    amenities: [],
    images: [],
  });
  
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [showMap, setShowMap] = useState(false);

  const handleLocationSelect = (lat: string, lng: string) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== files.length) {
      setMessage({ type: 'error', text: 'Only image files are allowed' });
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    const oversized = imageFiles.filter(file => file.size > maxSize);
    if (oversized.length > 0) {
      setMessage({ type: 'error', text: 'Some images exceed 5MB limit' });
      return;
    }

    const previews = imageFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...previews]);
    setFormData(prev => ({ ...prev, images: [...prev.images, ...imageFiles] }));
    setMessage(null);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.title || !formData.propertyType || !formData.totalArea) {
      setMessage({ type: 'error', text: 'Please fill in all required fields marked with *' });
      return false;
    }

    if (!formData.pricePerSqFt || parseFloat(formData.pricePerSqFt) <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid price per sq.ft' });
      return false;
    }

    if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) {
      setMessage({ type: 'error', text: 'Please enter a valid 6-digit pincode' });
      return false;
    }

    if (formData.contactPersonPhone && !/^[6-9]\d{9}$/.test(formData.contactPersonPhone.replace(/\s/g, ''))) {
      setMessage({ type: 'error', text: 'Please enter a valid 10-digit Indian mobile number' });
      return false;
    }

    if (formData.images.length === 0) {
      setMessage({ type: 'error', text: 'At least one property image is required' });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    setMessage(null);

    if (!validateForm()) {
      return;
    }

    setUploading(true);

    try {
      const uploadFormData = new FormData();
      
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'images') {
          formData.images.forEach(file => {
            uploadFormData.append('images', file);
          });
        } else if (key === 'amenities') {
          uploadFormData.append('amenities', JSON.stringify(value));
        } else {
          uploadFormData.append(key, value.toString());
        }
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setMessage({ type: 'success', text: 'Property listed successfully!' });
      
      setTimeout(() => {
        router.push(`/`);
      }, 2000);

    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Upload failed. Please try again.',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <span>Home</span>
            <span className="mx-2">/</span>
            <span>My Listings</span>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Add New Property</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Add New Property</h1>
          <p className="text-gray-600">Fill in the mandatory details below to list your property on Rexon. Adding high-quality photos and details increases visibility.</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg border flex items-start space-x-3 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border-green-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            )}
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Basic Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center mr-3">
                  <FileText className="h-5 w-5 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="e.g., Green Valley Warehousing Complex"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Property Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.propertyType}
                      onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="">Select type...</option>
                      {PROPERTY_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Area <span className="text-red-500">*</span>
                    </label>
                    <div className="flex">
                      <input
                        type="number"
                        value={formData.totalArea}
                        onChange={(e) => setFormData({ ...formData, totalArea: e.target.value })}
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="0"
                      />
                      <select
                        value={formData.sizeUnit}
                        onChange={(e) => setFormData({ ...formData, sizeUnit: e.target.value as 'sqft' | 'sqm' })}
                        className="px-3 py-2.5 border-t border-r border-b border-gray-300 rounded-r-lg bg-gray-50"
                      >
                        <option value="sqft">Sq.ft</option>
                        <option value="sqm">Sq.m</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    placeholder="Provide a detailed description of your property..."
                  />
                </div>
              </div>
            </div>

            {/* Availability & Pricing */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center mr-3">
                  <IndianRupee className="h-5 w-5 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Availability & Pricing</h2>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available From <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.availableFrom}
                      onChange={(e) => setFormData({ ...formData, availableFrom: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Listing Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.listingType}
                      onChange={(e) => setFormData({ ...formData, listingType: e.target.value as 'sale' | 'rent' })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="rent">For Rent</option>
                      <option value="sale">For Sale</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price per Sq.ft <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      type="number"
                      value={formData.pricePerSqFt}
                      onChange={(e) => setFormData({ ...formData, pricePerSqFt: e.target.value })}
                      className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Price (Optional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      type="number"
                      value={formData.totalPrice}
                      onChange={(e) => setFormData({ ...formData, totalPrice: e.target.value })}
                      className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Location Details */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center mr-3">
                  <MapPin className="h-5 w-5 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Location Details</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter full street address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="e.g., Mumbai"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="">Select state</option>
                      {INDIAN_STATES.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pincode
                    </label>
                    <input
                      type="text"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="400001"
                      maxLength={6}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Road Connectivity
                    </label>
                    <select
                      value={formData.roadConnectivity}
                      onChange={(e) => setFormData({ ...formData, roadConnectivity: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="">Select road type...</option>
                      {ROAD_CONNECTIVITY.map(road => (
                        <option key={road} value={road}>{road}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Lat/Long Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Latitude
                    </label>
                    <input
                      type="text"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent "
                      placeholder="19.0760"
                      // readOnly
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Longitude
                    </label>
                    <input
                      type="text"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent "
                      placeholder="72.8777"
                      // readOnly
                    />
                  </div>
                </div>

                {/* Map Section */}
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => setShowMap(!showMap)}
                    className="mb-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center space-x-2"
                  >
                    <MapPin className="h-4 w-4" />
                    <span>{showMap ? 'Hide Map' : 'Select Location on Map'}</span>
                  </button>

                  {showMap && (
                    <MapSelector
                      latitude={formData.latitude}
                      longitude={formData.longitude}
                      onLocationSelect={handleLocationSelect}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Features & Amenities */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center mr-3">
                  <Building2 className="h-5 w-5 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Features & Amenities</h2>
                <span className="ml-auto text-sm text-gray-500">(Optional)</span>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Amenities
                </label>
                <div className="space-y-3">
                  {AMENITIES.map((amenity) => (
                    <label
                      key={amenity}
                      className="flex items-center space-x-3 cursor-pointer group"
                    >
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={() => toggleAmenity(amenity)}
                          className="peer h-5 w-5 cursor-pointer appearance-none rounded border-2 border-gray-300 checked:bg-red-600 checked:border-red-600 transition-all"
                        />
                        <svg
                          className="absolute top-0 left-0 h-5 w-5 text-white pointer-events-none hidden peer-checked:block"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                        {amenity}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center mr-3">
                  <User className="h-5 w-5 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Contact Information</h2>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.contactPersonName}
                      onChange={(e) => setFormData({ ...formData, contactPersonName: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Contact person name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.contactPersonEmail}
                      onChange={(e) => setFormData({ ...formData, contactPersonEmail: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={formData.contactPersonPhone}
                    onChange={(e) => setFormData({ ...formData, contactPersonPhone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Images & Logistics (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Property Images */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <ImageIcon className="h-5 w-5 text-red-600 mr-2" />
                  <h3 className="text-lg font-bold text-gray-900">Property Images</h3>
                  <span className="ml-auto text-xs text-red-600 font-medium">Required</span>
                </div>
                
                <div className="mb-4">
                  <label className="block w-full">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-red-500 hover:bg-red-50 transition-all">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Upload className="h-6 w-6 text-red-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Click to upload</p>
                      <p className="text-xs text-gray-500">PNG, JPG or GIF (Max 5MB)</p>
                    </div>
                  </label>
                </div>

                {imagePreviews.length > 0 && (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    <p className="text-xs text-gray-500 font-medium mb-2">
                      {imagePreviews.length} {imagePreviews.length === 1 ? 'image' : 'images'} uploaded
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-1.5 -right-1.5 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Logistics & Access */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Summary</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Property Type</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formData.propertyType || 'Not selected'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Total Area</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formData.totalArea ? `${formData.totalArea} ${formData.sizeUnit}` : 'Not set'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Road Type</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formData.roadConnectivity || 'Not specified'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600">Location</span>
                    <span className="text-xs font-mono text-gray-900">
                      {formData.latitude && formData.longitude 
                        ? '✓ Set' 
                        : 'Not set'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={uploading}
                className="w-full bg-red-600 text-white py-3.5 px-6 rounded-lg font-bold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    <span>Submit Listing</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => router.back()}
                disabled={uploading}
                className="w-full bg-white text-gray-700 py-3 px-6 rounded-lg font-medium border-2 border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}