import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  User, Mail, Phone, Shield, Star, Edit2, Save, MapPin, Calendar,
  Briefcase, Globe, Upload, FileText, CheckCircle, XCircle, Clock,
  AlertTriangle, Eye, Trash2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { kycService, DOCUMENT_TYPES, GENDER_OPTIONS, getKYCStatusColor, getDocumentStatusColor, type KYCDocument, type ProfileData } from '@/services/kycService';

const Profile = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [kycDocuments, setKycDocuments] = useState<KYCDocument[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);
  const [isSubmittingKYC, setIsSubmittingKYC] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    middle_name: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    nationality: '',
    occupation: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state_province: '',
    postal_code: '',
    country: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        await Promise.all([loadProfileData(), loadKYCDocuments()]);
      } catch (err) {
        console.error('Error loading profile data:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const loadProfileData = async () => {
    try {
      console.log('Loading profile data...');
      const data = await kycService.getProfile();
      console.log('Profile data loaded:', data);
      setProfile(data);
      setFormData({
        full_name: data.full_name || '',
        middle_name: data.middle_name || '',
        phone: data.phone || '',
        date_of_birth: data.date_of_birth || '',
        gender: data.gender || '',
        nationality: data.nationality || '',
        occupation: data.occupation || '',
        address_line_1: data.address_line_1 || '',
        address_line_2: data.address_line_2 || '',
        city: data.city || '',
        state_province: data.state_province || '',
        postal_code: data.postal_code || '',
        country: data.country || '',
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
      // Set a default profile to prevent blank page
      setProfile({
        full_name: '',
        middle_name: '',
        phone: '',
        country: '',
        preferred_language: 'en',
        date_of_birth: null,
        gender: '',
        gender_display: '',
        nationality: '',
        occupation: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state_province: '',
        postal_code: '',
        kyc_status: 'PENDING',
        kyc_status_display: 'Pending',
        kyc_submitted_at: null,
        kyc_verified_at: null,
        kyc_rejection_reason: '',
        tier: 'STANDARD',
        tier_display: 'Standard',
        profile_completion_percentage: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user: {
          id: 1,
          email: 'user@example.com',
          username: 'user',
          first_name: '',
          last_name: '',
          is_staff: false,
          is_active: true,
        },
      });
      toast({
        title: 'Error',
        description: 'Failed to load profile data. Using default values.',
        variant: 'destructive',
      });
    }
  };

  const loadKYCDocuments = async () => {
    try {
      console.log('Loading KYC documents...');
      const documents = await kycService.getKYCDocuments();
      console.log('KYC documents loaded:', documents);
      setKycDocuments(documents);
    } catch (error) {
      console.error('Failed to load KYC documents:', error);
      // Set empty array to prevent errors
      setKycDocuments([]);
    }
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      const data = await kycService.updateProfile(formData);
      setProfile(data);
      setIsEditing(false);
      toast({
        title: 'Success',
        description: 'Your profile has been updated.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'File size must be less than 10MB',
        variant: 'destructive',
      });
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Error',
        description: 'Only JPEG, PNG, and PDF files are allowed',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsUploadingDocument(true);
      const formData = new FormData();
      formData.append('document_file', file);
      formData.append('document_type', documentType);
      
      const newDocument = await kycService.uploadKYCDocument(formData);
      setKycDocuments(prev => [...prev.filter(doc => doc.document_type !== documentType), newDocument]);
      
      toast({
        title: 'Success',
        description: 'Document uploaded successfully',
      });
      
      // Reload profile to update completion percentage
      await loadProfileData();
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setIsUploadingDocument(false);
    }
  };

  const handleDeleteDocument = async (documentId: number) => {
    try {
      await kycService.deleteKYCDocument(documentId);
      setKycDocuments(prev => prev.filter(doc => doc.id !== documentId));
      toast({
        title: 'Success',
        description: 'Document deleted successfully',
      });
      // Reload profile to update completion percentage
      await loadProfileData();
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  };

  const handleSubmitKYC = async () => {
    try {
      setIsSubmittingKYC(true);
      const result = await kycService.submitKYC();
      await loadProfileData(); // Reload to get updated status
      toast({
        title: 'Success',
        description: result.detail,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingKYC(false);
    }
  };

  const canSubmitKYC = () => {
    if (!profile) return false;
    if (profile.kyc_status === 'VERIFIED' || profile.kyc_status === 'UNDER_REVIEW') return false;
    
    // Check if required documents are uploaded
    const requiredDocs = ['PASSPORT', 'NATIONAL_ID', 'DRIVERS_LICENSE']; // At least one ID document
    const hasIdDocument = kycDocuments.some(doc => 
      requiredDocs.includes(doc.document_type) && doc.status !== 'REJECTED'
    );
    
    const hasProofOfAddress = kycDocuments.some(doc => 
      ['UTILITY_BILL', 'BANK_STATEMENT', 'PROOF_OF_ADDRESS'].includes(doc.document_type) && 
      doc.status !== 'REJECTED'
    );
    
    // Check if basic profile info is complete
    const hasBasicInfo = formData.full_name && formData.phone && formData.date_of_birth && 
                        formData.address_line_1 && formData.city && formData.country;
    
    // Debug logging
    console.log('KYC Validation Debug:', {
      hasIdDocument,
      hasProofOfAddress,
      hasBasicInfo,
      kycDocuments,
      formData: {
        full_name: formData.full_name,
        phone: formData.phone,
        date_of_birth: formData.date_of_birth,
        address_line_1: formData.address_line_1,
        city: formData.city,
        country: formData.country
      }
    });
    
    return hasIdDocument && hasProofOfAddress && hasBasicInfo;
  };

  const getSubmissionRequirements = () => {
    if (!profile) return [];
    
    const requirements = [];
    
    // Check ID document
    const requiredDocs = ['PASSPORT', 'NATIONAL_ID', 'DRIVERS_LICENSE'];
    const hasIdDocument = kycDocuments.some(doc => 
      requiredDocs.includes(doc.document_type) && doc.status !== 'REJECTED'
    );
    if (!hasIdDocument) {
      requirements.push('Upload at least one identity document (Passport, National ID, or Driver\'s License)');
    }
    
    // Check proof of address
    const hasProofOfAddress = kycDocuments.some(doc => 
      ['UTILITY_BILL', 'BANK_STATEMENT', 'PROOF_OF_ADDRESS'].includes(doc.document_type) && 
      doc.status !== 'REJECTED'
    );
    if (!hasProofOfAddress) {
      requirements.push('Upload a proof of address document');
    }
    
    // Check basic info
    const missingFields = [];
    if (!formData.full_name) missingFields.push('Full Name');
    if (!formData.phone) missingFields.push('Phone Number');
    if (!formData.date_of_birth) missingFields.push('Date of Birth');
    if (!formData.address_line_1) missingFields.push('Address');
    if (!formData.city) missingFields.push('City');
    if (!formData.country) missingFields.push('Country');
    
    if (missingFields.length > 0) {
      requirements.push(`Complete your profile: ${missingFields.join(', ')}`);
    }
    
    return requirements;
  };

  const getKYCStatusColorLocal = (status: string) => {
    return getKYCStatusColor(status);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto pb-20 lg:pb-0 space-y-6">
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-slate-900 dark:text-slate-100">
            Profile
          </h1>
          <p className="text-muted-foreground mt-1">Loading your profile information...</p>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto pb-20 lg:pb-0 space-y-6">
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-slate-900 dark:text-slate-100">
            Profile
          </h1>
          <p className="text-muted-foreground mt-1">There was an error loading your profile</p>
        </div>
        <div className="flex justify-center items-center h-64 text-center">
          <div>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20 lg:pb-0 space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-slate-900 dark:text-slate-100">
          Profile
        </h1>
        <p className="text-muted-foreground mt-1">Manage your personal information</p>
      </div>

      {/* Profile Header Card */}
      <Card>
        <div className="h-24 bg-gradient-to-r from-slate-100 to-slate-200 dark:gradient-primary" />
        <CardContent className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 mb-6">
            <div className="w-24 h-24 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-3xl font-bold border-4 border-card shadow-lg">
              {formData.full_name ? formData.full_name.slice(0, 2).toUpperCase() : 'SR'}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{formData.full_name}</h2>
              <p className="text-slate-600 dark:text-white/80">{profile.user.email}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="secondary" className="gap-1">
                  <Star className="h-3 w-3" />
                  {profile.tier} Account
                </Badge>
                <Badge className={`gap-1 ${getKYCStatusColorLocal(profile.kyc_status)}`}>
                  <Shield className="h-3 w-3" />
                  {profile.kyc_status_display || profile.kyc_status}
                </Badge>
              </div>
            </div>
            <Button
              variant={isEditing ? 'default' : 'secondary'}
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              disabled={isSubmitting}
            >
              {isEditing ? (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </>
              ) : (
                <>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </>
              )}
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Profile Completion</span>
              <span>{profile.profile_completion_percentage || 0}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300 ease-in-out"
                style={{ width: `${profile.profile_completion_percentage || 0}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="address">Address</TabsTrigger>
          <TabsTrigger value="kyc">KYC Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-slate-100">Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name *
                  </Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    disabled={!isEditing}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="middle_name">Middle Name</Label>
                  <Input
                    id="middle_name"
                    value={formData.middle_name}
                    onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                    disabled={!isEditing}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={profile.user.email} 
                    disabled 
                    className="h-12 bg-muted" 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditing}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date_of_birth" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date of Birth
                  </Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    disabled={!isEditing}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nationality" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Nationality
                  </Label>
                  <Input
                    id="nationality"
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    disabled={!isEditing}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Gender
                  </Label>
                  <Select
                    value={formData.gender || undefined}
                    onValueChange={(value) => setFormData({ ...formData, gender: value })}
                    disabled={!isEditing}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENDER_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="occupation" className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Occupation
                  </Label>
                  <Input
                    id="occupation"
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    disabled={!isEditing}
                    className="h-12"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="address" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <MapPin className="h-5 w-5" />
                Address Information
              </CardTitle>
              <CardDescription>Your residential address details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address_line_1">Address Line 1</Label>
                  <Input
                    id="address_line_1"
                    value={formData.address_line_1}
                    onChange={(e) => setFormData({ ...formData, address_line_1: e.target.value })}
                    disabled={!isEditing}
                    className="h-12"
                    placeholder="Street address, P.O. box, company name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address_line_2">Address Line 2</Label>
                  <Input
                    id="address_line_2"
                    value={formData.address_line_2}
                    onChange={(e) => setFormData({ ...formData, address_line_2: e.target.value })}
                    disabled={!isEditing}
                    className="h-12"
                    placeholder="Apartment, suite, unit, building, floor, etc."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      disabled={!isEditing}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state_province">State/Province</Label>
                    <Input
                      id="state_province"
                      value={formData.state_province}
                      onChange={(e) => setFormData({ ...formData, state_province: e.target.value })}
                      disabled={!isEditing}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postal_code">Postal Code</Label>
                    <Input
                      id="postal_code"
                      value={formData.postal_code}
                      onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                      disabled={!isEditing}
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    disabled={!isEditing}
                    className="h-12"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kyc" className="space-y-4">
          {/* KYC Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <Shield className="h-5 w-5" />
                KYC Verification Status
              </CardTitle>
              <CardDescription>
                Complete your identity verification to unlock all banking features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      profile?.kyc_status === 'VERIFIED' ? 'bg-green-100' :
                      profile?.kyc_status === 'UNDER_REVIEW' ? 'bg-blue-100' :
                      profile?.kyc_status === 'REJECTED' ? 'bg-red-100' : 'bg-gray-100'
                    }`}>
                      {profile?.kyc_status === 'VERIFIED' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : profile?.kyc_status === 'UNDER_REVIEW' ? (
                        <Clock className="h-5 w-5 text-blue-600" />
                      ) : profile?.kyc_status === 'REJECTED' ? (
                        <XCircle className="h-5 w-5 text-red-600" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {profile?.kyc_status_display || profile?.kyc_status || 'Pending'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {profile?.kyc_status === 'VERIFIED' && profile?.kyc_verified_at && 
                          `Verified on ${new Date(profile.kyc_verified_at).toLocaleDateString()}`
                        }
                        {profile?.kyc_status === 'UNDER_REVIEW' && profile?.kyc_submitted_at &&
                          `Submitted on ${new Date(profile.kyc_submitted_at).toLocaleDateString()}`
                        }
                        {profile?.kyc_status === 'REJECTED' && 'Please update and resubmit'}
                        {profile?.kyc_status === 'PENDING' && 'Upload documents to get started'}
                      </p>
                    </div>
                  </div>
                  {profile?.kyc_status !== 'VERIFIED' && profile?.kyc_status !== 'UNDER_REVIEW' && (
                    <Button
                      onClick={handleSubmitKYC}
                      disabled={!canSubmitKYC() || isSubmittingKYC}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {isSubmittingKYC ? 'Submitting...' : 'Submit for Review'}
                    </Button>
                  )}
                </div>

                {/* Requirements section when button is disabled */}
                {profile?.kyc_status !== 'VERIFIED' && profile?.kyc_status !== 'UNDER_REVIEW' && !canSubmitKYC() && (
                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                          Complete the following to submit for review:
                        </p>
                        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                          {getSubmissionRequirements().map((requirement, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-blue-500 mt-1">•</span>
                              <span>{requirement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {profile?.kyc_status === 'REJECTED' && profile?.kyc_rejection_reason && (
                  <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                    <div className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-900 dark:text-red-100 mb-1">
                          Verification Rejected
                        </p>
                        <p className="text-sm text-red-700 dark:text-red-300">
                          {profile.kyc_rejection_reason}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Document Upload Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-slate-100">Identity Documents</CardTitle>
              <CardDescription>
                Upload clear photos or scans of your identity documents. Accepted formats: JPEG, PNG, PDF (max 10MB)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Identity Documents Section */}
                <div>
                  <h4 className="font-medium text-foreground mb-3">Identity Verification (Choose One)</h4>
                  <div className="grid gap-4">
                    {DOCUMENT_TYPES.filter(type => ['PASSPORT', 'NATIONAL_ID', 'DRIVERS_LICENSE'].includes(type.value)).map((docType) => {
                      const existingDoc = kycDocuments.find(doc => doc.document_type === docType.value);
                      return (
                        <div key={docType.value} className="flex items-center justify-between p-4 rounded-xl border border-border">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-foreground">{docType.label}</p>
                              {existingDoc && (
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge className={getDocumentStatusColor(existingDoc.status)}>
                                    {existingDoc.status_display}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    Uploaded {new Date(existingDoc.uploaded_at).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {existingDoc && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(existingDoc.document_url, '_blank')}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteDocument(existingDoc.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isUploadingDocument}
                              onClick={() => document.getElementById(`upload-${docType.value}`)?.click()}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              {existingDoc ? 'Replace' : 'Upload'}
                            </Button>
                            <input
                              id={`upload-${docType.value}`}
                              type="file"
                              accept="image/*,.pdf"
                              className="hidden"
                              onChange={(e) => handleDocumentUpload(e, docType.value)}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Proof of Address Section */}
                <div>
                  <h4 className="font-medium text-foreground mb-3">Proof of Address (Choose One)</h4>
                  <div className="grid gap-4">
                    {DOCUMENT_TYPES.filter(type => ['UTILITY_BILL', 'BANK_STATEMENT', 'PROOF_OF_ADDRESS'].includes(type.value)).map((docType) => {
                      const existingDoc = kycDocuments.find(doc => doc.document_type === docType.value);
                      return (
                        <div key={docType.value} className="flex items-center justify-between p-4 rounded-xl border border-border">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-foreground">{docType.label}</p>
                              {existingDoc && (
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge className={getDocumentStatusColor(existingDoc.status)}>
                                    {existingDoc.status_display}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    Uploaded {new Date(existingDoc.uploaded_at).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {existingDoc && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(existingDoc.document_url, '_blank')}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteDocument(existingDoc.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isUploadingDocument}
                              onClick={() => document.getElementById(`upload-${docType.value}`)?.click()}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              {existingDoc ? 'Replace' : 'Upload'}
                            </Button>
                            <input
                              id={`upload-${docType.value}`}
                              type="file"
                              accept="image/*,.pdf"
                              className="hidden"
                              onChange={(e) => handleDocumentUpload(e, docType.value)}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Optional Documents Section */}
                <div>
                  <h4 className="font-medium text-foreground mb-3">Additional Documents (Optional)</h4>
                  <div className="grid gap-4">
                    {DOCUMENT_TYPES.filter(type => type.value === 'SELFIE').map((docType) => {
                      const existingDoc = kycDocuments.find(doc => doc.document_type === docType.value);
                      return (
                        <div key={docType.value} className="flex items-center justify-between p-4 rounded-xl border border-border">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-foreground">{docType.label}</p>
                              <p className="text-sm text-muted-foreground">Hold your ID next to your face</p>
                              {existingDoc && (
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge className={getDocumentStatusColor(existingDoc.status)}>
                                    {existingDoc.status_display}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    Uploaded {new Date(existingDoc.uploaded_at).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {existingDoc && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(existingDoc.document_url, '_blank')}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteDocument(existingDoc.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isUploadingDocument}
                              onClick={() => document.getElementById(`upload-${docType.value}`)?.click()}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              {existingDoc ? 'Replace' : 'Upload'}
                            </Button>
                            <input
                              id={`upload-${docType.value}`}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleDocumentUpload(e, docType.value)}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Submission Guidelines */}
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Document Guidelines</h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Ensure documents are clear and all text is readable</li>
                    <li>• Documents must be valid and not expired</li>
                    <li>• Upload original documents, not photocopies</li>
                    <li>• File size must be less than 10MB</li>
                    <li>• Accepted formats: JPEG, PNG, PDF</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;