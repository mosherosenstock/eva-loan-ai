
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { differenceInDays } from 'date-fns';

export default function ApplicationAgeDistribution({ applications, isLoading }) {
  if (isLoading) {
    return (
        <Card className="shadow-sm">
            <CardHeader>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-64 w-full" />
            </CardContent>
        </Card>
    );
  }

  const processData = () => {
    const openApps = applications.filter(app => ['Submitted', 'Under Review'].includes(app.status));
    
    const ageBuckets = {
      '0-3 Days': 0,
      '4-7 Days': 0,
      '8-14 Days': 0,
      '15-30 Days': 0,
      '30+ Days': 0,
    };

    const now = new Date();
    openApps.forEach(app => {
      const age = differenceInDays(now, new Date(app.DateOfApplication));
      if (age <= 3) ageBuckets['0-3 Days']++;
      else if (age <= 7) ageBuckets['4-7 Days']++;
      else if (age <= 14) ageBuckets['8-14 Days']++;
      else if (age <= 30) ageBuckets['15-30 Days']++;
      else ageBuckets['30+ Days']++;
    });

    return Object.keys(ageBuckets).map(key => ({ name: key, count: ageBuckets[key] }));
  };

  const data = processData();

  return (
    <Card className="shadow-sm bg-white">
      <CardHeader>
        <CardTitle className="text-lg font-semibold mb-1">Open Application Age</CardTitle>
        <CardDescription>Distribution of how long current applications have been open.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#d69e2e" name="Applications" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
