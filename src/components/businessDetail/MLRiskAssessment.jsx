import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

export default function MLRiskAssessment({ application, mlScore }) {
  if (!application.ML_Score) {
    return (
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2 text-[#1a365d]">
            <Brain className="w-6 h-6" />
            AI Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No ML Score Available</h3>
            <p className="text-slate-500">This application has not been processed by the ML model yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const riskLevel = application.ML_Score >= 80 ? 'Low Risk' : application.ML_Score >= 60 ? 'Medium Risk' : 'High Risk';
  const riskColor = riskLevel === 'Low Risk' ? 'text-green-600' : riskLevel === 'Medium Risk' ? 'text-yellow-600' : 'text-red-600';
  const progressColor = application.ML_Score >= 80 ? 'bg-green-500' : application.ML_Score >= 60 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2 text-[#1a365d]">
          <Brain className="w-6 h-6" />
          AI Risk Assessment
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* ML Score Display */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-8 border-slate-100 mb-4 relative">
            <div className={`absolute inset-0 rounded-full ${progressColor} opacity-20`} 
                 style={{ clipPath: `polygon(0 0, ${application.ML_Score}% 0, ${application.ML_Score}% 100%, 0 100%)` }}></div>
            <div className="text-center">
              <p className="text-3xl font-bold text-[#1a365d]">{application.ML_Score}</p>
              <p className="text-sm text-slate-500">/ 100</p>
            </div>
          </div>
          <h3 className={`text-xl font-bold ${riskColor} mb-2`}>{riskLevel}</h3>
          <p className="text-slate-600">ML Confidence Score</p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Risk Score</span>
            <span className="font-bold text-[#1a365d]">{application.ML_Score}/100</span>
          </div>
          <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${progressColor} rounded-full transition-all duration-1000`}
              style={{ width: `${application.ML_Score}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>High Risk</span>
            <span>Low Risk</span>
          </div>
        </div>

        {/* ML Recommendation */}
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-slate-800 mb-1">AI Recommendation</h4>
              <p className="text-sm text-slate-600">Based on ML analysis of business profile</p>
            </div>
            <Badge variant="outline" className={`px-3 py-2 font-semibold ${
              application.ML_Recommendation === 'APPROVE' ? 'bg-green-100 text-green-800 border-green-200' :
              application.ML_Recommendation === 'DENY' ? 'bg-red-100 text-red-800 border-red-200' :
              'bg-yellow-100 text-yellow-800 border-yellow-200'
            }`}>
              {application.ML_Recommendation === 'APPROVE' ? (
                <><CheckCircle className="w-4 h-4 mr-1" /> APPROVE</>
              ) : application.ML_Recommendation === 'DENY' ? (
                <><AlertTriangle className="w-4 h-4 mr-1" /> DENY</>
              ) : (
                <><TrendingUp className="w-4 h-4 mr-1" /> REVIEW</>
              )}
            </Badge>
          </div>
        </div>

        {/* Risk Factors Summary */}
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="font-semibold text-slate-700 mb-2">Positive Factors</h5>
            <ul className="space-y-1 text-slate-600">
              {application.SUGEF && ['A1', 'A2', 'B1'].includes(application.SUGEF) && (
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  Strong SUGEF Rating ({application.SUGEF})
                </li>
              )}
              {application.years_in_business >= 3 && (
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  Established Business ({application.years_in_business} years)
                </li>
              )}
              {application.CreateJob > 0 && (
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  Job Creation ({application.CreateJob} jobs)
                </li>
              )}
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-slate-700 mb-2">Risk Factors</h5>
            <ul className="space-y-1 text-slate-600">
              {application.NewBusiness === 1 && (
                <li className="flex items-center gap-2">
                  <AlertTriangle className="w-3 h-3 text-amber-500" />
                  New Business
                </li>
              )}
              {application.SUGEF && ['C1', 'C2', 'D'].includes(application.SUGEF) && (
                <li className="flex items-center gap-2">
                  <AlertTriangle className="w-3 h-3 text-red-500" />
                  Lower SUGEF Rating ({application.SUGEF})
                </li>
              )}
              {application.years_in_business < 2 && (
                <li className="flex items-center gap-2">
                  <AlertTriangle className="w-3 h-3 text-amber-500" />
                  Limited Operating History
                </li>
              )}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}