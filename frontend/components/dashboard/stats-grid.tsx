"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useMe } from "@/lib/hooks";
import { Users, PhoneCall, ShieldCheck, Activity } from "lucide-react";

export function StatsGrid() {
  const { data: me } = useMe();

  const stats = [
    {
      title: "Health Guardian Score",
      value: `${me?.health_score || 0}%`,
      icon: <Activity className="h-6 w-6 text-emerald-600" />,
      description: "Daily personalized safety index",
      trend: me?.health_score && me.health_score > 80 ? "Excellent" : "Needs Care"
    },
    {
      title: "Environmental Risk",
      value: me?.current_risk || "LOW",
      icon: <ShieldCheck className="h-6 w-6 text-amber-600" />,
      description: `Rainfall: ${me?.rainfall_mm || 0}mm`,
      trend: "Based on your LGA"
    },
    {
      title: "Recent Alerts",
      value: me?.logs?.length || 0,
      icon: <PhoneCall className="h-6 w-6 text-primary" />,
      description: "Preventive health checks",
      trend: "Last 30 days"
    },
    {
      title: "Personal Identity",
      value: me?.user?.ai_personality || "Mama Health",
      icon: <Users className="h-6 w-6 text-emerald-600" />,
      description: "Assigned AI Voice",
      trend: "Vocal Guardian"
    },
  ];


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <Card key={i} className="glass-morphism border-none shadow-xl hover:scale-[1.02] transition-transform duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-muted rounded-2xl">
                {stat.icon}
              </div>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-full">
                {stat.trend}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
              <h3 className="text-3xl font-bold tracking-tight mt-1">{stat.value}</h3>
              <p className="text-xs text-muted-foreground mt-2">{stat.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

