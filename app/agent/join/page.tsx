'use client'
import { useState } from 'react';
import { Upload, X, CheckCircle, AlertCircle, User, Mail, Phone, Building2, Award, MapPin, FileText, Briefcase } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AgentFormData {
  // Personal Information
  fullName: string;
  dateOfBirth: string;
  gender: string;
  
  // Contact Information
  primaryPhone: string;
  secondaryPhone: string;
  email: string;
  whatsappNumber: string;
  
  // Address Information
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  
  // Professional Information
  agencyName: string;
  licenseNumber: string;
  experienceYears: string;
  specialization: string;
  
  // Identity & Verification
  aadharNumber: string;
  panNumber: string;
  reraRegistration: string;
  
  // Additional Information
  languagesSpoken: string[];
  serviceAreas: string[];
  bio: string;
  
  // Documents
  profileImage: File | null;
  documents: File[];
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Puducherry'
];

const SPECIALIZATIONS = [
  'Residential Properties',
  'Commercial Properties',
  'Industrial Properties',
  'Warehouse & Logistics',
  'Agricultural Land',
  'Luxury Properties',
  'Investment Properties'
];

const LANGUAGES = [
  'Hindi', 'English', 'Tamil', 'Telugu', 'Kannada', 
  'Malayalam', 'Marathi', 'Bengali', 'Gujarati', 'Punjabi'
];

