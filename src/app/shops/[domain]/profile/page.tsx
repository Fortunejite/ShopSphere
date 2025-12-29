'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Edit,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import axios from 'axios';
import { PageLoading } from '@/components/Loading';
import { UserAttributes } from '@/models/User';

interface EditableFields {
  username: string;
  phone_number: string;
  address: string;
  city: string;
}

type UserProfile = Omit<UserAttributes, 'password_hash'>;

export default function ProfilePage() {
  const { data: session, status: authStatus } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [editData, setEditData] = useState<EditableFields>({
    username: '',
    phone_number: '',
    address: '',
    city: ''
  });

  useEffect(() => {
    if (session?.user) {
      fetchProfile();
    } else if (!session) {
      router.push('/login');
    }
  }, [session, router]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await axios.get('/api/profile');
      const profileData = response.data;
      
      setProfile(profileData);
      setEditData({
        username: profileData.username || '',
        phone_number: profileData.phone_number || '',
        address: profileData.address || '',
        city: profileData.city || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          router.push('/login');
        } else {
          setError('Failed to load profile. Please try again.');
        }
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError('');
    setSuccess('');
    setValidationErrors({});
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    setValidationErrors({});
    // Reset edit data to original profile data
    if (profile) {
      setEditData({
        username: profile.username || '',
        phone_number: profile.phone_number || '',
        address: profile.address || '',
        city: profile.city || ''
      });
    }
  };

  const handleInputChange = (field: keyof EditableFields, value: string) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError('');
      setValidationErrors({});
      
      const response = await axios.put('/api/profile', editData);
      
      setProfile(response.data.user);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400 && error.response?.data?.errors) {
          // Handle validation errors
          const errors: Record<string, string> = {};
          error.response.data.errors.forEach((err: { field: string; message: string }) => {
            errors[err.field] = err.message;
          });
          setValidationErrors(errors);
        } else if (error.response?.status === 409) {
          setValidationErrors({ username: 'Username already taken' });
        } else {
          setError(error.response?.data?.message || 'Failed to update profile. Please try again.');
        }
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'user': return 'bg-blue-100 text-blue-800';
      case 'guest': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="w-3 h-3" />;
      case 'user': return <User className="w-3 h-3" />;
      case 'guest': return <User className="w-3 h-3" />;
      default: return <User className="w-3 h-3" />;
    }
  };

  if (isLoading || authStatus === 'loading') {
    return <PageLoading text="Loading profile..." variant="shop" />;
  }

  if (authStatus === 'unauthenticated') {
    router.push(`/login?next=${pathname}`);
    return null;
  }

  if (!profile) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load profile</AlertDescription>
        </Alert>
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="mt-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>
        
        {!isEditing ? (
          <Button onClick={handleEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleCancel}
              disabled={isSaving}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Success Message */}
      {success && (
        <Alert className="border-green-500 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Profile Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Summary Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-gray-600" />
            </div>
            <CardTitle className="text-xl">{profile.username || 'User'}</CardTitle>
            <CardDescription>{profile.email}</CardDescription>
            <div className="flex justify-center mt-2">
              <Badge className={`${getRoleColor(profile.role)} flex items-center gap-1`}>
                {getRoleIcon(profile.role)}
                {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                <span>Joined {new Date(profile.created_at || '').toLocaleDateString()}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                <span>Last updated {new Date(profile.updated_at || '').toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              {isEditing ? 'Update your personal details below' : 'Your current personal information'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">Email cannot be changed</p>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={isEditing ? editData.username : profile.username || ''}
                onChange={(e) => handleInputChange('username', e.target.value)}
                disabled={!isEditing}
                className={validationErrors.username ? 'border-red-500' : ''}
                placeholder="Enter your username"
              />
              {validationErrors.username && (
                <p className="text-xs text-red-600">{validationErrors.username}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phone_number" className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                Phone Number
              </Label>
              <Input
                id="phone_number"
                type="tel"
                value={isEditing ? editData.phone_number : profile.phone_number || ''}
                onChange={(e) => handleInputChange('phone_number', e.target.value)}
                disabled={!isEditing}
                className={validationErrors.phone_number ? 'border-red-500' : ''}
                placeholder="Enter your phone number"
              />
              {validationErrors.phone_number && (
                <p className="text-xs text-red-600">{validationErrors.phone_number}</p>
              )}
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                Address
              </Label>
              <Textarea
                id="address"
                value={isEditing ? editData.address : profile.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                disabled={!isEditing}
                className={validationErrors.address ? 'border-red-500' : ''}
                placeholder="Enter your address"
                rows={3}
              />
              {validationErrors.address && (
                <p className="text-xs text-red-600">{validationErrors.address}</p>
              )}
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label htmlFor="city" className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                City
              </Label>
              <Input
                id="city"
                type="text"
                value={isEditing ? editData.city : profile.city || ''}
                onChange={(e) => handleInputChange('city', e.target.value)}
                disabled={!isEditing}
                className={validationErrors.city ? 'border-red-500' : ''}
                placeholder="Enter your city"
              />
              {validationErrors.city && (
                <p className="text-xs text-red-600">{validationErrors.city}</p>
              )}
            </div>

            {/* Role (read-only) */}
            <div className="space-y-2">
              <Label className="flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                Account Role
              </Label>
              <div className="flex items-center">
                <Badge className={`${getRoleColor(profile.role)} flex items-center gap-1`}>
                  {getRoleIcon(profile.role)}
                  {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                </Badge>
              </div>
              <p className="text-xs text-gray-500">Account role cannot be changed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Additional details about your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Account Created</h4>
              <p className="text-gray-600 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date(profile.created_at || '').toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Last Updated</h4>
              <p className="text-gray-600 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date(profile.updated_at || '').toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}