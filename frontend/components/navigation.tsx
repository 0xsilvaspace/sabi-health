"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import * as NextNavigation from "next/navigation";
import { useEffect, useState } from "react";
import { HeartPulse } from "lucide-react";

export function Navigation() {
  const pathname = NextNavigation.usePathname();
  const router = NextNavigation.useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("sabi_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("sabi_user");
    setUser(null);
    router.push("/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 glass-morphism mx-auto mt-4 max-w-5xl rounded-3xl border border-white/10 shadow-2xl">
      <Link href="/" className="flex items-center gap-2 group">
        <div className="bg-primary p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-primary/20">
          <HeartPulse className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight text-foreground">
          Sabi<span className="text-primary">Health</span>
        </span>
      </Link>

      <div className="hidden md:flex items-center gap-8 text-sm font-medium">
        <Link 
          href="/" 
          className={cn(
            "hover:text-primary transition-colors",
            pathname === "/" ? "text-primary" : "text-muted-foreground"
          )}
        >
          Home
        </Link>
        {user && (
          <>
            <Link 
              href="/dashboard" 
              className={cn(
                "hover:text-primary transition-colors",
                pathname === "/dashboard" ? "text-primary" : "text-muted-foreground"
              )}
            >
              Dashboard
            </Link>
            <Link 
              href="/logs" 
              className={cn(
                "hover:text-primary transition-colors",
                pathname === "/logs" ? "text-primary" : "text-muted-foreground"
              )}
            >
              Recent Alerts
            </Link>
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <Button variant="ghost" size="sm" className="rounded-full" onClick={handleLogout}>
            Logout
          </Button>
        ) : (
          <>
            <Link href="/login">
              <Button variant="ghost" size="sm" className="rounded-full">
                Log in
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="premium" size="sm" className="rounded-full px-6">
                Join Sabi
              </Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
