import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from "lucide-react";

export default function KPICard({ title, value, icon: Icon, trend, isLoading, gradient }) {
  if (isLoading) {
    return (
      <Card className="relative overflow-hidden border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradient} rounded-full opacity-10 transform translate-x-8 -translate-y-8 group-hover:opacity-15 transition-opacity`} />
      
      <CardContent className="p-6 relative">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600 mb-2">{title}</p>
            <p className="text-2xl font-bold text-[#1a365d]">{value}</p>
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} bg-opacity-15 group-hover:bg-opacity-20 transition-all`}>
            <Icon className={`w-5 h-5 bg-gradient-to-br ${gradient.replace('from-', 'text-').replace('to-', '').split(' ')[0]}`} />
          </div>
        </div>
        
        {trend && (
          <div className="flex items-center text-sm">
            <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
            <span className="text-green-600 font-medium">{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}