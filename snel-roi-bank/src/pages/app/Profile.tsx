import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, Shield, Calendar, Star, Edit2, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Profile = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const handleSave = () => {
    setIsEditing(false);
    toast({
      title: t('common.success'),
      description: 'Your profile has been updated.',
    });
  };

  return (
    <div className="max-w-2xl mx-auto pb-20 lg:pb-0">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
          {t('profile.title')}
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your personal information
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-card rounded-2xl shadow-card overflow-hidden">
        {/* Header Banner */}
        <div className="h-24 gradient-primary" />
        
        {/* Avatar & Basic Info */}
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 mb-6">
            <div className="w-24 h-24 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-3xl font-bold border-4 border-card shadow-lg">
              {user?.avatar}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-foreground">{user?.name}</h2>
              <p className="text-muted-foreground">{user?.email}</p>
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

          {/* Account Status */}
          <div className="flex flex-wrap gap-3 mb-8">
            <Badge variant="secondary" className="gap-1">
              <Star className="h-3 w-3" />
              {user?.tier} Account
            </Badge>
            <Badge variant="outline" className="gap-1 text-success border-success/30 bg-success/5">
              <Shield className="h-3 w-3" />
              {t('profile.verified')}
            </Badge>
          </div>

          {/* Form Fields */}
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
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing}
                className="h-12"
              />
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

      {/* Account Details */}
      <div className="mt-6 bg-card rounded-2xl p-6 shadow-card">
        <h3 className="font-semibold text-foreground mb-4">{t('profile.account')}</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-border">
            <span className="text-muted-foreground">{t('profile.tier')}</span>
            <span className="font-medium">{user?.tier}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-border">
            <span className="text-muted-foreground">{t('profile.kyc')}</span>
            <span className="font-medium text-success">{user?.kycStatus}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-border">
            <span className="text-muted-foreground">{t('profile.lastLogin')}</span>
            <span className="font-medium">
              {new Date(user?.lastLogin || '').toLocaleString('de-DE')}
            </span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-muted-foreground">{t('profile.memberSince')}</span>
            <span className="font-medium">
              {new Date(user?.memberSince || '').toLocaleDateString('de-DE', {
                year: 'numeric',
                month: 'long',
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
