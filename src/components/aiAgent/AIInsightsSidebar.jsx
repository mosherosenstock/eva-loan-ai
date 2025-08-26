
import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertTriangle, Lightbulb, FileText, BarChart, Zap, Eye, Target } from 'lucide-react';
import { InvokeLLM } from '@/api/integrations';

// COLORS constant and Recharts imports are removed as they are no longer used
// due to the removal of the Status Distribution chart.

export default function AIInsightsSidebar({ applications }) {
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    if (applications.length > 0) {
      generateInsights();
    }
  }, [applications]);

  const portfolioStats = useMemo(() => {
    if (applications.length === 0) {
      return {
        totalApplications: 0,
        totalRequested: 0,
        approvalRate: 0,
        statusDistribution: [], // Still calculated but not rendered
        sugefDistribution: [],
        riskyCounts: 0
      };
    }

    const totalApplications = applications.length;
    const totalRequested = applications.reduce((sum, app) => sum + (app.AmountRequested || 0), 0);
    
    const approvedCount = applications.filter(app => app.status === 'Approved').length;
    const completedCount = applications.filter(app => ['Approved', 'Rejected'].includes(app.status)).length;
    const approvalRate = completedCount > 0 ? (approvedCount / completedCount) * 100 : 0;

    // Fix status distribution (kept for potential future use or other dependencies if any)
    const statusCounts = applications.reduce((acc, app) => {
      const status = app.status || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const statusDistribution = Object.entries(statusCounts).map(([name, value]) => ({ 
      name, 
      value,
      percentage: ((value / totalApplications) * 100).toFixed(1)
    }));

    const sugefDistribution = Object.entries(
      applications.reduce((acc, app) => {
        const sugef = app.SUGEF || 'Unknown';
        acc[sugef] = (acc[sugef] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value })).sort((a,b) => a.name.localeCompare(b.name));

    const riskyCounts = applications.filter(app => 
      ['C1', 'C2', 'D'].includes(app.SUGEF) || 
      (app.ML_Score && app.ML_Score < 60)
    ).length;

    return {
      totalApplications,
      totalRequested,
      approvalRate,
      statusDistribution,
      sugefDistribution,
      riskyCounts
    };
  }, [applications]);

  const generateInsights = async () => {
    const prompt = `
      Based on the following portfolio statistics, generate 2-3 concise and actionable insights for a banking analyst.
      Format the output as a JSON object with a single key "recommendations", which is an array of strings.
      Each string should start with a title like "Focus on:", "Investigate:", or "Opportunity:".
      
      Statistics:
      - Total Applications: ${portfolioStats.totalApplications}
      - Total Value Requested: $${portfolioStats.totalRequested.toLocaleString()}
      - Overall Approval Rate: ${portfolioStats.approvalRate.toFixed(1)}%
      - High Risk Count: ${portfolioStats.riskyCounts}
      - SUGEF Risk Distribution: ${JSON.stringify(portfolioStats.sugefDistribution)}
      - Status Distribution: ${JSON.stringify(portfolioStats.statusDistribution)}
    `;

    try {
      const result = await InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });
      setInsights(result.recommendations);
    } catch (error) {
      console.error("Failed to generate AI insights:", error);
      setInsights([
        "Focus on: Review applications with SUGEF ratings C1-D for enhanced scrutiny", 
        "Opportunity: High-value applications may need expedited processing",
        "Investigate: Pattern analysis on recent rejections to optimize approval criteria"
      ]);
    }
  };

  const quickActions = [
    {
      title: "High Risk Report",
      description: "Applications needing immediate attention",
      icon: AlertTriangle,
      color: "bg-red-100 text-red-700 hover:bg-red-200",
      action: "Find all applications with SUGEF rating C1, C2, or D that need immediate review"
    },
    {
      title: "Weekly Summary",
      description: "Portfolio overview this week",
      icon: TrendingUp,
      color: "bg-blue-100 text-blue-700 hover:bg-blue-200", 
      action: "Summarize the portfolio performance and highlight top risks this week"
    },
    {
      title: "Industry Analysis",
      description: "Chart by industry sectors",
      icon: BarChart,
      color: "bg-green-100 text-green-700 hover:bg-green-200",
      action: "Generate a bar chart of applications by Industry with risk analysis"
    },
    {
      title: "Compliance Alert",
      description: "Draft regulatory email",
      icon: FileText,
      color: "bg-orange-100 text-orange-700 hover:bg-orange-200",
      action: "Draft an email to compliance about the 5 highest-risk applications requiring review"
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#1a365d]" />
            Portfolio Snapshot
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Total Applications</span>
            <span className="font-bold text-[#1a365d]">{portfolioStats.totalApplications}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Total Requested</span>
            <span className="font-bold text-[#1a365d]">${portfolioStats.totalRequested.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600">High Risk Count</span>
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">{portfolioStats.riskyCounts}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Approval Rate</span>
            <Badge variant="outline" className="text-base">{portfolioStats.approvalRate.toFixed(1)}%</Badge>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-[#d69e2e]" />
            AI Insights
          </CardTitle>
          <CardDescription>Actionable recommendations based on current data.</CardDescription>
        </CardHeader>
        <CardContent>
          {insights ? (
            <ul className="space-y-3">
              {insights.map((insight, index) => (
                <li key={index} className="flex items-start gap-3 text-sm">
                  <Target className="w-4 h-4 mt-1 text-amber-500 flex-shrink-0" />
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500 text-center">Generating insights...</p>
          )}
        </CardContent>
      </Card>

      {/* The Status Distribution Card has been removed */}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Quick Actions
          </CardTitle>
          <CardDescription>Common analysis requests</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className={`w-full justify-start h-auto p-3 ${action.color} border-transparent`}
              onClick={() => {
                // This would trigger the chat interface
                window.dispatchEvent(new CustomEvent('quickAction', { detail: action.action }));
              }}
            >
              <action.icon className="w-4 h-4 mr-3 flex-shrink-0" />
              <div className="text-left">
                <div className="font-medium text-xs">{action.title}</div>
                <div className="text-xs opacity-75">{action.description}</div>
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
