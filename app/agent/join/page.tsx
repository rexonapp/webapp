'use client'
import { useState } from 'react';
import { Upload, X, CheckCircle, AlertCircle, User, Mail, Phone, Building2, Award, MapPin, FileText, Briefcase } from 'lucide-react';
import { useRouter } from 'next/navigation';

// shadcn/ui imports
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

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
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className="mb-6">
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Personal Details */}
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center mr-3">
                    <User className="h-5 w-5 text-red-600" />
                  </div>
                  <CardTitle>Personal Details</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g., John Doe"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => setFormData({ ...formData, gender: value })}
                    >
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryPhone">
                      Primary Phone <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="primaryPhone"
                      type="tel"
                      value={formData.primaryPhone}
                      onChange={(e) => setFormData({ ...formData, primaryPhone: e.target.value })}
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondaryPhone">Secondary Phone</Label>
                    <Input
                      id="secondaryPhone"
                      type="tel"
                      value={formData.secondaryPhone}
                      onChange={(e) => setFormData({ ...formData, secondaryPhone: e.target.value })}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                    <Input
                      id="whatsappNumber"
                      type="tel"
                      value={formData.whatsappNumber}
                      onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center mr-3">
                    <MapPin className="h-5 w-5 text-red-600" />
                  </div>
                  <CardTitle>Address Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="addressLine1">Full Address</Label>
                  <Textarea
                    id="addressLine1"
                    value={formData.addressLine1}
                    onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                    rows={3}
                    placeholder="Enter your complete address including street, building name, landmark, area, etc."
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Mumbai"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Select
                      value={formData.state}
                      onValueChange={(value) => setFormData({ ...formData, state: value })}
                    >
                      <SelectTrigger id="state">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDIAN_STATES.map(state => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      placeholder="400001"
                      maxLength={6}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center mr-3">
                    <Briefcase className="h-5 w-5 text-red-600" />
                  </div>
                  <CardTitle>Professional Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="agencyName">Agency Name</Label>
                  <Input
                    id="agencyName"
                    value={formData.agencyName}
                    onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                    placeholder="e.g., Premier Estates Ltd."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">License Number</Label>
                    <Input
                      id="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                      placeholder="REG-123456"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experienceYears">Years of Experience</Label>
                    <Input
                      id="experienceYears"
                      type="number"
                      value={formData.experienceYears}
                      onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                      placeholder="5"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Select
                    value={formData.specialization}
                    onValueChange={(value) => setFormData({ ...formData, specialization: value })}
                  >
                    <SelectTrigger id="specialization">
                      <SelectValue placeholder="Select specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      {SPECIALIZATIONS.map(spec => (
                        <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reraRegistration">RERA Registration Number</Label>
                  <Input
                    id="reraRegistration"
                    value={formData.reraRegistration}
                    onChange={(e) => setFormData({ ...formData, reraRegistration: e.target.value })}
                    placeholder="RERA/12345/2023"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="aadharNumber">Aadhar Number</Label>
                    <Input
                      id="aadharNumber"
                      value={formData.aadharNumber}
                      onChange={(e) => setFormData({ ...formData, aadharNumber: e.target.value })}
                      placeholder="1234 5678 9012"
                      maxLength={14}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="panNumber">PAN Number</Label>
                    <Input
                      id="panNumber"
                      value={formData.panNumber}
                      onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                      placeholder="ABCDE1234F"
                      maxLength={10}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Languages Spoken</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {LANGUAGES.map((language) => (
                      <Button
                        key={language}
                        type="button"
                        variant={formData.languagesSpoken.includes(language) ? "default" : "outline"}
                        onClick={() => toggleLanguage(language)}
                        className={`text-sm ${
                          formData.languagesSpoken.includes(language)
                            ? 'bg-red-600 hover:bg-red-700 border-red-600'
                            : 'hover:border-gray-300'
                        }`}
                      >
                        {language}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio / About You</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={5}
                    placeholder="Tell clients about your experience, expertise, and approach to real estate. Highlight your achievements, areas of specialization, and what makes you unique..."
                  />
                  <p className="text-xs text-gray-500">This will be displayed on your public agent profile</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Profile Photo */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>Profile Photo</span>
                    <Badge variant="destructive" className="bg-red-600">Required</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Label htmlFor="profileImage" className="block w-full cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-red-500 hover:bg-red-50 transition-all">
                      <input
                        id="profileImage"
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
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              setProfilePreview('');
                              setFormData(prev => ({ ...prev, profileImage: null }));
                            }}
                            className="absolute top-0 right-1/3 h-8 w-8 rounded-full bg-red-500 hover:bg-red-600"
                          >
                            <X className="h-4 w-4" />
                          </Button>
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
                  </Label>
                </CardContent>
              </Card>

              {/* Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">KYC Documents</CardTitle>
                  <CardDescription>
                    Upload a valid ID proof (Passport, Driving License, or National ID)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Label htmlFor="documents" className="block w-full cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-500 hover:bg-red-50 transition-all">
                      <input
                        id="documents"
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
                  </Label>

                  {formData.documents.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {formData.documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2 flex-1 min-w-0">
                            <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
                            <span className="text-sm text-gray-700 truncate">{doc.name}</span>
                          </div>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => removeDocument(index)}
                            className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600 flex-shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleSubmit}
                  disabled={uploading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-base font-bold shadow-md hover:shadow-lg"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      <span>Registering...</span>
                    </>
                  ) : (
                    <span>Register as Agent</span>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="w-full py-6 text-base font-medium"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}