export default function AgentRegistrationForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<AgentFormData>({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    primaryPhone: '',
    secondaryPhone: '',
    email: '',
    whatsappNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    agencyName: '',
    licenseNumber: '',
    experienceYears: '',
    specialization: '',
    aadharNumber: '',
    panNumber: '',
    reraRegistration: '',
    languagesSpoken: [],
    serviceAreas: [],
    bio: '',
    profileImage: null,
    documents: [],
  });
  
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [profilePreview, setProfilePreview] = useState<string>('');

  const toggleLanguage = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languagesSpoken: prev.languagesSpoken.includes(language)
        ? prev.languagesSpoken.filter(l => l !== language)
        : [...prev.languagesSpoken, language]
    }));
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please upload an image file' });
      return;
    }

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      setMessage({ type: 'error', text: 'Profile image must be less than 2MB' });
      return;
    }

    setProfilePreview(URL.createObjectURL(file));
    setFormData(prev => ({ ...prev, profileImage: file }));
    setMessage(null);
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversized = files.filter(file => file.size > maxSize);
    if (oversized.length > 0) {
      setMessage({ type: 'error', text: 'Some files exceed 5MB limit' });
      return;
    }

    setFormData(prev => ({ ...prev, documents: [...prev.documents, ...files] }));
    setMessage(null);
  };

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.fullName || !formData.primaryPhone || !formData.email) {
      setMessage({ type: 'error', text: 'Please fill in all required fields marked with *' });
      return false;
    }

    if (!/^[6-9]\d{9}$/.test(formData.primaryPhone.replace(/\s/g, ''))) {
      setMessage({ type: 'error', text: 'Please enter a valid 10-digit Indian mobile number' });
      return false;
    }

    if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(formData.email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' });
      return false;
    }

    if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) {
      setMessage({ type: 'error', text: 'Please enter a valid 6-digit pincode' });
      return false;
    }

    if (formData.aadharNumber && !/^\d{12}$/.test(formData.aadharNumber.replace(/\s/g, ''))) {
      setMessage({ type: 'error', text: 'Please enter a valid 12-digit Aadhar number' });
      return false;
    }

    if (formData.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber.toUpperCase())) {
      setMessage({ type: 'error', text: 'Please enter a valid PAN number' });
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
      
      // Append all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'profileImage' && value) {
          uploadFormData.append('profileImage', value as File);
        } else if (key === 'documents') {
          (value as File[]).forEach(file => {
            uploadFormData.append('documents', file);
          });
        } else if (key === 'languagesSpoken' || key === 'serviceAreas') {
          uploadFormData.append(key, JSON.stringify(value));
        } else {
          uploadFormData.append(key, value.toString());
        }
      });

      const response = await fetch('/api/agents/register', {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setMessage({ type: 'success', text: 'Agent registration submitted successfully! We will review and get back to you.' });
      
      setTimeout(() => {
        router.push('/agent/dashboard');
      }, 2000);

    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Registration failed. Please try again.',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <span>Home</span>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Agent Registration</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Agent Registration</h1>
          <p className="text-gray-600">Join our network of top-tier real estate professionals. Fill out the form below to create your agent profile and start connecting with clients.</p>
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
            
            {/* Personal Details */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center mr-3">
                  <User className="h-5 w-5 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Personal Details</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="e.g., John Doe"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.primaryPhone}
                      onChange={(e) => setFormData({ ...formData, primaryPhone: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Secondary Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.secondaryPhone}
                      onChange={(e) => setFormData({ ...formData, secondaryPhone: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      value={formData.whatsappNumber}
                      onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center mr-3">
                  <MapPin className="h-5 w-5 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Address Information</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Address
                  </label>
                  <textarea
                    value={formData.addressLine1}
                    onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    placeholder="Enter your complete address including street, building name, landmark, area, etc."
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Mumbai"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <select
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="">Select</option>
                      {INDIAN_STATES.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>

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
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center mr-3">
                  <Briefcase className="h-5 w-5 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Professional Information</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agency Name
                  </label>
                  <input
                    type="text"
                    value={formData.agencyName}
                    onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="e.g., Premier Estates Ltd."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      License Number
                    </label>
                    <input
                      type="text"
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="REG-123456"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      value={formData.experienceYears}
                      onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specialization
                  </label>
                  <select
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">Select specialization</option>
                    {SPECIALIZATIONS.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    RERA Registration Number
                  </label>
                  <input
                    type="text"
                    value={formData.reraRegistration}
                    onChange={(e) => setFormData({ ...formData, reraRegistration: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="RERA/12345/2023"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Aadhar Number
                    </label>
                    <input
                      type="text"
                      value={formData.aadharNumber}
                      onChange={(e) => setFormData({ ...formData, aadharNumber: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="1234 5678 9012"
                      maxLength={14}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PAN Number
                    </label>
                    <input
                      type="text"
                      value={formData.panNumber}
                      onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="ABCDE1234F"
                      maxLength={10}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Languages Spoken
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {LANGUAGES.map((language) => (
                      <button
                        key={language}
                        type="button"
                        onClick={() => toggleLanguage(language)}
                        className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                          formData.languagesSpoken.includes(language)
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {language}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio / About You
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    placeholder="Tell clients about your experience, expertise, and approach to real estate. Highlight your achievements, areas of specialization, and what makes you unique..."
                  />
                  <p className="mt-1 text-xs text-gray-500">This will be displayed on your public agent profile</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Profile Photo */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Profile Photo <span className="text-red-500">*</span></h3>
                
                <label className="block w-full">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-red-500 hover:bg-red-50 transition-all">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageChange}
                      className="hidden"
                    />
                    {profilePreview ? (
                      <div className="relative">
                        <img
                          src={profilePreview}
                          alt="Profile preview"
                          className="w-32 h-32 rounded-full mx-auto object-cover"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProfilePreview('');
                            setFormData(prev => ({ ...prev, profileImage: null }));
                          }}
                          className="absolute top-0 right-1/3 p-1 bg-red-500 text-white rounded-full"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <User className="h-6 w-6 text-red-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-1">Upload Photo</p>
                        <p className="text-xs text-gray-500">JPG or PNG (MAX. 2MB)</p>
                      </>
                    )}
                  </div>
                </label>
              </div>

              {/* Documents */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">KYC Documents</h3>
                <p className="text-sm text-gray-600 mb-4">Upload a valid ID proof (Passport, Driving License, or National ID)</p>
                
                <label className="block w-full">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-red-500 hover:bg-red-50 transition-all">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleDocumentChange}
                      className="hidden"
                    />
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Upload className="h-5 w-5 text-red-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">Upload Document</p>
                    <p className="text-xs text-gray-500">PDF or JPG (MAX. 5MB)</p>
                  </div>
                </label>

                {formData.documents.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {formData.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-700 truncate">{doc.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDocument(index)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={uploading}
                className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Registering...</span>
                  </>
                ) : (
                  <span>Register as Agent</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => router.back()}
                className="w-full bg-white text-gray-700 py-3 px-6 rounded-lg font-medium border-2 border-gray-200 hover:bg-gray-50 transition-colors"
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