import { Sidebar } from "./Sidebar";
import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="flex h-screen w-full bg-background selection:bg-primary/10">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-background to-muted/20 p-8 text-foreground">
        <div className="mx-auto max-w-6xl animate-fade-in relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
