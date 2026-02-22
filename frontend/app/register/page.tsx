"use client";

import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegisterUser } from "@/lib/hooks";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { HeartPulse, Loader2 } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const registerMutation = useRegisterUser();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    lga: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate({
      ...formData,
      phone: parseInt(formData.phone),
    }, {
      onSuccess: () => router.push("/login"),
    });
  };

  return (
    <main className="min-h-screen bg-muted/30 flex flex-col items-center justify-center p-4">
      <div className="absolute top-8 left-8">
         <Link href="/" className="flex items-center gap-2 group">
            <HeartPulse className="w-8 h-8 text-primary group-hover:rotate-12 transition-transform" />
            <span className="text-2xl font-bold tracking-tight">Sabi<span className="text-primary">Health</span></span>
         </Link>
      </div>

      <Card className="w-full max-w-md glass-morphism border-none shadow-2xl">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold">Create Account</CardTitle>
          <CardDescription className="text-muted-foreground text-base">
            Join Sabi Health and start receiving proactive alerts for your area.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                placeholder="e.g. Adebayo Kunle" 
                required 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                type="tel" 
                placeholder="2348000000000" 
                required 
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lga">LGA (Local Government Area)</Label>
              <Input 
                id="lga" 
                placeholder="e.g. Kano" 
                required 
                value={formData.lga}
                onChange={(e) => setFormData({ ...formData, lga: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                required 
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full text-lg h-14" 
              variant="premium"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : "Create Account"}
            </Button>
          </form>
          
          <div className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Log in here
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
