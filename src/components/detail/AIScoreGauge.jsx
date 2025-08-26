
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function AIScoreGauge({ score }) {
  const normalizedScore = score || 0;
  const percentage = (normalizedScore / 1000) * 100;
  
  const data = [
    { name: 'Score', value: percentage },
    { name: 'Remaining', value: 100 - percentage }
  ];

  const getScoreColor = (s) => {
    if (s >= 750) return '#059669'; // green-600
    if (s >= 600) return '#d97706'; // amber-600
    if (s >= 400) return '#ea580c'; // orange-600
    return '#dc2626'; // red-600
  };

  const COLORS = [getScoreColor(normalizedScore), '#e2e8f0'];

  return (
    <div className="relative w-48 h-24 mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="80%"
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={80}
            paddingAngle={0}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-3xl font-bold text-[#1a365d]">{normalizedScore}</div>
        <div className="text-xs text-slate-500">/ 1000</div>
      </div>
    </div>
  );
}
