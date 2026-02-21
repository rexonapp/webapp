'use client'
import { useState } from 'react';
import { AlertCircle, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// shadcn/ui imports
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface CustomerFormData {
  fullName: string;
  email: string;
  mobileNumber: string;
  city: string;
  completeAddress: string;
}

interface FieldErrors {
  fullName?: string;
  mobileNumber?: string;
  email?: string;
  city?: string;
  completeAddress?: string;
}

export default function CustomerOnboardingForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<CustomerFormData>({
    fullName: '',
    email: '',
    mobileNumber: '',
    city: '',
    completeAddress: '',
  });

  const [uploading, setUploading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  const validateField = (name: string, value: any): string | undefined => {
    switch (name) {
      case 'fullName':
        if (!value || value.trim() === '') return 'Full name is requiorange';
        if (value.length < 3) return 'Name must be at least 3 characters';
        break;

      case 'mobileNumber':
        if (!value || value.trim() === '') return 'Mobile number is requiorange';
        if (!/^[6-9]\d{9}$/.test(value.replace(/\s/g, ''))) {
          return 'Enter a valid 10-digit mobile number';
        }
        break;

      case 'email':
        if (!value || value.trim() === '') return 'Email is requiorange';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Enter a valid email address';
        }
        break;

      case 'completeAddress':
        if (!value || value.trim() === '') return 'Complete address is requiorange';
        if (value.length < 10) return 'Please provide a complete address';
        break;

      case 'city':
        if (!value || value.trim() === '') return 'City is requiorange';
        break;
    }
    return undefined;
  };

  const handleFieldChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));

    // Mark field as touched
    setTouchedFields(prev => new Set(prev).add(name));

    // Validate field
    const error = validateField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleFieldBlur = (name: string) => {
    setTouchedFields(prev => new Set(prev).add(name));
    const error = validateField(name, formData[name as keyof CustomerFormData]);
    setFieldErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const validateForm = (): boolean => {
    const errors: FieldErrors = {};
    const requiorangeFields = ['fullName', 'mobileNumber', 'email', 'completeAddress', 'city'];

    // Validate all requiorange fields
    requiorangeFields.forEach(field => {
      const error = validateField(field, formData[field as keyof CustomerFormData]);
      if (error) {
        errors[field as keyof FieldErrors] = error;
      }
    });

    // Set all errors and mark all fields as touched
    setFieldErrors(errors);
    const allFields = new Set(requiorangeFields);
    setTouchedFields(allFields);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fill in all requiorange fields correctly');

      // Scroll to first error
      const firstErrorField = document.querySelector('.border-orange-500');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setUploading(true);

    try {
      const uploadFormData = new FormData();

      // Append all form fields
      Object.entries(formData).forEach(([key, value]) => {
        uploadFormData.append(key, value.toString());
      });

      const response = await fetch('/api/customers/register', {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      toast.success('Registration completed successfully!', {
        description: 'Welcome aboard! We will help you find your dream property.',
      });

      setTimeout(() => {
        router.push('/');
      }, 2000);

    } catch (error) {
      toast.error('Registration failed', {
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <span>Home</span>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Customer Registration</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Customer Registration</h1>
          <p className="text-gray-600">Join our community and let us help you find your perfect property. Fill out the form below to get started on your property journey.</p>
        </div>

        {/* Single Form Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center mr-3">
                <User className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <CardTitle>Customer Onboarding</CardTitle>
                <CardDescription>Please provide your details to get started</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">
                Full Name <span className="text-orange-500">*</span>
              </Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleFieldChange('fullName', e.target.value)}
                onBlur={() => handleFieldBlur('fullName')}
                placeholder="e.g., John Doe"
                className={`h-11 ${touchedFields.has('fullName') && fieldErrors.fullName ? 'border-orange-500' : ''}`}
              />
              {touchedFields.has('fullName') && fieldErrors.fullName && (
                <p className="text-sm text-orange-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-4 w-4" />
                  {fieldErrors.fullName}
                </p>
              )}
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email Address <span className="text-orange-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                onBlur={() => handleFieldBlur('email')}
                placeholder="john@example.com"
                className={`h-11 ${touchedFields.has('email') && fieldErrors.email ? 'border-orange-500' : ''}`}
              />
              {touchedFields.has('email') && fieldErrors.email && (
                <p className="text-sm text-orange-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-4 w-4" />
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Mobile Number and City - Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="mobileNumber">
                  Mobile Number <span className="text-orange-500">*</span>
                </Label>
                <Input
                  id="mobileNumber"
                  type="tel"
                  pattern='[0-9]{10}'
                  maxLength={10}
                  minLength={10}
                  value={formData.mobileNumber}
                  onChange={(e) => handleFieldChange('mobileNumber', e.target.value)}
                  onBlur={() => handleFieldBlur('mobileNumber')}
                  placeholder="+91 98765 43210"
                  className={`h-11 ${touchedFields.has('mobileNumber') && fieldErrors.mobileNumber ? 'border-orange-500' : ''}`}
                />
                {touchedFields.has('mobileNumber') && fieldErrors.mobileNumber && (
                  <p className="text-sm text-orange-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-4 w-4" />
                    {fieldErrors.mobileNumber}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">
                  City <span className="text-orange-500">*</span>
                </Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleFieldChange('city', e.target.value)}
                  onBlur={() => handleFieldBlur('city')}
                  placeholder="Mumbai"
                  className={`h-11 ${touchedFields.has('city') && fieldErrors.city ? 'border-orange-500' : ''}`}
                />
                {touchedFields.has('city') && fieldErrors.city && (
                  <p className="text-sm text-orange-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-4 w-4" />
                    {fieldErrors.city}
                  </p>
                )}
              </div>
            </div>

            {/* Complete Address */}
            <div className="space-y-2">
              <Label htmlFor="completeAddress">
                Complete Address <span className="text-orange-500">*</span>
              </Label>
              <Textarea
                id="completeAddress"
                value={formData.completeAddress}
                onChange={(e) => handleFieldChange('completeAddress', e.target.value)}
                onBlur={() => handleFieldBlur('completeAddress')}
                rows={4}
                placeholder="Enter your complete address including street, building name, landmark, area, etc."
                className={`resize-none ${touchedFields.has('completeAddress') && fieldErrors.completeAddress ? 'border-orange-500' : ''}`}
              />
              {touchedFields.has('completeAddress') && fieldErrors.completeAddress && (
                <p className="text-sm text-orange-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-4 w-4" />
                  {fieldErrors.completeAddress}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={handleSubmit}
                disabled={uploading}
                className="sm:flex-1 bg-orange-600 hover:bg-orange-700 text-white h-11 text-sm font-semibold"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  'Complete Registration'
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={uploading}
                className="sm:w-32 h-11 text-sm font-medium"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
