"use client";

import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PhoneIncoming, Volume2, User as UserIcon, Check, X, ShieldAlert } from "lucide-react";

import { api } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { ExternalLink, MapPin } from "lucide-react";

const HospitalMap = dynamic(() => import("./hospital-map"), { 
  ssr: false,
  loading: () => <div className="h-[200px] w-full bg-muted animate-pulse rounded-xl flex items-center justify-center text-xs text-muted-foreground">Loading map...</div>
});

export function CallSimulationDialog({ data, onClose }: { data: any, onClose: () => void }) {
  const [status, setStatus] = useState<"incoming" | "connected" | "completed">("incoming");
  const [audioPlayed, setAudioPlayed] = useState(false);
  const [hospital, setHospital] = useState<any>(null);
  const [userCoords, setUserCoords] = useState<{lat?: number, lon?: number}>({});

  const handleAnswer = () => {
    setStatus("connected");
    
    if (data.audio_url) {
      const audio = new Audio(data.audio_url);
      audio.play().catch(err => {
        console.error("Audio playback error:", err);
        setAudioPlayed(true);
      });
      audio.onended = () => setAudioPlayed(true);
    } else if (window.speechSynthesis) {
      // Fallback to Web Speech API if no audio_url (e.g. YarnGPT key missing)
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(data.script);
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(v => v.name.includes("Female") || v.name.includes("Google US English") || v.name.includes("Samantha"));
      if (femaleVoice) utterance.voice = femaleVoice;
      utterance.pitch = 1.1;
      utterance.rate = 0.9;
      utterance.onend = () => setAudioPlayed(true);
      utterance.onerror = () => setAudioPlayed(true);
      window.speechSynthesis.speak(utterance);
    } else {
      setAudioPlayed(true);
    }
  };

  const submitResponse = async (response: "fever" | "fine") => {
    try {
      let coords: {lat?: number, lon?: number} = {};
      if (response === "fever") {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          coords = { lat: position.coords.latitude, lon: position.coords.longitude };
          setUserCoords(coords);
        } catch (e) {
          console.warn("Geolocation failed, using default");
        }
      }

      const res = await api.post(`/respond/${data.call_id}`, { 
        response,
        ...coords
      });
      toast.success(`Response recorded: ${response}`);
      
      if (res.data.hospital) {
        setHospital(res.data.hospital);
        setStatus("completed");
      } else {
        setStatus("completed");
        setTimeout(onClose, 2000);
      }
    } catch (error) {
      toast.error("Failed to record response");
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] glass-morphism border-none shadow-3xl p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>
            {status === "incoming" ? "Incoming Sabi Alert" : 
             status === "connected" ? "Call Connected" : "Alert Recorded"}
          </DialogTitle>
          <DialogDescription>
            AI-assisted health alert for {data.risk} risk.
          </DialogDescription>
        </DialogHeader>

        <div className={cn(
          "p-8 flex flex-col items-center text-center space-y-6 transition-all duration-500",
          status === "incoming" ? "bg-emerald-600/10" : "bg-card"
        )}>
          {status === "incoming" && (
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20" />
              <div className="bg-emerald-500 p-6 rounded-full shadow-2xl relative">
                <PhoneIncoming className="w-10 h-10 text-white" />
              </div>
            </div>
          )}

          {status === "connected" && (
             <div className="bg-emerald-100 dark:bg-emerald-900/30 p-6 rounded-full shadow-inner">
                <Volume2 className="w-10 h-10 text-emerald-600 animate-pulse" />
             </div>
          )}

          {status === "completed" && (
             <div className="bg-emerald-500 p-6 rounded-full shadow-2xl">
                <Check className="w-10 h-10 text-white" />
             </div>
          )}

          {hospital && status === "completed" && (
            <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/50 rounded-2xl text-left">
                <div className="flex items-start gap-3">
                  <div className="bg-emerald-500 p-2 rounded-lg mt-1">
                    <ShieldAlert className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-emerald-900 dark:text-emerald-100">Sabi Recommendation</h3>
                    <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed">
                      {hospital.recommendation}
                    </p>
                  </div>
                </div>
              </Card>

              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Nearest Health Center
                  </span>
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="h-auto p-0 text-emerald-600 h-6"
                    onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lon}`, "_blank")}
                  >
                    Get Directions <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </div>
                <HospitalMap 
                  lat={hospital.lat} 
                  lon={hospital.lon} 
                  name={hospital.name} 
                  address={hospital.address} 
                  userLat={userCoords.lat}
                  userLon={userCoords.lon}
                />
              </div>

              <Button variant="outline" className="w-full h-12 rounded-xl" onClick={onClose}>
                Close
              </Button>
            </div>
          )}

          <div className="space-y-1">
            <h2 className="text-2xl font-bold">
               {status === "incoming" ? "Incoming Sabi Alert" : 
                status === "connected" ? "Call Connected" : "Alert Recorded"}
            </h2>
            <p className="text-muted-foreground">ID: {data.call_id.substring(0, 8)}</p>
          </div>

          <Card className="w-full bg-white/5 border-white/10 p-4 rounded-2xl">
             <div className="flex items-center gap-3 mb-3">
                <Badge variant="destructive" className="rounded-full">{data.risk} RISK</Badge>
                <div className="h-1 w-1 rounded-full bg-muted-foreground" />
                <span className="text-xs text-muted-foreground italic">Powered by YarnGPT AI</span>
             </div>
             <p className="text-sm italic leading-relaxed text-foreground/90">
               "{data.script}"
             </p>
          </Card>

          {status === "incoming" && (
            <div className="flex gap-4 w-full">
              <Button variant="destructive" className="flex-1 h-14 rounded-2xl" onClick={onClose}>
                <X className="mr-2" /> Decline
              </Button>
              <Button variant="premium" className="flex-1 h-14 rounded-2xl" onClick={handleAnswer}>
                <PhoneIncoming className="mr-2" /> Answer
              </Button>
            </div>
          )}

          {status === "connected" && (
            <div className="space-y-4 w-full">
               <p className="text-sm font-medium">User Response:</p>
               <div className="flex gap-4">
                  <Button variant="destructive" className="flex-1 h-14 rounded-2xl" onClick={() => submitResponse("fever")}>
                    I have Fever
                  </Button>
                  <Button variant="secondary" className="flex-1 h-14 rounded-2xl bg-emerald-100 text-emerald-800 hover:bg-emerald-200" onClick={() => submitResponse("fine")}>

                    I am Fine
                  </Button>
               </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
