import { LayoutDashboard, Users, CreditCard, Settings, LogOut, Wallet, Bitcoin, MessageSquare, CreditCard as VirtualCard, Banknote, Shield, Activity } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { chatService } from "@/services/chatService";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/Logo";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Users, label: "Users", href: "/users" },
  { icon: Wallet, label: "Accounts", href: "/accounts" },
  { icon: CreditCard, label: "Transactions", href: "/transactions" },
  { icon: Banknote, label: "Loans", href: "/loans" },
  { icon: VirtualCard, label: "Virtual Cards", href: "/virtual-cards" },
  { icon: Bitcoin, label: "Crypto Wallets", href: "/crypto-wallets" },
  { icon: Shield, label: "KYC Management", href: "/kyc" },
  { icon: Activity, label: "Activity Log", href: "/activity-log" },
  { icon: MessageSquare, label: "Support", href: "/support" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar() {
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const count = await chatService.getUnreadCount();
        setUnreadCount(count);
      } catch (err) {
        console.error("Failed to fetch unread support messages", err);
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen w-64 flex-col border-r border-border/50 bg-sidebar/95 backdrop-blur supports-[backdrop-filter]:bg-sidebar/60">
      <div className="flex h-16 items-center px-6 border-b border-border/50">
        <Logo variant="dark" size="sm" linkTo="/" />
      </div>
      <div className="flex-1 overflow-auto py-6">
        <nav className="grid items-start px-4 text-sm font-medium gap-2">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.href;
            const isSupport = item.label === "Support";
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all text-foreground/80 hover:text-foreground hover:bg-muted/50 relative",
                  isActive && "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary font-semibold"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span className="flex-1">{item.label}</span>
                {isSupport && unreadCount > 0 && (
                  <Badge variant="destructive" className="h-5 min-w-[20px] px-1.5 flex items-center justify-center text-[10px]">
                    {unreadCount}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="border-t border-border/50 p-4">
        <button 
          onClick={() => {
            localStorage.removeItem('admin_token');
            window.location.reload();
          }}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
}
