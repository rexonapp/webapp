'use client'
import { useState } from 'react';
import { Upload, X, CheckCircle, AlertCircle, MapPin, Building2, User, IndianRupee, FileText, Image as ImageIcon, Video, Plus, Eye } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MapSelector from './MapSelector';

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
  videos: File[];
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

const MAX_IMAGES = 10;
const MAX_VIDEOS = 2;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

export default function WarehouseUploadForm() {
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
    videos: [],
  });
  
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videoPreviews, setVideoPreviews] = useState<string[]>([]);
  const [showMap, setShowMap] = useState(false);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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

    if (formData.images.length + files.length > MAX_IMAGES) {
      setMessage({ type: 'error', text: `Maximum ${MAX_IMAGES} images allowed. You can add ${MAX_IMAGES - formData.images.length} more.` });
      return;
    }

    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== files.length) {
      setMessage({ type: 'error', text: 'Only image files are allowed' });
      return;
    }

    const oversized = imageFiles.filter(file => file.size > MAX_IMAGE_SIZE);
    if (oversized.length > 0) {
      setMessage({ type: 'error', text: 'Some images exceed 5MB limit' });
      return;
    }

    const previews = imageFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...previews]);
    setFormData(prev => ({ ...prev, images: [...prev.images, ...imageFiles] }));
    setMessage(null);
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    if (formData.videos.length + files.length > MAX_VIDEOS) {
      setMessage({ type: 'error', text: `Maximum ${MAX_VIDEOS} videos allowed. You can add ${MAX_VIDEOS - formData.videos.length} more.` });
      return;
    }

    const videoFiles = files.filter(file => file.type.startsWith('video/'));
    
    if (videoFiles.length !== files.length) {
      setMessage({ type: 'error', text: 'Only video files are allowed' });
      return;
    }

    const oversized = videoFiles.filter(file => file.size > MAX_VIDEO_SIZE);
    if (oversized.length > 0) {
      setMessage({ type: 'error', text: 'Some videos exceed 100MB limit' });
      return;
    }

    const previews = videoFiles.map(file => URL.createObjectURL(file));
    setVideoPreviews(prev => [...prev, ...previews]);
    setFormData(prev => ({ ...prev, videos: [...prev.videos, ...videoFiles] }));
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

  const removeVideo = (index: number) => {
    URL.revokeObjectURL(videoPreviews[index]);
    setVideoPreviews(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index)
    }));
  };

  const openGallery = (index: number) => {
    setSelectedImageIndex(index);
    setShowImageGallery(true);
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
  const handleLocationSelect = (lat: string, lng: string) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));
  };

  const handleSubmit = async () => {
    setMessage(null);

    if (!validateForm()) {
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadFormData = new FormData();
      
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'images') {
          formData.images.forEach(file => {
            uploadFormData.append('images', file);
          });
        } else if (key === 'videos') {
          formData.videos.forEach(file => {
            uploadFormData.append('videos', file);
          });
        } else if (key === 'amenities') {
          uploadFormData.append('amenities', JSON.stringify(value));
        } else {
          uploadFormData.append(key, value.toString());
        }
      });

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 300);

      const response = await fetch('/api/properties/create', {
        method: 'POST',
        body: uploadFormData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setMessage({ type: 'success', text: 'Property listed successfully!' });

    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Upload failed. Please try again.',
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const visibleImageCount = 3;
  const remainingImages = imagePreviews.length - visibleImageCount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <span>Home</span>
            <span className="mx-2">/</span>
            <span>My Listings</span>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">Add New Property</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Add New Property</h1>
          <p className="text-gray-600">Fill in the mandatory details below to list your property on Rexon. Adding high-quality photos and videos increases visibility.</p>
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

        {uploading && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-red-900">Uploading property...</span>
                  <span className="text-red-700">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Basic Information */}
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center mr-3">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle>Basic Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-semibold">
                    Property Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Green Valley Warehousing Complex"
                    className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 w-full">
                <Label htmlFor="propertyType" className="text-sm font-semibold">
                  Property Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.propertyType}
                  onValueChange={(value) => setFormData({ ...formData, propertyType: value })}
                >
                  <SelectTrigger 
                    id="propertyType" 
                    className="w-full h-11 border-gray-300 focus:border-red-500 focus:ring-red-500"
                  >
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent className="max-w-[calc(100vw-2rem)]">
                    {PROPERTY_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

                  <div className="space-y-2">
                    <Label htmlFor="totalArea" className="text-sm font-semibold">
                      Total Area <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="totalArea"
                        type="number"
                        min='0'
                        value={formData.totalArea}
                        onChange={(e) => setFormData({ ...formData, totalArea: e.target.value })}
                        placeholder="0"
                        className="flex-1 border-gray-300 focus:border-red-500 focus:ring-red-500"
                      />
                      <Select
                        value={formData.sizeUnit}
                        onValueChange={(value: 'sqft' | 'sqm') => setFormData({ ...formData, sizeUnit: value })}
                      >
                        <SelectTrigger className="w-28 h-11 border-gray-300 focus:border-red-500 focus:ring-red-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sqft">Sq.ft</SelectItem>
                          <SelectItem value="sqm">Sq.m</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    placeholder="Provide a detailed description of your property..."
                    className="border-gray-300 focus:border-red-500 focus:ring-red-500 resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Availability & Pricing */}
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center mr-3">
                    <IndianRupee className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle>Availability & Pricing</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="availableFrom" className="text-sm font-semibold">
                      Available From <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="availableFrom"
                      type="date"
                      value={formData.availableFrom}
                      onChange={(e) => setFormData({ ...formData, availableFrom: e.target.value })}
                      className="h-11 border-gray-300 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>

                  <div className="space-y-2 w-full">
                    <Label htmlFor="listingType" className="text-sm font-semibold">
                      Listing Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.listingType}
                      onValueChange={(value: 'sale' | 'rent') => setFormData({ ...formData, listingType: value })}
                    >
                      <SelectTrigger id="listingType" className="h-11 w-full border-gray-300 focus:border-red-500 focus:ring-red-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className='max-w-[calc(100vw-2rem)]'>
                        <SelectItem value="rent">For Rent</SelectItem>
                        <SelectItem value="sale">For Sale</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pricePerSqFt" className="text-sm font-semibold">
                    Price per Sq.ft <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₹</span>
                    <Input
                      id="pricePerSqFt"
                      type="number"
                      value={formData.pricePerSqFt}
                      onChange={(e) => setFormData({ ...formData, pricePerSqFt: e.target.value })}
                      className="pl-8 h-11 border-gray-300 focus:border-red-500 focus:ring-red-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalPrice" className="text-sm font-semibold">Total Price (Optional)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₹</span>
                    <Input
                      id="totalPrice"
                      type="number"
                      value={formData.totalPrice}
                      onChange={(e) => setFormData({ ...formData, totalPrice: e.target.value })}
                      className="pl-8 h-11 border-gray-300 focus:border-red-500 focus:ring-red-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Details */}
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center mr-3">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle>Location Details</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-semibold">
                    Address <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter full street address"
                    className="border-gray-300 focus:border-red-500 focus:ring-red-500 resize-none"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-semibold">
                      City <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g., Mumbai"
                      className="h-11 border-gray-300 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>

                  <div className="space-y-2 w-full">
                    <Label htmlFor="state" className="text-sm font-semibold">
                      State <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.state}
                      onValueChange={(value) => setFormData({ ...formData, state: value })}
                    >
                      <SelectTrigger id="state" className="h-11 w-full border-gray-300 focus:border-red-500 focus:ring-red-500">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent className='max-w-[calc(100vw-2rem)]'>
                        {INDIAN_STATES.map(state => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pincode" className="text-sm font-semibold">Pincode</Label>
                    <Input
                      id="pincode"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      placeholder="400001"
                      maxLength={6}
                      className="h-11 border-gray-300 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>

                  <div className="space-y-2 w-full">
                    <Label htmlFor="roadConnectivity" className="text-sm font-semibold">Road Connectivity</Label>
                    <Select
                      value={formData.roadConnectivity}
                      onValueChange={(value) => setFormData({ ...formData, roadConnectivity: value })}
                    >
                      <SelectTrigger id="roadConnectivity" className="h-11 w-full border-gray-300 focus:border-red-500 focus:ring-red-500">
                        <SelectValue placeholder="Select road type..." />
                      </SelectTrigger>
                      <SelectContent className='max-w-[calc(100vw-2rem)]'>
                        {ROAD_CONNECTIVITY.map(road => (
                          <SelectItem key={road} value={road}>{road}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude" className="text-sm font-semibold">Latitude</Label>
                    <Input
                      id="latitude"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      placeholder="19.0760"
                      className="h-11 border-gray-300 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="longitude" className="text-sm font-semibold">Longitude</Label>
                    <Input
                      id="longitude"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      placeholder="72.8777"
                      className="h-11 border-gray-300 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="button"
                    onClick={() => setShowMap(!showMap)}
                    className="bg-red-600 hover:bg-red-700 h-11"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    {showMap ? 'Hide Map' : 'Select Location on Map'}
                  </Button>

                  {showMap && (
                    <div className="mt-4 p-8 border rounded-lg bg-gray-50 text-center">
                      {/* <p className="text-sm text-gray-600">Map component would be rendered here</p> */}
                      <MapSelector
                      latitude={formData.latitude}
                      longitude={formData.longitude}
                      onLocationSelect={handleLocationSelect}
                    />                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Features & Amenities */}
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center mr-3">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle>Features & Amenities</CardTitle>
                  </div>
                  <Badge variant="secondary" className="bg-gray-200">Optional</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Select Amenities</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                    {AMENITIES.map((amenity) => (
                      <div key={amenity} className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-colors">
                        <Checkbox
                          id={amenity}
                          checked={formData.amenities.includes(amenity)}
                          onCheckedChange={() => toggleAmenity(amenity)}
                          className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                        />
                        <Label
                          htmlFor={amenity}
                          className="text-sm font-medium leading-none cursor-pointer flex-1"
                        >
                          {amenity}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Details */}
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center mr-3">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle>Contact Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactName" className="text-sm font-semibold">Full Name</Label>
                    <Input
                      id="contactName"
                      value={formData.contactPersonName}
                      onChange={(e) => setFormData({ ...formData, contactPersonName: e.target.value })}
                      placeholder="Contact person name"
                      className="h-11 border-gray-300 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactEmail" className="text-sm font-semibold">Email Address</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={formData.contactPersonEmail}
                      onChange={(e) => setFormData({ ...formData, contactPersonEmail: e.target.value })}
                      placeholder="email@example.com"
                      className="h-11 border-gray-300 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone" className="text-sm font-semibold">Mobile Number</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    value={formData.contactPersonPhone}
                    onChange={(e) => setFormData({ ...formData, contactPersonPhone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="h-11 border-gray-300 focus:border-red-500 focus:ring-red-500"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Media & Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Property Images */}
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <ImageIcon className="h-5 w-5 text-red-600 mr-2" />
                      <CardTitle className="text-lg">Property Images</CardTitle>
                    </div>
                    <Badge className="bg-red-600 hover:bg-red-700">Required</Badge>
                  </div>
                  <CardDescription className="text-xs">
                    Upload up to {MAX_IMAGES} images (Max 5MB each)
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {imagePreviews.length === 0 ? (
                    <Label htmlFor="images" className="block w-full cursor-pointer">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-red-500 hover:bg-red-50 transition-all">
                        <input
                          id="images"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                        <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Upload className="h-8 w-8 text-red-600" />
                        </div>
                        <p className="text-sm font-semibold text-gray-900 mb-1">Click to upload images</p>
                        <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                      </div>
                    </Label>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-2">
                        {imagePreviews.slice(0, visibleImageCount).map((preview, index) => (
                          <div key={index} className="relative group aspect-square">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg border-2 border-gray-200 group-hover:border-red-500 transition-all cursor-pointer"
                              onClick={() => openGallery(index)}
                            />
                            <Button
                              type="button"
                              size="icon"
                              variant="destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImage(index);
                              }}
                              className="absolute -top-2 -right-2 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 shadow-lg"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-all flex items-center justify-center">
                              <Eye className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        ))}
                        
                        {remainingImages > 0 && (
                          <div 
                            className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border-2 border-gray-300 flex items-center justify-center cursor-pointer hover:border-red-500 hover:from-red-50 hover:to-orange-50 transition-all group"
                            onClick={() => setShowImageGallery(true)}
                          >
                            <div className="text-center">
                              <p className="text-2xl font-bold text-gray-700 group-hover:text-red-600">+{remainingImages}</p>
                              <p className="text-xs text-gray-500 group-hover:text-red-600">more</p>
                            </div>
                          </div>
                        )}
                        
                        {formData.images.length < MAX_IMAGES && (
                          <Label htmlFor="images-add" className="block cursor-pointer">
                            <div className="aspect-square bg-gradient-to-br from-red-50 to-orange-50 rounded-lg border-2 border-dashed border-red-300 flex items-center justify-center hover:border-red-500 hover:bg-red-100 transition-all group">
                              <input
                                id="images-add"
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                              />
                              <Plus className="h-8 w-8 text-red-500 group-hover:text-red-600 group-hover:scale-110 transition-transform" />
                            </div>
                          </Label>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                        <span className="font-medium">{formData.images.length} / {MAX_IMAGES} images</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowImageGallery(true)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7"
                        >
                          View All
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Property Videos */}
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Video className="h-5 w-5 text-red-600 mr-2" />
                      <CardTitle className="text-lg">Property Videos</CardTitle>
                    </div>
                    <Badge variant="secondary" className="bg-gray-200">Optional</Badge>
                  </div>
                  <CardDescription className="text-xs">
                    Upload up to {MAX_VIDEOS} videos (Max 100MB each)
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {formData.videos.length < MAX_VIDEOS && (
                    <div className="mb-4">
                      <Label htmlFor="videos" className="block w-full cursor-pointer">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-500 hover:bg-red-50 transition-all">
                          <input
                            id="videos"
                            type="file"
                            multiple
                            accept="video/*"
                            onChange={handleVideoChange}
                            className="hidden"
                          />
                          <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Video className="h-6 w-6 text-red-600" />
                          </div>
                          <p className="text-sm font-medium text-gray-900 mb-1">Click to upload</p>
                          <p className="text-xs text-gray-500">
                            {formData.videos.length}/{MAX_VIDEOS} videos
                          </p>
                        </div>
                      </Label>
                    </div>
                  )}

                  {videoPreviews.length > 0 && (
                    <div className="space-y-3">
                      {videoPreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <video
                            src={preview}
                            className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 group-hover:border-red-500 transition-all"
                            controls
                          />
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            onClick={() => removeVideo(index)}
                            className="absolute -top-2 -right-2 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 shadow-lg"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                            {(formData.videos[index].size / (1024 * 1024)).toFixed(1)} MB
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Summary */}
              <Card className="shadow-md hover:shadow-lg transition-shadow border-red-100">
                <CardHeader className="">
                  <CardTitle className="text-lg">Quick Summary</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Property Type</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formData.propertyType || 'Not selected'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Total Area</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formData.totalArea ? `${formData.totalArea} ${formData.sizeUnit}` : 'Not set'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Media Files</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formData.images.length} images, {formData.videos.length} videos
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-600">Location</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formData.latitude && formData.longitude 
                          ? '✓ Set' 
                          : 'Not set'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleSubmit}
                  disabled={uploading}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-6 text-base font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      <span>Submit Listing</span>
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  disabled={uploading}
                  className="w-full py-6 text-base font-medium border-2 hover:bg-gray-50"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Gallery Modal */}
      <Dialog open={showImageGallery} onOpenChange={setShowImageGallery}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">All Property Images ({imagePreviews.length})</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative group aspect-square">
                <img
                  src={preview}
                  alt={`Property ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg border-2 border-gray-200 group-hover:border-red-500 transition-all"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  onClick={() => {
                    removeImage(index);
                    if (imagePreviews.length === 1) {
                      setShowImageGallery(false);
                    }
                  }}
                  className="absolute -top-2 -right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 shadow-lg"
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                  Image {index + 1}
                </div>
              </div>
            ))}
            
            {formData.images.length < MAX_IMAGES && (
              <Label htmlFor="images-modal" className="block cursor-pointer">
                <div className="aspect-square bg-gradient-to-br from-red-50 to-orange-50 rounded-lg border-2 border-dashed border-red-300 flex flex-col items-center justify-center hover:border-red-500 hover:bg-red-100 transition-all group">
                  <input
                    id="images-modal"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Plus className="h-10 w-10 text-red-500 group-hover:text-red-600 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-xs text-red-600 font-medium">Add More</p>
                </div>
              </Label>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}