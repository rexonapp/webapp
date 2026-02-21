'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Upload, X, CheckCircle, AlertCircle, MapPin, Building2, User,
  IndianRupee, FileText, Image as ImageIcon, Video, Plus, Eye,
  ChevronLeft, ChevronRight, Trash2, Pencil
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import MapSelector from '../../MapSelector';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExistingMedia {
  id: number;
  file_name: string;
  file_type: string;
  file_size: number;
  s3_url: string;
  is_primary: boolean;
  image_order: number;
}

interface WarehouseFormData {
  title: string;
  description: string;
  propertyType: string;
  totalArea: string;
  sizeUnit: 'sqft' | 'sqm';
  availableFrom: string;
  listingType: 'sale' | 'rent' | 'lease';
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
}

interface FieldErrors {
  title?: string;
  propertyType?: string;
  totalArea?: string;
  availableFrom?: string;
  pricePerSqFt?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  contactPersonPhone?: string;
  contactPersonEmail?: string;
  images?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PROPERTY_TYPES = [
  'Warehouse', 'Cold Storage', 'Industrial Shed', 'Manufacturing Unit',
  'Godown', 'Factory Space', 'Logistics Hub', 'Distribution Center'
];

const AMENITIES = ['Parking', 'Security', 'CCTV'];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Puducherry'
];

const ROAD_CONNECTIVITY = [
  'National Highway', 'State Highway', 'City Road', 'Main Road',
  'Interior Road', 'Service Road', 'Other'
];

const MAX_IMAGES = 10;
const MAX_VIDEOS = 2;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

