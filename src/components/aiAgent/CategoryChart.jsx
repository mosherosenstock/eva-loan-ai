import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7'];

export default function CategoryChart({ data }) {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Transaction Categories</CardTitle>
        <CardDescription>Distribution of transactions by category.</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [value, name]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}