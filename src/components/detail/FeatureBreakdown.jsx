
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Brain } from "lucide-react";

export default function FeatureBreakdown({ application }) {
  // Generate mock SHAP-like values based on application data
  const generateFeatureImportance = (app) => {
    const features = [
      { 
        name: 'FICO Score', 
        impact: app.fico_score ? (app.fico_score - 600) / 10 : 0,
        value: app.fico_score || 'N/A'
      },
      { 
        name: 'Income', 
        impact: app.annual_income ? Math.log(app.annual_income / 50000) * 15 : 0,
        value: app.annual_income ? `$${(app.annual_income / 1000).toFixed(0)}k` : 'N/A'
      },
      { 
        name: 'DTI Ratio', 
        impact: app.dti ? -(app.dti - 25) / 2 : 0, // Changed from debt_to_income_ratio to dti
        value: app.dti ? `${app.dti}%` : 'N/A' // Changed from debt_to_income_ratio to dti
      },
      { 
        name: 'Credit Util.', 
        impact: app.credit_utilization ? -(app.credit_utilization - 30) / 3 : 0,
        value: app.credit_utilization ? `${app.credit_utilization}%` : 'N/A'
      },
      { 
        name: 'Credit History', 
        impact: app.credit_history_length_years ? (app.credit_history_length_years - 5) * 2 : 0,
        value: app.credit_history_length_years ? `${app.credit_history_length_years}yr` : 'N/A'
      },
      { 
        name: 'Delinquencies', 
        impact: app.delinquencies_2yrs ? -app.delinquencies_2yrs * 8 : 2,
        value: app.delinquencies_2yrs || 0
      },
      { 
        name: 'Inquiries', 
        impact: app.recent_inquiries ? -app.recent_inquiries * 3 : 1,
        value: app.recent_inquiries || 0
      },
      { 
        name: 'Employment', 
        impact: app.employment_length_years ? Math.min(app.employment_length_years * 2, 10) : 0,
        value: app.employment_length_years ? `${app.employment_length_years}yr` : 'N/A'
      }
    ];

    return features.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
  };

  const featureData = generateFeatureImportance(application);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-semibold text-slate-800">{label}</p>
          <p className="text-sm text-slate-600">Value: {data.value}</p>
          <p className={`text-sm font-medium ${
            data.impact > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            Impact: {data.impact > 0 ? '+' : ''}{data.impact.toFixed(1)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2 text-[#1a365d]">
          <Brain className="w-5 h-5" />
          Feature Breakdown
        </CardTitle>
        <p className="text-sm text-slate-500">Explainable AI - Feature impact on loan decision</p>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={featureData}
              margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="impact">
                {featureData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.impact > 0 ? '#059669' : '#dc2626'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-xs text-slate-500 text-center">
          <span className="inline-block w-3 h-3 bg-green-600 rounded mr-2"></span>
          Positive Impact
          <span className="inline-block w-3 h-3 bg-red-600 rounded mr-2 ml-4"></span>
          Negative Impact
        </div>
      </CardContent>
    </Card>
  );
}