// Reverse map DB values → frontend display values
const PROPERTY_TYPE_REVERSE: Record<string, string> = {
  'Warehouse': 'Warehouse', 'Industrial': 'Industrial Shed', 'Commercial': 'Logistics Hub',
};
const PRICE_TYPE_REVERSE: Record<string, 'sale' | 'rent' | 'lease'> = {
  'Rent': 'rent', 'Sale': 'sale', 'Lease': 'lease',
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  warehouseId: string;
  initialData: any;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function WarehouseEditForm({ warehouseId, initialData }: Props) {
  const router = useRouter();

  // Existing (server) media
  const [existingImages, setExistingImages] = useState<ExistingMedia[]>(initialData.images || []);
  const [existingVideos, setExistingVideos] = useState<ExistingMedia[]>(initialData.videos || []);
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);
  const [deletedVideoIds, setDeletedVideoIds] = useState<number[]>([]);

  // New (local) media
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [newVideos, setNewVideos] = useState<File[]>([]);
  const [newVideoPreviews, setNewVideoPreviews] = useState<string[]>([]);

  // UI state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageToDelete, setImageToDelete] = useState<{ type: 'existing' | 'new'; index: number } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  // Build initial form values from DB data
  const availableFromFormatted = initialData.available_from
    ? new Date(initialData.available_from).toISOString().split('T')[0]
    : '';

  const [formData, setFormData] = useState<WarehouseFormData>({
    title: initialData.title || '',
    description: initialData.description || '',
    propertyType: initialData.property_type
      ? (Object.entries(PROPERTY_TYPE_REVERSE).find(([, v]) => v === initialData.property_type)?.[0] || initialData.property_type)
      : '',
    totalArea: initialData.space_available?.toString() || initialData.warehouse_size?.toString() || '',
    sizeUnit: (initialData.space_unit as 'sqft' | 'sqm') || 'sqft',
    availableFrom: availableFromFormatted,
    listingType: PRICE_TYPE_REVERSE[initialData.price_type] || 'rent',
    pricePerSqFt: initialData.price_per_sqft?.toString() || '',
    totalPrice: initialData.total_price?.toString() || '',
    address: initialData.address || '',
    city: initialData.city || '',
    state: initialData.state || '',
    pincode: initialData.pincode || '',
    roadConnectivity: initialData.road_connectivity || '',
    contactPersonName: initialData.contact_person_name || '',
    contactPersonPhone: initialData.contact_person_phone || '',
    contactPersonEmail: initialData.contact_person_email || '',
    contactPersonDesignation: initialData.contact_person_designation || '',
    latitude: initialData.latitude?.toString() || '',
    longitude: initialData.longitude?.toString() || '',
    amenities: Array.isArray(initialData.amenities) ? initialData.amenities : [],
  });

  // All images for gallery (existing + new previews)
  const allImageUrls = [
    ...existingImages.map(img => img.s3_url),
    ...newImagePreviews,
  ];
  const totalImageCount = existingImages.length + newImages.length;
  const visibleImageCount = 3;
  const remainingImages = allImageUrls.length - visibleImageCount;

  // ─── Validation ────────────────────────────────────────────────────────────

  const validateField = (name: string, value: any): string | undefined => {
    switch (name) {
      case 'title':
        if (!value?.trim()) return 'Property title is required';
        if (value.length < 5) return 'Title must be at least 5 characters';
        break;
      case 'propertyType':
        if (!value) return 'Property type is required';
        break;
      case 'totalArea':
        if (!value) return 'Total area is required';
        if (parseFloat(value) <= 0) return 'Total area must be greater than 0';
        break;
      case 'availableFrom':
        if (!value) return 'Available from date is required';
        break;
      case 'pricePerSqFt':
        if (!value) return 'Price per sq.ft is required';
        if (parseFloat(value) <= 0) return 'Price must be greater than 0';
        break;
      case 'address':
        if (!value?.trim()) return 'Address is required';
        break;
      case 'city':
        if (!value?.trim()) return 'City is required';
        break;
      case 'state':
        if (!value) return 'State is required';
        break;
      case 'pincode':
        if (value) {
          if (!/^\d+$/.test(value)) return 'Pincode must contain only numbers';
          if (value.length !== 6) return 'Pincode must be exactly 6 digits';
        }
        break;
      case 'contactPersonPhone':
        if (value && !/^[6-9]\d{9}$/.test(value.replace(/\s/g, '')))
          return 'Enter a valid 10-digit mobile number starting with 6-9';
        break;
      case 'contactPersonEmail':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return 'Enter a valid email address';
        break;
      case 'images':
        if (totalImageCount === 0) return 'At least one property image is required';
        break;
    }
    return undefined;
  };

  const handleFieldChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setTouchedFields(prev => new Set(prev).add(name));
    setFieldErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleFieldBlur = (name: string) => {
    setTouchedFields(prev => new Set(prev).add(name));
    setFieldErrors(prev => ({
      ...prev,
      [name]: validateField(name, formData[name as keyof WarehouseFormData]),
    }));
  };

  const handleAddressChange = (value: string) => {
    handleFieldChange('address', value);
    if (value.length >= 5 && !showMap) setShowMap(true);
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  // ─── Image handlers ────────────────────────────────────────────────────────

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setFieldErrors(prev => ({ ...prev, images: undefined }));

    if (totalImageCount + files.length > MAX_IMAGES) {
      setFieldErrors(prev => ({
        ...prev,
        images: `Maximum ${MAX_IMAGES} images allowed. You can add ${MAX_IMAGES - totalImageCount} more.`,
      }));
      return;
    }

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (files.some(f => !allowed.includes(f.type.toLowerCase()))) {
      setFieldErrors(prev => ({ ...prev, images: 'Only image files are allowed (JPG, PNG, WEBP, GIF)' }));
      return;
    }
    if (files.some(f => f.size > MAX_IMAGE_SIZE)) {
      setFieldErrors(prev => ({ ...prev, images: 'Some images exceed 5MB limit' }));
      return;
    }

    const previews = files.map(f => URL.createObjectURL(f));
    setNewImages(prev => [...prev, ...files]);
    setNewImagePreviews(prev => [...prev, ...previews]);
    setTouchedFields(prev => new Set(prev).add('images'));
  };

  const handleNewVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const totalVideos = existingVideos.length + newVideos.length;
    if (totalVideos + files.length > MAX_VIDEOS) {
      toast.error(`Maximum ${MAX_VIDEOS} videos allowed`);
      return;
    }
    if (files.some(f => !f.type.startsWith('video/'))) {
      toast.error('Only video files are allowed');
      return;
    }
    if (files.some(f => f.size > MAX_VIDEO_SIZE)) {
      toast.error('Some videos exceed 100MB limit');
      return;
    }

    const previews = files.map(f => URL.createObjectURL(f));
    setNewVideos(prev => [...prev, ...files]);
    setNewVideoPreviews(prev => [...prev, ...previews]);
  };

  // Remove existing image (mark for deletion)
  const removeExistingImage = (index: number) => {
    const img = existingImages[index];
    setDeletedImageIds(prev => [...prev, img.id]);
    setExistingImages(prev => prev.filter((_, i) => i !== index));
    setImageToDelete(null);
    if (existingImages.length - 1 + newImages.length === 0) {
      setFieldErrors(prev => ({ ...prev, images: 'At least one property image is required' }));
    }
  };

  // Remove new (local) image
  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(newImagePreviews[index]);
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImageToDelete(null);
    if (existingImages.length + newImages.length - 1 === 0) {
      setFieldErrors(prev => ({ ...prev, images: 'At least one property image is required' }));
    }
  };

  const removeExistingVideo = (index: number) => {
    const vid = existingVideos[index];
    setDeletedVideoIds(prev => [...prev, vid.id]);
    setExistingVideos(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewVideo = (index: number) => {
    URL.revokeObjectURL(newVideoPreviews[index]);
    setNewVideos(prev => prev.filter((_, i) => i !== index));
    setNewVideoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const openGallery = (index: number) => {
    setSelectedImageIndex(index);
    setShowImageGallery(true);
  };

  const goToNext = () => setSelectedImageIndex(p => (p + 1) % allImageUrls.length);
  const goToPrev = () => setSelectedImageIndex(p => (p - 1 + allImageUrls.length) % allImageUrls.length);

  // ─── Submit ────────────────────────────────────────────────────────────────

  const validateForm = (): boolean => {
    const errors: FieldErrors = {};
    ['title', 'propertyType', 'totalArea', 'availableFrom', 'pricePerSqFt', 'address', 'city', 'state'].forEach(f => {
      const err = validateField(f, formData[f as keyof WarehouseFormData]);
      if (err) errors[f as keyof FieldErrors] = err;
    });
    if (formData.pincode) { const e = validateField('pincode', formData.pincode); if (e) errors.pincode = e; }
    if (formData.contactPersonPhone) { const e = validateField('contactPersonPhone', formData.contactPersonPhone); if (e) errors.contactPersonPhone = e; }
    if (formData.contactPersonEmail) { const e = validateField('contactPersonEmail', formData.contactPersonEmail); if (e) errors.contactPersonEmail = e; }

    // Images: need at least 1 total (existing + new)
    if (totalImageCount === 0) errors.images = 'At least one property image is required';

    setFieldErrors(errors);
    setTouchedFields(new Set([
      'title', 'propertyType', 'totalArea', 'availableFrom', 'pricePerSqFt',
      'address', 'city', 'state', 'pincode', 'contactPersonPhone', 'contactPersonEmail', 'images'
    ]));
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields correctly');
      document.querySelector('.border-orange-500')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const fd = new FormData();

      // Scalar fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'amenities') {
          fd.append('amenities', JSON.stringify(value));
        } else {
          fd.append(key, (value as any).toString());
        }
      });

      // Deleted IDs
      fd.append('deletedImageIds', JSON.stringify(deletedImageIds));
      fd.append('deletedVideoIds', JSON.stringify(deletedVideoIds));

      // New media
      newImages.forEach(f => fd.append('newImages', f));
      newVideos.forEach(f => fd.append('newVideos', f));

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => prev >= 90 ? prev : prev + 10);
      }, 300);

      const res = await fetch(`/api/properties/${warehouseId}`, {
        method: 'PATCH',
        body: fd,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');

      toast.success('Property updated successfully!', {
        description: 'Your changes have been saved.',
      });

      setTimeout(() => router.push('/mylistings'), 1800);
    } catch (err) {
      toast.error('Update failed', {
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const totalVideos = existingVideos.length + newVideos.length;

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <span
              className="cursor-pointer hover:text-orange-600 transition-colors"
              onClick={() => router.push('/')}
            >Home</span>
            <span className="mx-2">/</span>
            <span
              className="cursor-pointer hover:text-orange-600 transition-colors"
              onClick={() => router.push('/mylistings')}
            >My Listings</span>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">Edit Property</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-orange-600 rounded-xl flex items-center justify-center">
              <Pencil className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Property</h1>
              <p className="text-gray-500 text-sm mt-0.5">Update your listing details below</p>
            </div>
          </div>

          {/* Status badge */}
          <div className="mt-3 flex items-center gap-2">
            <Badge
              className={
                initialData.status === 'Active'
                  ? 'bg-green-100 text-green-700 border-green-200'
                  : initialData.status === 'Pending'
                  ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                  : 'bg-gray-100 text-gray-600 border-gray-200'
              }
            >
              {initialData.status}
            </Badge>
            <span className="text-xs text-gray-400">
              Listed on {new Date(initialData.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>

        {uploading && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-orange-900">Saving changes...</span>
                  <span className="text-orange-700">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left column ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Basic Information */}
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center mr-3">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle>Basic Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-semibold">
                    Property Title <span className="text-orange-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={e => handleFieldChange('title', e.target.value)}
                    onBlur={() => handleFieldBlur('title')}
                    placeholder="e.g., Green Valley Warehousing Complex"
                    className={`border-gray-300 focus:border-orange-500 focus:ring-orange-500 ${touchedFields.has('title') && fieldErrors.title ? 'border-orange-500' : ''}`}
                  />
                  {touchedFields.has('title') && fieldErrors.title && (
                    <p className="text-sm text-orange-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="h-4 w-4" />{fieldErrors.title}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Property Type */}
                  <div className="space-y-2 w-full">
                    <Label htmlFor="propertyType" className="text-sm font-semibold">
                      Property Type <span className="text-orange-500">*</span>
                    </Label>
                    <Select value={formData.propertyType} onValueChange={v => handleFieldChange('propertyType', v)}>
                      <SelectTrigger
                        id="propertyType"
                        className={`w-full h-11 border-gray-300 focus:border-orange-500 ${touchedFields.has('propertyType') && fieldErrors.propertyType ? 'border-orange-500' : ''}`}
                      >
                        <SelectValue placeholder="Select type..." />
                      </SelectTrigger>
                      <SelectContent>
                        {PROPERTY_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {touchedFields.has('propertyType') && fieldErrors.propertyType && (
                      <p className="text-sm text-orange-500 flex items-center gap-1 mt-1">
                        <AlertCircle className="h-4 w-4" />{fieldErrors.propertyType}
                      </p>
                    )}
                  </div>

                  {/* Total Area */}
                  <div className="space-y-2">
                    <Label htmlFor="totalArea" className="text-sm font-semibold">
                      Total Area <span className="text-orange-500">*</span>
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="totalArea"
                        type="number" min="0"
                        value={formData.totalArea}
                        onChange={e => handleFieldChange('totalArea', e.target.value)}
                        onBlur={() => handleFieldBlur('totalArea')}
                        placeholder="0"
                        className={`flex-1 border-gray-300 focus:border-orange-500 ${touchedFields.has('totalArea') && fieldErrors.totalArea ? 'border-orange-500' : ''}`}
                      />
                      <Select
                        value={formData.sizeUnit}
                        onValueChange={(v: 'sqft' | 'sqm') => setFormData(p => ({ ...p, sizeUnit: v }))}
                      >
                        <SelectTrigger className="w-28 h-11 border-gray-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sqft">Sq.ft</SelectItem>
                          <SelectItem value="sqm">Sq.m</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {touchedFields.has('totalArea') && fieldErrors.totalArea && (
                      <p className="text-sm text-orange-500 flex items-center gap-1 mt-1">
                        <AlertCircle className="h-4 w-4" />{fieldErrors.totalArea}
                      </p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                    rows={4}
                    placeholder="Provide a detailed description..."
                    className="border-gray-300 focus:border-orange-500 resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Availability & Pricing */}
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center mr-3">
                    <IndianRupee className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle>Availability & Pricing</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="availableFrom" className="text-sm font-semibold">
                      Available From <span className="text-orange-500">*</span>
                    </Label>
                    <Input
                      id="availableFrom" type="date" min={today}
                      value={formData.availableFrom}
                      onChange={e => handleFieldChange('availableFrom', e.target.value)}
                      onBlur={() => handleFieldBlur('availableFrom')}
                      className={`h-11 border-gray-300 focus:border-orange-500 ${touchedFields.has('availableFrom') && fieldErrors.availableFrom ? 'border-orange-500' : ''}`}
                    />
                    {touchedFields.has('availableFrom') && fieldErrors.availableFrom && (
                      <p className="text-sm text-orange-500 flex items-center gap-1 mt-1">
                        <AlertCircle className="h-4 w-4" />{fieldErrors.availableFrom}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 w-full">
                    <Label htmlFor="listingType" className="text-sm font-semibold">
                      Listing Type <span className="text-orange-500">*</span>
                    </Label>
                    <Select
                      value={formData.listingType}
                      onValueChange={v => setFormData(p => ({ ...p, listingType: v as any }))}
                    >
                      <SelectTrigger id="listingType" className="h-11 w-full border-gray-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rent">For Rent</SelectItem>
                        <SelectItem value="sale">For Sale</SelectItem>
                        <SelectItem value="lease">For Lease</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pricePerSqFt" className="text-sm font-semibold">
                    Price per Sq.ft <span className="text-orange-500">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                    <Input
                      id="pricePerSqFt" type="number" min="0"
                      value={formData.pricePerSqFt}
                      onChange={e => handleFieldChange('pricePerSqFt', e.target.value)}
                      onBlur={() => handleFieldBlur('pricePerSqFt')}
                      className={`pl-8 h-11 border-gray-300 focus:border-orange-500 ${touchedFields.has('pricePerSqFt') && fieldErrors.pricePerSqFt ? 'border-orange-500' : ''}`}
                      placeholder="0.00"
                    />
                  </div>
                  {touchedFields.has('pricePerSqFt') && fieldErrors.pricePerSqFt && (
                    <p className="text-sm text-orange-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="h-4 w-4" />{fieldErrors.pricePerSqFt}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalPrice" className="text-sm font-semibold">Total Price (Optional)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                    <Input
                      id="totalPrice" type="number" min="0"
                      value={formData.totalPrice}
                      onChange={e => setFormData(p => ({ ...p, totalPrice: e.target.value }))}
                      className="pl-8 h-11 border-gray-300 focus:border-orange-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Details */}
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center mr-3">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle>Location Details</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-semibold">
                    Address <span className="text-orange-500">*</span>
                  </Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={e => handleAddressChange(e.target.value)}
                    onBlur={() => handleFieldBlur('address')}
                    placeholder="Enter full street address"
                    rows={2}
                    className={`border-gray-300 focus:border-orange-500 resize-none ${touchedFields.has('address') && fieldErrors.address ? 'border-orange-500' : ''}`}
                  />
                  {touchedFields.has('address') && fieldErrors.address && (
                    <p className="text-sm text-orange-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="h-4 w-4" />{fieldErrors.address}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-semibold">
                      City <span className="text-orange-500">*</span>
                    </Label>
                    <Input
                      id="city" value={formData.city}
                      onChange={e => handleFieldChange('city', e.target.value)}
                      onBlur={() => handleFieldBlur('city')}
                      placeholder="e.g., Mumbai"
                      className={`h-11 border-gray-300 focus:border-orange-500 ${touchedFields.has('city') && fieldErrors.city ? 'border-orange-500' : ''}`}
                    />
                    {touchedFields.has('city') && fieldErrors.city && (
                      <p className="text-sm text-orange-500 flex items-center gap-1 mt-1">
                        <AlertCircle className="h-4 w-4" />{fieldErrors.city}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 w-full">
                    <Label htmlFor="state" className="text-sm font-semibold">
                      State <span className="text-orange-500">*</span>
                    </Label>
                    <Select value={formData.state} onValueChange={v => handleFieldChange('state', v)}>
                      <SelectTrigger
                        id="state"
                        className={`h-11 w-full border-gray-300 focus:border-orange-500 ${touchedFields.has('state') && fieldErrors.state ? 'border-orange-500' : ''}`}
                      >
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDIAN_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {touchedFields.has('state') && fieldErrors.state && (
                      <p className="text-sm text-orange-500 flex items-center gap-1 mt-1">
                        <AlertCircle className="h-4 w-4" />{fieldErrors.state}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pincode" className="text-sm font-semibold">Pincode</Label>
                    <Input
                      id="pincode" maxLength={6}
                      value={formData.pincode}
                      onChange={e => handleFieldChange('pincode', e.target.value)}
                      onBlur={() => handleFieldBlur('pincode')}
                      placeholder="400001"
                      className={`h-11 border-gray-300 focus:border-orange-500 ${touchedFields.has('pincode') && fieldErrors.pincode ? 'border-orange-500' : ''}`}
                    />
                    {touchedFields.has('pincode') && fieldErrors.pincode && (
                      <p className="text-sm text-orange-500 flex items-center gap-1 mt-1">
                        <AlertCircle className="h-4 w-4" />{fieldErrors.pincode}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 w-full">
                    <Label htmlFor="roadConnectivity" className="text-sm font-semibold">Road Connectivity</Label>
                    <Select
                      value={formData.roadConnectivity}
                      onValueChange={v => setFormData(p => ({ ...p, roadConnectivity: v }))}
                    >
                      <SelectTrigger id="roadConnectivity" className="h-11 w-full border-gray-300">
                        <SelectValue placeholder="Select road type..." />
                      </SelectTrigger>
                      <SelectContent>
                        {ROAD_CONNECTIVITY.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude" className="text-sm font-semibold">Latitude</Label>
                    <Input
                      id="latitude" value={formData.latitude}
                      onChange={e => setFormData(p => ({ ...p, latitude: e.target.value }))}
                      placeholder="19.0760"
                      className="h-11 border-gray-300 focus:border-orange-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude" className="text-sm font-semibold">Longitude</Label>
                    <Input
                      id="longitude" value={formData.longitude}
                      onChange={e => setFormData(p => ({ ...p, longitude: e.target.value }))}
                      placeholder="72.8777"
                      className="h-11 border-gray-300 focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="button"
                    onClick={() => setShowMap(!showMap)}
                    className="bg-orange-600 hover:bg-orange-700 h-11"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    {showMap ? 'Hide Map' : 'Update Location on Map'}
                  </Button>

                  {showMap && (
                    <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                      <MapSelector
                        latitude={formData.latitude}
                        longitude={formData.longitude}
                        address={formData.address}
                        city={formData.city}
                        state={formData.state}
                        onLocationSelect={(lat, lng) => setFormData(p => ({ ...p, latitude: lat, longitude: lng }))}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Features & Amenities */}
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center mr-3">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle>Features & Amenities</CardTitle>
                  </div>
                  <Badge variant="secondary" className="bg-gray-200">Optional</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {AMENITIES.map(amenity => (
                    <div key={amenity} className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors">
                      <Checkbox
                        id={amenity}
                        checked={formData.amenities.includes(amenity)}
                        onCheckedChange={() => toggleAmenity(amenity)}
                        className="data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
                      />
                      <Label htmlFor={amenity} className="text-sm font-medium leading-none cursor-pointer flex-1">
                        {amenity}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center mr-3">
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
                      onChange={e => setFormData(p => ({ ...p, contactPersonName: e.target.value }))}
                      placeholder="Contact person name"
                      className="h-11 border-gray-300 focus:border-orange-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactEmail" className="text-sm font-semibold">Email Address</Label>
                    <Input
                      id="contactEmail" type="email"
                      value={formData.contactPersonEmail}
                      onChange={e => handleFieldChange('contactPersonEmail', e.target.value)}
                      onBlur={() => handleFieldBlur('contactPersonEmail')}
                      placeholder="email@example.com"
                      className={`h-11 border-gray-300 focus:border-orange-500 ${touchedFields.has('contactPersonEmail') && fieldErrors.contactPersonEmail ? 'border-orange-500' : ''}`}
                    />
                    {touchedFields.has('contactPersonEmail') && fieldErrors.contactPersonEmail && (
                      <p className="text-sm text-orange-500 flex items-center gap-1 mt-1">
                        <AlertCircle className="h-4 w-4" />{fieldErrors.contactPersonEmail}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone" className="text-sm font-semibold">Mobile Number</Label>
                  <Input
                    id="contactPhone" type="tel" maxLength={10}
                    value={formData.contactPersonPhone}
                    onChange={e => handleFieldChange('contactPersonPhone', e.target.value)}
                    onBlur={() => handleFieldBlur('contactPersonPhone')}
                    placeholder="9876543210"
                    className={`h-11 border-gray-300 focus:border-orange-500 ${touchedFields.has('contactPersonPhone') && fieldErrors.contactPersonPhone ? 'border-orange-500' : ''}`}
                  />
                  {touchedFields.has('contactPersonPhone') && fieldErrors.contactPersonPhone && (
                    <p className="text-sm text-orange-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="h-4 w-4" />{fieldErrors.contactPersonPhone}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Right column ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">

              {/* Property Images */}
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <ImageIcon className="h-5 w-5 text-orange-600 mr-2" />
                      <CardTitle className="text-lg">Property Images</CardTitle>
                      <span className="text-orange-600 mx-3">*</span>
                    </div>
                  </div>
                  <CardDescription className="text-xs">
                    {totalImageCount} / {MAX_IMAGES} images uploaded
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  {allImageUrls.length === 0 ? (
                    <div>
                      <Label htmlFor="images" className="block w-full cursor-pointer">
                        <div className={`border-2 border-dashed rounded-lg p-8 text-center hover:border-orange-500 hover:bg-orange-50 transition-all ${touchedFields.has('images') && fieldErrors.images ? 'border-orange-500 bg-orange-50' : 'border-gray-300'}`}>
                          <input id="images" type="file" multiple accept="image/*" onChange={handleNewImageChange} className="hidden" />
                          <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Upload className="h-8 w-8 text-orange-600" />
                          </div>
                          <p className="text-sm font-semibold text-gray-900 mb-1">Click to upload images</p>
                          <p className="text-xs text-gray-500">JPG, PNG, WEBP up to 5MB</p>
                        </div>
                      </Label>
                      {touchedFields.has('images') && fieldErrors.images && (
                        <p className="text-sm text-orange-500 flex items-center gap-1 mt-2">
                          <AlertCircle className="h-4 w-4" />{fieldErrors.images}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-2">
                        {allImageUrls.slice(0, visibleImageCount).map((url, idx) => {
                          const isExisting = idx < existingImages.length;
                          return (
                            <div key={idx} className="relative group aspect-square">
                              <img
                                src={url}
                                alt={`Image ${idx + 1}`}
                                className="w-full h-full object-cover rounded-lg border-2 border-gray-200 group-hover:border-orange-500 transition-all cursor-pointer"
                                onClick={() => openGallery(idx)}
                              />
                              <Button
                                type="button" size="icon" variant="destructive"
                                onClick={e => {
                                  e.stopPropagation();
                                  setImageToDelete({ type: isExisting ? 'existing' : 'new', index: isExisting ? idx : idx - existingImages.length });
                                }}
                                className="absolute -top-2 -right-2 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-orange-500 hover:bg-orange-600 shadow-lg"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                              <div
                                className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-all flex items-center justify-center cursor-pointer"
                                onClick={() => openGallery(idx)}
                              >
                                <Eye className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              {/* Indicate new uploads */}
                              {!isExisting && (
                                <div className="absolute bottom-1 left-1 bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                                  New
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {remainingImages > 0 && (
                          <div
                            className="relative aspect-square bg-gray-100 rounded-lg border-2 border-gray-300 flex items-center justify-center cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-all group"
                            onClick={() => setShowImageGallery(true)}
                          >
                            <div className="text-center">
                              <p className="text-2xl font-bold text-gray-700 group-hover:text-orange-600">+{remainingImages}</p>
                              <p className="text-xs text-gray-500 group-hover:text-orange-600">more</p>
                            </div>
                          </div>
                        )}

                        {totalImageCount < MAX_IMAGES && (
                          <Label htmlFor="images-add" className="block cursor-pointer">
                            <div className="aspect-square bg-orange-50 rounded-lg border-2 border-dashed border-orange-300 flex items-center justify-center hover:border-orange-500 hover:bg-orange-100 transition-all group">
                              <input id="images-add" type="file" multiple accept="image/*" onChange={handleNewImageChange} className="hidden" />
                              <Plus className="h-8 w-8 text-orange-500 group-hover:text-orange-600 group-hover:scale-110 transition-transform" />
                            </div>
                          </Label>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                        <span className="font-medium">{totalImageCount} / {MAX_IMAGES} images</span>
                        <Button type="button" variant="ghost" size="sm"
                          onClick={() => setShowImageGallery(true)}
                          className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 h-7"
                        >
                          View All
                        </Button>
                      </div>
                      {touchedFields.has('images') && fieldErrors.images && (
                        <p className="text-sm text-orange-500 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />{fieldErrors.images}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Property Videos */}
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Video className="h-5 w-5 text-orange-600 mr-2" />
                      <CardTitle className="text-lg">Property Videos</CardTitle>
                    </div>
                    <Badge variant="secondary" className="bg-gray-200">Optional</Badge>
                  </div>
                  <CardDescription className="text-xs">
                    {totalVideos} / {MAX_VIDEOS} videos uploaded
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  {totalVideos < MAX_VIDEOS && (
                    <div className="mb-4">
                      <Label htmlFor="videos" className="block w-full cursor-pointer">
                        <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-orange-500 hover:bg-orange-50 transition-all border-gray-300">
                          <input id="videos" type="file" multiple accept="video/*" onChange={handleNewVideoChange} className="hidden" />
                          <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Video className="h-6 w-6 text-orange-600" />
                          </div>
                          <p className="text-sm font-medium text-gray-900 mb-1">Click to upload</p>
                          <p className="text-xs text-gray-500">{totalVideos}/{MAX_VIDEOS} videos · Max 100MB</p>
                        </div>
                      </Label>
                    </div>
                  )}

                  {/* Existing videos */}
                  {existingVideos.map((vid, idx) => (
                    <div key={`ev-${vid.id}`} className="relative group mb-3">
                      <video
                        src={vid.s3_url}
                        className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 group-hover:border-orange-500 transition-all"
                        controls
                      />
                      <Button
                        type="button" size="icon" variant="destructive"
                        onClick={() => removeExistingVideo(idx)}
                        className="absolute -top-2 -right-2 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-orange-500 hover:bg-orange-600 shadow-lg"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                        {(vid.file_size / (1024 * 1024)).toFixed(1)} MB
                      </div>
                    </div>
                  ))}

                  {/* New videos */}
                  {newVideoPreviews.map((preview, idx) => (
                    <div key={`nv-${idx}`} className="relative group mb-3">
                      <video
                        src={preview}
                        className="w-full h-32 object-cover rounded-lg border-2 border-orange-300 group-hover:border-orange-500 transition-all"
                        controls
                      />
                      <Button
                        type="button" size="icon" variant="destructive"
                        onClick={() => removeNewVideo(idx)}
                        className="absolute -top-2 -right-2 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-orange-500 hover:bg-orange-600 shadow-lg"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded font-medium">
                        New
                      </div>
                      <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                        {(newVideos[idx].size / (1024 * 1024)).toFixed(1)} MB
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Summary */}
              <Card className="shadow-md hover:shadow-lg transition-shadow border-orange-100">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Summary</CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="space-y-3">
                    {[
                      { label: 'Property Type', value: formData.propertyType || 'Not selected' },
                      { label: 'Total Area', value: formData.totalArea ? `${formData.totalArea} ${formData.sizeUnit}` : 'Not set' },
                      { label: 'Media Files', value: `${totalImageCount} images, ${totalVideos} videos` },
                      { label: 'Location', value: formData.latitude && formData.longitude ? '✓ Set' : 'Not set' },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <span className="text-sm text-gray-600">{label}</span>
                        <span className="text-sm font-semibold text-gray-900">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  onClick={handleSubmit}
                  disabled={uploading}
                  className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white py-6 text-base font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>

                <Button
                  type="button" variant="outline" disabled={uploading}
                  onClick={() => router.push('/mylistings')}
                  className="w-full py-6 text-base font-medium border-2 hover:bg-gray-50"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Image Gallery Modal ── */}
      <Dialog open={showImageGallery} onOpenChange={setShowImageGallery}>
        <DialogContent className="max-w-[95vw] sm:max-w-3xl lg:max-w-5xl max-h-[95vh] p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-4 sm:px-6 pt-5 pb-3 border-b">
            <div className="flex items-center justify-between gap-2">
              <div>
                <DialogTitle className="text-xl font-bold">Property Images</DialogTitle>
                <DialogDescription className="text-sm mt-1">
                  {selectedImageIndex + 1} of {allImageUrls.length}
                  {allImageUrls[selectedImageIndex] && selectedImageIndex >= existingImages.length && (
                    <Badge className="ml-2 bg-orange-100 text-orange-700 border-orange-200 text-xs">New</Badge>
                  )}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="relative p-4 sm:p-6 overflow-y-auto">
            <div className="group relative w-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden shadow-2xl flex items-center justify-center">
              <div className="w-full h-[55vh] flex items-center justify-center" style={{ minHeight: 300, maxHeight: 800 }}>
                {allImageUrls[selectedImageIndex] && (
                  <img
                    src={allImageUrls[selectedImageIndex]}
                    alt={`Image ${selectedImageIndex + 1}`}
                    className="max-w-full max-h-full w-auto h-auto object-contain"
                  />
                )}
              </div>

              {allImageUrls.length > 1 && (
                <>
                  <Button type="button" size="icon" variant="secondary" onClick={goToPrev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/95 hover:bg-white shadow-2xl border-2 border-gray-200 hover:scale-110 transition-all md:opacity-0 md:group-hover:opacity-100"
                  >
                    <ChevronLeft className="h-6 w-6 text-gray-700" />
                  </Button>
                  <Button type="button" size="icon" variant="secondary" onClick={goToNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/95 hover:bg-white shadow-2xl border-2 border-gray-200 hover:scale-110 transition-all md:opacity-0 md:group-hover:opacity-100"
                  >
                    <ChevronRight className="h-6 w-6 text-gray-700" />
                  </Button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/75 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm md:opacity-0 md:group-hover:opacity-100">
                    {selectedImageIndex + 1} / {allImageUrls.length}
                  </div>
                </>
              )}
            </div>

            {allImageUrls.length > 1 && (
              <div className="mt-4">
                <div className="flex items-center gap-3 overflow-x-auto pb-2 px-1">
                  {allImageUrls.map((url, idx) => (
                    <button
                      key={idx} onClick={() => setSelectedImageIndex(idx)}
                      className={`relative shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all ${
                        idx === selectedImageIndex
                          ? 'ring-4 ring-orange-500 scale-105 shadow-lg'
                          : 'ring-2 ring-gray-200 hover:ring-orange-300 hover:scale-105'
                      }`}
                    >
                      <img src={url} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                      {idx === selectedImageIndex && <div className="absolute inset-0 bg-orange-500/20" />}
                      {idx >= existingImages.length && (
                        <div className="absolute bottom-1 right-1 bg-orange-500 text-white text-[9px] px-1 py-0.5 rounded font-bold">NEW</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ── */}
      <AlertDialog open={imageToDelete !== null} onOpenChange={() => setImageToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this image? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!imageToDelete) return;
                if (imageToDelete.type === 'existing') {
                  removeExistingImage(imageToDelete.index);
                } else {
                  removeNewImage(imageToDelete.index);
                }
              }}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}