import React, { useState, useEffect } from 'react';
import { BusinessApplication } from '@/api/entities';
import { BusinessApplicationDecision } from '@/api/entities';
import { BusinessMLScore } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, 
  LineChart, Line, RadialBarChart, RadialBar, Legend
} from 'recharts';
import { differenceInDays, format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { 
  TrendingUp, UserCheck, Clock, AlertTriangle, SlidersHorizontal, 
  Target, Award, Settings, Bell, BarChart3, TrendingDown
} from 'lucide-react';
import KPICard from '../components/dashboard/KPICard';

const COLORS = ['#1a365d', '#3182ce', '#63b3ed', '#a3bffa', '#dbeafe'];

export default function ManagerDashboard() {
  const [applications, setApplications] = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [mlScores, setMlScores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [riskThreshold, setRiskThreshold] = useState([60]);
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Try to fetch each entity separately to isolate any issues
      console.log("Fetching applications...");
      const appsData = await BusinessApplication.list('-created_date', 100);
      setApplications(appsData);
      console.log("Applications loaded:", appsData.length);
      
      console.log("Fetching decisions...");
      const decisionsData = await BusinessApplicationDecision.list('-created_date', 100);
      setDecisions(decisionsData);
      console.log("Decisions loaded:", decisionsData.length);
      
      console.log("Fetching ML scores...");
      const scoresData = await BusinessMLScore.list('-created_date', 100);
      setMlScores(scoresData);
      console.log("ML Scores loaded:", scoresData.length);
      
      generateSmartAlerts(appsData, decisionsData);
    } catch (error) {
      console.error("Error loading manager dashboard data:", error);
      setError("Failed to load dashboard data. Please try refreshing the page.");
    }
    setIsLoading(false);
  };

  const generateSmartAlerts = (apps, decisions) => {
    try {
      const alerts = [];
      
      // High rejection rate alert
      const recentDecisions = decisions.filter(d => 
        d.created_date && new Date(d.created_date) > subDays(new Date(), 7)
      );
      const rejectionRate = recentDecisions.length > 0 
        ? (recentDecisions.filter(d => d.Final_Decision === 'Rejected').length / recentDecisions.length) * 100
        : 0;
      
      if (rejectionRate > 50) {
        alerts.push({
          type: 'warning',
          title: 'High Rejection Rate',
          message: `${rejectionRate.toFixed(1)}% rejection rate this week (above normal threshold)`
        });
      }

      // Stuck cases alert
      const stuckCases = apps.filter(app => 
        ['Submitted', 'Under Review'].includes(app.status) &&
        app.DateOfApplication &&
        differenceInDays(new Date(), new Date(app.DateOfApplication)) > 10
      ).length;
      
      if (stuckCases > 0) {
        alerts.push({
          type: 'error',
          title: 'Cases Stuck Over 10 Days',
          message: `${stuckCases} applications pending decision for over 10 days`
        });
      }

      setAlerts(alerts);
    } catch (err) {
      console.error("Error generating alerts:", err);
    }
  };

  // KPI Calculations with error handling
  const globalConversionRate = () => {
    try {
      const completed = decisions.filter(d => ['Approved', 'Rejected'].includes(d.Final_Decision));
      const approved = completed.filter(d => d.Final_Decision === 'Approved');
      return completed.length > 0 ? (approved.length / completed.length) * 100 : 0;
    } catch (err) {
      console.error("Error calculating conversion rate:", err);
      return 0;
    }
  };

  const averageDecisionTime = () => {
    try {
      const completedDecisions = decisions.filter(d => 
        d.DecisionDate && ['Approved', 'Rejected'].includes(d.Final_Decision)
      );
      
      if (completedDecisions.length === 0) return 0;
      
      const totalDays = completedDecisions.reduce((acc, decision) => {
        const app = applications.find(a => a.ApplicationID === decision.ApplicationID);
        if (app && app.DateOfApplication) {
          return acc + differenceInDays(new Date(decision.DecisionDate), new Date(app.DateOfApplication));
        }
        return acc;
      }, 0);
      
      return totalDays / completedDecisions.length;
    } catch (err) {
      console.error("Error calculating decision time:", err);
      return 0;
    }
  };

  const portfolioAverageRisk = () => {
    try {
      const scores = mlScores.filter(s => s.ML_Score !== null && s.ML_Score !== undefined);
      return scores.length > 0 
        ? scores.reduce((sum, s) => sum + s.ML_Score, 0) / scores.length 
        : 0;
    } catch (err) {
      console.error("Error calculating portfolio risk:", err);
      return 0;
    }
  };

  // Chart Data Preparation with error handling
  const sugefDistribution = () => {
    try {
      const distribution = applications.reduce((acc, app) => {
        const sugef = app.SUGEF || 'Unknown';
        acc[sugef] = (acc[sugef] || 0) + 1;
        return acc;
      }, {});
      
      return Object.entries(distribution).map(([name, value]) => ({ name, value }));
    } catch (err) {
      console.error("Error calculating SUGEF distribution:", err);
      return [];
    }
  };

  const riskHistogram = () => {
    try {
      const scores = mlScores.filter(s => s.ML_Score !== null && s.ML_Score !== undefined);
      const buckets = { 'Low (0-30)': 0, 'Medium (31-60)': 0, 'High (61-100)': 0 };
      
      scores.forEach(score => {
        if (score.ML_Score <= 30) buckets['Low (0-30)']++;
        else if (score.ML_Score <= 60) buckets['Medium (31-60)']++;
        else buckets['High (61-100)']++;
      });
      
      return Object.entries(buckets).map(([range, count]) => ({ range, count }));
    } catch (err) {
      console.error("Error calculating risk histogram:", err);
      return [];
    }
  };

  const loanPurposeBreakdown = () => {
    try {
      const purposes = applications.reduce((acc, app) => {
        const purpose = app.loan_purpose || 'other';
        acc[purpose] = (acc[purpose] || 0) + 1;
        return acc;
      }, {});
      
      return Object.entries(purposes).map(([name, value]) => ({ 
        name: name.replace(/_/g, ' ').toUpperCase(), 
        value 
      }));
    } catch (err) {
      console.error("Error calculating loan purpose breakdown:", err);
      return [];
    }
  };

  const analystRanking = () => {
    try {
      const analystStats = decisions.reduce((acc, decision) => {
        const analyst = decision.AnalystID || 'Unassigned';
        if (!acc[analyst]) {
          acc[analyst] = { approvals: 0, total: 0, totalDays: 0 };
        }
        
        acc[analyst].total++;
        if (decision.Final_Decision === 'Approved') {
          acc[analyst].approvals++;
        }
        
        // Calculate days for this decision
        const app = applications.find(a => a.ApplicationID === decision.ApplicationID);
        if (app && app.DateOfApplication && decision.DecisionDate) {
          acc[analyst].totalDays += differenceInDays(
            new Date(decision.DecisionDate), 
            new Date(app.DateOfApplication)
          );
        }
        
        return acc;
      }, {});

      return Object.entries(analystStats).map(([analyst, stats]) => ({
        analyst,
        approvals: stats.approvals,
        approvalRate: stats.total > 0 ? (stats.approvals / stats.total) * 100 : 0,
        avgDays: stats.total > 0 ? stats.totalDays / stats.total : 0
      })).sort((a, b) => b.approvalRate - a.approvalRate);
    } catch (err) {
      console.error("Error calculating analyst ranking:", err);
      return [];
    }
  };

  const conversionTrendData = () => {
    try {
      // Last 6 months conversion rate
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = startOfMonth(subDays(new Date(), i * 30));
        const monthEnd = endOfMonth(monthStart);
        
        const monthDecisions = decisions.filter(d => {
          if (!d.DecisionDate) return false;
          const decisionDate = new Date(d.DecisionDate);
          return decisionDate >= monthStart && decisionDate <= monthEnd;
        });
        
        const approved = monthDecisions.filter(d => d.Final_Decision === 'Approved').length;
        const rate = monthDecisions.length > 0 ? (approved / monthDecisions.length) * 100 : 0;
        
        months.push({
          month: format(monthStart, 'MMM'),
          rate: rate
        });
      }
      return months;
    } catch (err) {
      console.error("Error calculating conversion trend:", err);
      return [];
    }
  };

  // Error state
  if (error) {
    return (
      <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <Alert variant="destructive" className="mb-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
          <Button onClick={fetchData} className="mb-4">
            <TrendingUp className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-[#1a365d]">Manager Dashboard</h1>
            <p className="text-slate-600">Strategic portfolio oversight and risk management</p>
          </div>
          <Button variant="outline" onClick={fetchData}>
            <TrendingUp className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
        </div>

        {/* Smart Alerts */}
        {alerts.length > 0 && (
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-orange-500" />
                Smart Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts.map((alert, index) => (
                <Alert key={index} variant={alert.type === 'error' ? 'destructive' : 'default'}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{alert.title}:</strong> {alert.message}
                  </AlertDescription>
                </Alert>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <KPICard 
            title="Global Conversion Rate" 
            value={`${globalConversionRate().toFixed(1)}%`} 
            icon={Target} 
            isLoading={isLoading} 
            gradient="from-green-500 to-green-600" 
          />
          <KPICard 
            title="Avg Decision Time" 
            value={`${averageDecisionTime().toFixed(1)} days`} 
            icon={Clock} 
            isLoading={isLoading} 
            gradient="from-blue-500 to-blue-600" 
          />
          <KPICard 
            title="Portfolio Risk Score" 
            value={`${portfolioAverageRisk().toFixed(0)}/100`} 
            icon={AlertTriangle} 
            isLoading={isLoading} 
            gradient="from-orange-500 to-orange-600" 
          />
          <KPICard 
            title="Active Analysts" 
            value={analystRanking().length} 
            icon={UserCheck} 
            isLoading={isLoading} 
            gradient="from-purple-500 to-purple-600" 
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Conversion Rate Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Conversion Rate Trend (6 Months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={conversionTrendData()}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Conversion Rate']} />
                  <Line type="monotone" dataKey="rate" stroke="#1a365d" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* SUGEF Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                SUGEF Risk Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={sugefDistribution()}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {sugefDistribution().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Risk Score Histogram */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Risk Score Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={riskHistogram()}>
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3182ce" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Loan Purpose Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Loan Purpose Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={loanPurposeBreakdown()}>
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#1a365d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Analyst Performance & Risk Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Analyst Ranking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Top Performing Analysts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analystRanking().slice(0, 5).map((analyst, index) => (
                  <div key={analyst.analyst} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-slate-400' : 'bg-orange-400'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold">{analyst.analyst}</p>
                        <p className="text-sm text-slate-500">{analyst.approvals} approvals</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#1a365d]">{analyst.approvalRate.toFixed(1)}%</p>
                      <p className="text-sm text-slate-500">{analyst.avgDays.toFixed(1)} avg days</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Risk Policy Control Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5" />
                Risk Policy Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-3 block">
                  Minimum ML Score Threshold: {riskThreshold[0]}
                </label>
                <Slider
                  value={riskThreshold}
                  onValueChange={setRiskThreshold}
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>Conservative (High Risk)</span>
                  <span>Aggressive (Low Risk)</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Auto-approve A1 SUGEF ratings</span>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Require manager approval for &gt;$500K</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Alert on applications &gt;10 days old</span>
                  <Switch defaultChecked />
                </div>
              </div>
              
              <Button className="w-full bg-[#1a365d] hover:bg-[#2c5282]">
                <Settings className="w-4 h-4 mr-2" />
                Apply Policy Changes
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}