import React, { useState, useEffect } from "react";
import { BusinessApplication } from "@/api/entities";
import { BusinessMLScore } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  TrendingUp,
  DollarSign,
  FileText,
  Clock,
  Shield,
  Brain,
  CheckCircle,
  Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import KPICard from "../components/dashboard/KPICard";
import RecommendationBreakdown from "../components/dashboard/RecommendationBreakdown";
import ApplicationAgeDistribution from "../components/dashboard/ApplicationAgeDistribution";
import BusinessApplicationsTable from "../components/businessApplications/BusinessApplicationsTable";

export default function GeneralDashboard() {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    totalApplications: 0,
    totalRequested: 0,
    approvalRate: 0,
    totalApprovedValue: 0,
    avgApplicationAge: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const getMLRecommendation = (score) => {
    if (score >= 80) return "APPROVE";
    if (score >= 60) return "REVIEW";
    return "DENY";
  };

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      console.log("Loading dashboard data...");
      
      const [applicationList, scoresData] = await Promise.all([
        BusinessApplication.list("-created_date", 1000),
        BusinessMLScore.list()
      ]);

      console.log("Applications loaded:", applicationList.length);
      console.log("Scores loaded:", scoresData.length);

      const appsWithScores = applicationList.map(app => {
        const mlScore = scoresData.find(score => score.ApplicationID === app.ApplicationID);
        return {
          ...app,
          ML_Score: mlScore?.ML_Score || null,
          ML_Recommendation: mlScore?.ML_Score ? getMLRecommendation(mlScore.ML_Score) : null
        };
      });

      console.log("Apps with scores:", appsWithScores.length);
      setApplications(appsWithScores);

      const stats = calculateDashboardStats(appsWithScores);
      console.log("Dashboard stats:", stats);
      setDashboardStats(stats);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setIsLoading(false);
  };

  const calculateDashboardStats = (apps) => {
    const openApplications = apps.filter(app => ['Submitted', 'Under Review'].includes(app.status));
    const totalApplications = openApplications.length;
    const totalRequested = openApplications.reduce((sum, app) => sum + (app.AmountRequested || 0), 0);

    const completedApps = apps.filter(app => ['Approved', 'Rejected'].includes(app.status));
    const approvedApps = apps.filter(app => app.status === 'Approved');
    const totalApprovedValue = approvedApps.reduce((sum, app) => sum + (app.AmountRequested || 0), 0);
    const approvalRate = completedApps.length > 0 ? (approvedApps.length / completedApps.length) * 100 : 0;

    const now = new Date();
    const avgApplicationAge = openApplications.length > 0
      ? openApplications.reduce((sum, app) => {
          const created = new Date(app.DateOfApplication);
          return sum + (now - created) / (1000 * 60 * 60 * 24); // days
        }, 0) / openApplications.length
      : 0;

    return {
      totalApplications,
      totalRequested,
      approvalRate,
      totalApprovedValue,
      avgApplicationAge
    };
  };

  const handleRowDoubleClick = (application) => {
    navigate(createPageUrl(`BusinessApplicationDetail?id=${application.id}`));
  };

  const openApplications = applications
    .filter(app => ['Submitted', 'Under Review'].includes(app.status))
    .sort((a, b) => new Date(b.DateOfApplication || b.created_date) - new Date(a.DateOfApplication || a.created_date));

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#1a365d] mx-auto mb-4" />
          <p className="text-[#1a365d] font-medium">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Fallback if no data
  if (!applications || applications.length === 0) {
    return (
      <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-[#1a365d] mb-4">General Dashboard</h1>
          <p className="text-slate-600 text-lg mb-8">No application data available</p>
          <button 
            onClick={loadDashboardData}
            className="bg-[#1a365d] text-white px-6 py-3 rounded-lg hover:bg-[#2c5282] transition-colors"
          >
            Reload Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-4xl font-bold text-[#1a365d] mb-2">General Dashboard</h1>
            <p className="text-slate-600 text-lg">Comprehensive credit risk assessment overview</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1">
              <CheckCircle className="w-4 h-4 mr-2" />
              All Systems Operational
            </Badge>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <KPICard
            title="Open Applications"
            value={dashboardStats.totalApplications}
            icon={FileText}
            isLoading={isLoading}
            gradient="from-blue-500 to-blue-600"
          />
          <KPICard
            title="Total Requested"
            value={`$${(dashboardStats.totalRequested / 1000000).toFixed(1)}M`}
            icon={DollarSign}
            isLoading={isLoading}
            gradient="from-green-500 to-green-600"
          />
          <KPICard
            title="Approval Rate"
            value={`${dashboardStats.approvalRate.toFixed(1)}%`}
            icon={Shield}
            isLoading={isLoading}
            gradient="from-orange-500 to-orange-600"
          />
          <KPICard
            title="Total Approved Value"
            value={`$${(dashboardStats.totalApprovedValue / 1000000).toFixed(1)}M`}
            icon={TrendingUp}
            isLoading={isLoading}
            gradient="from-indigo-500 to-indigo-600"
          />
          <KPICard
            title="Avg Open App Age"
            value={`${dashboardStats.avgApplicationAge.toFixed(1)} days`}
            icon={Brain}
            isLoading={isLoading}
            gradient="from-teal-500 to-teal-600"
          />
        </div>

        {/* Analytics Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          <RecommendationBreakdown applications={applications} isLoading={isLoading} />
          <ApplicationAgeDistribution applications={applications} isLoading={isLoading} />
        </div>

        {/* Open Applications Table */}
        <BusinessApplicationsTable
          applications={openApplications.slice(0, 10)}
          isLoading={isLoading}
          onSelectApplication={() => {}}
          selectedApplicationId={null}
          onRowDoubleClick={handleRowDoubleClick}
        />
      </div>
    </div>
  );
}