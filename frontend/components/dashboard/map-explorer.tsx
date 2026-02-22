"use client";

import dynamic from 'next/dynamic';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MapPin, Navigation as NavIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const HospitalMap = dynamic(() => import('./hospital-map'), { 
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-muted animate-pulse rounded-xl" />
});

export function MapExplorer() {
  const [centers, setCenters] = useState<any[]>([]);
  const [userPos, setUserPos] = useState<{lat: number, lon: number} | null>(null);

  useEffect(() => {
    const fetchCenters = async () => {
      try {
        const res = await api.get("/health-centers");
        setCenters(Object.values(res.data));
      } catch (e) {
        console.error("Failed to fetch centers", e);
      }
    };
    
    const fetchPos = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserPos({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        (err) => console.warn("Geolocation denied", err)
      );
    };

    fetchCenters();
    fetchPos();
  }, []);

  return (
    <div className="bg-white/50 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden shadow-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-xl">
            <MapPin className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Health Network Explorer</h3>
            <p className="text-xs text-muted-foreground">Nearby clinics & your live location</p>
          </div>
        </div>
        {userPos && (
          <div className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-100 animate-pulse">
            GPS ACTIVE
          </div>
        )}
      </div>

      <div className="h-[350px] w-full rounded-2xl overflow-hidden border border-white/10 ring-1 ring-black/5">
         <HospitalMap 
            lat={userPos?.lat || 9.0820} 
            lon={userPos?.lon || 8.6753} 
            name="Your Region"
            address="Major Clinics displayed below"
            userLat={userPos?.lat}
            userLon={userPos?.lon}
         />
      </div>

      <div className="grid grid-cols-2 gap-4">
         {centers.slice(0, 4).map((center, idx) => (
            <div key={idx} className="p-3 bg-white/40 border border-white/40 rounded-2xl hover:bg-white/60 transition-colors group">
               <div className="flex justify-between items-start mb-1">
                  <p className="font-bold text-sm truncate pr-2">{center.name}</p>
                  <NavIcon className="w-3 h-3 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
               </div>
               <p className="text-[10px] text-muted-foreground truncate">{center.address}</p>
            </div>
         ))}
      </div>
    </div>
  );
}
