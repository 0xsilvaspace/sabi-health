"use client";

import { useMe, useCallUser } from "@/lib/hooks";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  PhoneCall, 
  ShieldAlert, 
  User as UserIcon, 
  History,
  Loader2,
  CheckCircle2,
  XCircle,
  HelpCircle
} from "lucide-react";
import { useState } from "react";
import { CallSimulationDialog } from "./call-simulation-dialog";
import { format } from "date-fns";

export function UserTable() {
  const { data: me, isLoading } = useMe();
  const callUser = useCallUser();
  const [simulationData, setSimulationData] = useState<any>(null);

  const handleCall = () => {
    if (!me?.user?.id) return;
    callUser.mutate(me.user.id, {
      onSuccess: (data) => {
        if (data.method === "simulation") {
          setSimulationData(data);
        }
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Card className="glass-morphism border-none shadow-2xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
          <div>
            <CardTitle className="text-xl">Your Health Profile</CardTitle>
            <CardDescription>Personal risk monitoring and alert history.</CardDescription>
          </div>
          <Button 
              size="sm" 
              variant="premium" 
              className="rounded-full shadow-lg h-10 px-6"
              onClick={handleCall}
              disabled={callUser.isPending}
            >
              {callUser.isPending ? (
                 <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <PhoneCall className="h-4 w-4 mr-2" />
                  Test AI Alert
                </>
              )}
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="px-8 pb-8 flex items-center gap-6 border-b border-white/5 bg-white/5">
             <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <UserIcon className="h-8 w-8 text-primary" />
             </div>
             <div>
                <h3 className="text-2xl font-bold">{me?.user?.name}</h3>
                <p className="text-muted-foreground flex items-center gap-2">
                   <ShieldAlert className="h-4 w-4" />
                   LGA: {me?.user?.lga} • {me?.user?.phone}
                </p>
             </div>
             <div className="ml-auto">
                <Badge variant={me?.riskCheck?.risk === "HIGH" ? "destructive" : "success"} className="px-4 py-1 text-sm rounded-full">
                   CURRENT RISK: {me?.riskCheck?.risk || "LOW"}
                </Badge>
             </div>
          </div>

          <div className="p-8">
             <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                <History className="h-4 w-4" />
                Recent Health Checks
             </h4>
             <div className="space-y-3">
                {me?.logs?.length === 0 ? (
                   <p className="text-sm text-muted-foreground italic">No health checks recorded yet.</p>
                ) : (
                   me?.logs?.map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                         <div className="flex flex-col">
                            <span className="font-medium text-sm">{format(new Date(log.timestamp), "MMM dd, yyyy • HH:mm")}</span>
                            <span className="text-xs text-muted-foreground italic">"{log.script.substring(0, 50)}..."</span>
                         </div>
                         <div className="flex items-center gap-3">
                            <Badge variant={log.risk_type === "HIGH" ? "destructive" : "warning"} className="rounded-full text-[10px] px-2">
                               {log.risk_type}
                            </Badge>
                            {log.response === "fever" ? (
                               <XCircle className="h-5 w-5 text-red-500" />
                            ) : log.response === "fine" ? (
                               <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            ) : (
                               <HelpCircle className="h-5 w-5 text-muted-foreground" />
                            )}
                         </div>
                      </div>
                   ))
                )}
             </div>
          </div>
        </CardContent>
      </Card>

      {simulationData && (
        <CallSimulationDialog 
          data={simulationData} 
          onClose={() => setSimulationData(null)} 
        />
      )}
    </>
  );
}

