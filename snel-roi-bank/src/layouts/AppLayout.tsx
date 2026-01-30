import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { LanguageSwitch } from '@/components/LanguageSwitch';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { UserProfileDropdown } from '@/components/UserProfileDropdown';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  ArrowDownToLine,
  ArrowUpFromLine,
  Send,
  FileText,
  List,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  CreditCard,
  HelpCircle,
  Bell,
  Banknote,
  Receipt,
  Award,
} from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { t } = useLanguage();
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navCategories = [
    {
      title: 'Overview',
      items: [
        { path: '/app/dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
      ]
    },
    {
      title: 'Banking',
      items: [
        { path: '/app/deposit', icon: ArrowDownToLine, label: t('nav.deposit') },
        { path: '/app/transfer', icon: Send, label: t('nav.transfer') },
        { path: '/app/withdraw', icon: ArrowUpFromLine, label: t('nav.withdraw') },
        { path: '/app/transactions', icon: List, label: t('nav.transactions') },
        { path: '/app/statements', icon: FileText, label: t('nav.statements') },
      ]
    },
    {
      title: 'Financial Services',
      items: [
        { path: '/app/loans', icon: Banknote, label: t('nav.loans') },
        { path: '/app/grants', icon: Award, label: t('nav.grants') },
        { path: '/app/tax-refund', icon: Receipt, label: t('nav.taxRefund') },
        { path: '/app/virtual-cards', icon: CreditCard, label: t('nav.virtualCards') },
      ]
    },
    {
      title: 'Account',
      items: [
        { path: '/app/notifications', icon: Bell, label: 'Notifications' },
        { path: '/app/profile', icon: User, label: t('nav.profile') },
        { path: '/app/settings', icon: Settings, label: t('nav.settings') },
        { path: '/app/help', icon: HelpCircle, label: 'Help & Support' },
      ]
    }
  ];

  // Flatten for mobile nav (keep existing mobile nav working)
  const navItems = navCategories.flatMap(category => category.items);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-sidebar text-sidebar-foreground fixed left-0 top-0 h-screen z-10">
        <div className="p-6 flex-shrink-0">
          <Logo variant="light" />
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <nav className="flex-1 px-4 space-y-4 overflow-y-auto">
            {navCategories.map((category) => (
              <div key={category.title} className="space-y-1">
                <h3 className="px-4 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
                  {category.title}
                </h3>
                <div className="space-y-1">
                  {category.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="p-4 flex-shrink-0 border-t border-sidebar-border">
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              {t('nav.logout')}
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-foreground/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Mobile */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-sidebar text-sidebar-foreground transform transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 flex-shrink-0">
            <Logo variant="light" />
            <Button
              variant="ghost"
              size="icon"
              className="text-sidebar-foreground"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="flex-1 px-4 space-y-4 overflow-y-auto">
            {navCategories.map((category) => (
              <div key={category.title} className="space-y-1">
                <h3 className="px-4 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
                  {category.title}
                </h3>
                <div className="space-y-1">
                  {category.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="p-4 flex-shrink-0 border-t border-sidebar-border">
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              {t('nav.logout')}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <NotificationBell />
              <ThemeToggle variant="compact" />
              <LanguageSwitch variant="compact" />
              <UserProfileDropdown />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>

        {/* Mobile Bottom Nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border safe-area-pb">
          <div className="grid grid-cols-5 gap-1 px-2 py-2">
            {navItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center py-2 px-1 rounded-lg transition-colors ${
                    isActive
                      ? 'text-primary bg-primary/5'
                      : 'text-muted-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[10px] mt-1 truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Chat Widget */}
        <ChatWidget />
      </div>
    </div>
  );
};
