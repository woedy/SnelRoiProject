import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { languages } from '@/i18n/translations';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Globe, Bell, Shield, Sliders, Check, Palette, Sun, Moon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Settings = () => {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
  });
  const [security, setSecurity] = useState({
    twoFactor: true,
    biometric: false,
  });

  const handleSave = () => {
    toast({
      title: t('common.success'),
      description: 'Settings saved successfully.',
    });
  };

  return (
    <div className="max-w-2xl mx-auto pb-20 lg:pb-0">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
          {t('settings.title')}
        </h1>
        <p className="text-muted-foreground mt-1">
          Customize your experience
        </p>
      </div>

      <div className="space-y-6">
        {/* Language Settings */}
        <div className="bg-card rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">{t('settings.language')}</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  language === lang.code
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span className="font-medium">{lang.name}</span>
                {language === lang.code && (
                  <Check className="h-4 w-4 text-primary ml-auto" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Theme Settings */}
        <div className="bg-card rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Palette className="h-5 w-5 text-accent" />
            </div>
            <h3 className="font-semibold text-foreground">{t('settings.theme')}</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setTheme('light')}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                theme === 'light'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <Sun className="h-5 w-5" />
              <span className="font-medium">{t('settings.lightMode')}</span>
              {theme === 'light' && (
                <Check className="h-4 w-4 text-primary ml-auto" />
              )}
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                theme === 'dark'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <Moon className="h-5 w-5" />
              <span className="font-medium">{t('settings.darkMode')}</span>
              {theme === 'dark' && (
                <Check className="h-4 w-4 text-primary ml-auto" />
              )}
            </button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-card rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
              <Bell className="h-5 w-5 text-info" />
            </div>
            <h3 className="font-semibold text-foreground">{t('settings.notifications')}</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3">
              <div>
                <Label className="font-medium">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive updates via email</p>
              </div>
              <Switch
                checked={notifications.email}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, email: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between py-3 border-t border-border">
              <div>
                <Label className="font-medium">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Get instant alerts on your device</p>
              </div>
              <Switch
                checked={notifications.push}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, push: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between py-3 border-t border-border">
              <div>
                <Label className="font-medium">SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive SMS for important alerts</p>
              </div>
              <Switch
                checked={notifications.sms}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, sms: checked })
                }
              />
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-card rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-success" />
            </div>
            <h3 className="font-semibold text-foreground">{t('settings.security')}</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3">
              <div>
                <Label className="font-medium">{t('settings.twoFactor')}</Label>
                <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
              </div>
              <Switch
                checked={security.twoFactor}
                onCheckedChange={(checked) =>
                  setSecurity({ ...security, twoFactor: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between py-3 border-t border-border">
              <div>
                <Label className="font-medium">{t('settings.biometric')}</Label>
                <p className="text-sm text-muted-foreground">Use fingerprint or face recognition</p>
              </div>
              <Switch
                checked={security.biometric}
                onCheckedChange={(checked) =>
                  setSecurity({ ...security, biometric: checked })
                }
              />
            </div>
          </div>
        </div>

        {/* Transaction Limits */}
        <div className="bg-card rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <Sliders className="h-5 w-5 text-warning" />
            </div>
            <h3 className="font-semibold text-foreground">{t('settings.limits')}</h3>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-3">
              <span className="text-muted-foreground">{t('settings.daily')}</span>
              <span className="font-semibold">$10,000</span>
            </div>
            <div className="flex justify-between items-center py-3 border-t border-border">
              <span className="text-muted-foreground">{t('settings.monthly')}</span>
              <span className="font-semibold">$50,000</span>
            </div>
          </div>
        </div>

        <Button size="lg" className="w-full" onClick={handleSave}>
          {t('action.save')}
        </Button>
      </div>
    </div>
  );
};

export default Settings;
