
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function RecommendationBreakdown({ applications, isLoading }) {
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
    const recommendations = {
      APPROVE: { count: 0, value: 0 },
      REVIEW: { count: 0, value: 0 },
      DENY: { count: 0, value: 0 },
    };

    applications.forEach(app => {
      const prediction = app.ML_Recommendation || 'REVIEW'; // Default to review if not present
      if (recommendations[prediction]) {
        recommendations[prediction].count += 1;
        recommendations[prediction].value += app.AmountRequested || 0;
      }
    });

    return [
      { name: 'Approve', count: recommendations.APPROVE.count, value: recommendations.APPROVE.value },
      { name: 'Review', count: recommendations.REVIEW.count, value: recommendations.REVIEW.value },
      { name: 'Reject', count: recommendations.DENY.count, value: recommendations.DENY.value },
    ];
  };

  const data = processData();

  const valueFormatter = (value) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
    return `$${value}`;
  }

  return (
    <Card className="shadow-sm bg-white">
      <CardHeader>
        <CardTitle className="text-lg font-semibold mb-1">Applications by AI Recommendation</CardTitle>
        <CardDescription>Count and total value of applications based on AI model status.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" stroke="#1a365d" label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" stroke="#3182ce" label={{ value: 'Value ($)', angle: -90, position: 'insideRight' }} tickFormatter={valueFormatter} />
              <Tooltip formatter={(value, name) => name === 'value' ? `$${value.toLocaleString()}` : value} />
              <Legend />
              <Bar yAxisId="left" dataKey="count" fill="#1a365d" name="Application Count" />
              <Bar yAxisId="right" dataKey="value" fill="#3182ce" name="Total Value" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
