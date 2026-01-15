import { LayoutDashboard, Users, CreditCard, Settings, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Users, label: "Users", href: "/users" },
  { icon: CreditCard, label: "Transactions", href: "/transactions" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="flex h-screen w-64 flex-col border-r border-border/50 bg-sidebar/95 backdrop-blur supports-[backdrop-filter]:bg-sidebar/60">
      <div className="flex h-16 items-center px-6 border-b border-border/50">
        <span className="text-xl font-bold font-display tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          SnelROI Admin
        </span>
      </div>
      <div className="flex-1 overflow-auto py-6">
        <nav className="grid items-start px-4 text-sm font-medium gap-2">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  isActive && "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary font-semibold"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
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
