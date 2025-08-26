import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function RevenueChart({ data }) {
  const formatYAxis = (value) => {
    if (value >= 1000) return `$${value / 1000}k`;
    return `$${value}`;
  };

  return (
    <Card className="border-0 shadow-lg lg:col-span-2">
      <CardHeader>
        <CardTitle>Revenue Over Time</CardTitle>
        <CardDescription>Daily revenue from completed transactions.</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})} />
            <YAxis tickFormatter={formatYAxis} />
            <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
            <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRevenue)" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}