import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/api';
import { User, Mail, Phone, Shield, Star, Edit2, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ProfileData {
  full_name: string;
  phone: string;
  preferred_language: string;
  kyc_status: string;
  tier: string;
  user: { email: string };
}

const Profile = () => {
  const { t } = useLanguage();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    apiRequest<ProfileData>('/profile/').then((data) => {
      setProfile(data);
      setFormData({
        name: data.full_name,
        email: data.user.email,
        phone: data.phone,
      });
    });
  }, []);

  const handleSave = async () => {
    try {
      const data = await apiRequest<ProfileData>('/profile/', {
        method: 'PATCH',
        body: JSON.stringify({ full_name: formData.name, phone: formData.phone }),
      });
      setProfile(data);
      setIsEditing(false);
      toast({
        title: t('common.success'),
        description: 'Your profile has been updated.',
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-20 lg:pb-0">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
          {t('profile.title')}
        </h1>
        <p className="text-muted-foreground mt-1">Manage your personal information</p>
      </div>

      <div className="bg-card rounded-2xl shadow-card overflow-hidden">
        <div className="h-24 gradient-primary" />
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 mb-6">
            <div className="w-24 h-24 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-3xl font-bold border-4 border-card shadow-lg">
              {formData.name ? formData.name.slice(0, 2).toUpperCase() : 'SR'}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-foreground">{formData.name}</h2>
              <p className="text-muted-foreground">{formData.email}</p>
            </div>
            <Button
              variant={isEditing ? 'default' : 'secondary'}
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            >
              {isEditing ? (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {t('action.save')}
                </>
              ) : (
                <>
                  <Edit2 className="h-4 w-4 mr-2" />
                  {t('action.edit')}
                </>
              )}
            </Button>
          </div>

          <div className="flex flex-wrap gap-3 mb-8">
            <Badge variant="secondary" className="gap-1">
              <Star className="h-3 w-3" />
              {profile?.tier} Account
            </Badge>
            <Badge variant="outline" className="gap-1 text-success border-success/30 bg-success/5">
              <Shield className="h-3 w-3" />
              {profile?.kyc_status === 'VERIFIED' ? t('profile.verified') : t('profile.pending')}
            </Badge>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {t('auth.name')}
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isEditing}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {t('auth.email')}
              </Label>
              <Input id="email" type="email" value={formData.email} disabled className="h-12" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {t('auth.phone')}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
