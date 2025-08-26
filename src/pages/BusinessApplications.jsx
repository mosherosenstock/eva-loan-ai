import React, { useState, useEffect } from "react";
import { BusinessApplication } from "@/api/entities";
import { BusinessApplicationDecision } from "@/api/entities";
import { BusinessMLScore } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Building2,
  Plus,
  Eye,
  TrendingUp,
  Users,
  DollarSign,
  Clock
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

import BusinessApplicationsTable from "../components/businessApplications/BusinessApplicationsTable";
import BusinessApplicationDetails from "../components/businessApplications/BusinessApplicationDetails";
import BusinessApplicationFilters from "../components/businessApplications/BusinessApplicationFilters";

export default function BusinessApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [mlScores, setMlScores] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState({
    status: "all",
    sugef_rating: "all",
    amount_range: "all",
    business_type: "all",
    ml_recommendation: "all"
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applications, searchTerm, activeFilters]);

  const getMLRecommendation = (score) => {
    if (score >= 80) return "APPROVE";
    if (score >= 60) return "REVIEW";
    return "DENY";
  };

  const loadApplications = async () => {
    setIsLoading(true);
    try {
      const appsData = await BusinessApplication.list("-created_date", 200);
      const scoresData = await BusinessMLScore.list();

      // Merge ML scores with applications
      const appsWithScores = appsData.map(app => {
        const mlScore = scoresData.find(score => score.ApplicationID === app.ApplicationID);
        return {
          ...app,
          ML_Score: mlScore?.ML_Score || null,
          ML_Recommendation: mlScore?.ML_Score ? getMLRecommendation(mlScore.ML_Score) : null
        };
      });

      setApplications(appsWithScores);
      setMlScores(scoresData);
    } catch (error) {
      console.error("Error loading business applications:", error);
    }
    setIsLoading(false);
  };

  const applyFilters = () => {
    let filtered = applications;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(app => {
        const companyName = app.CompanyName || "";
        const contactPerson = app.contact_person || "";
        const contactEmail = app.contact_email || "";
        return (
          companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contactEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.id?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Apply status filter
    if (activeFilters.status !== "all") {
      filtered = filtered.filter(app => app.status === activeFilters.status);
    }

    // Apply SUGEF rating filter
    if (activeFilters.sugef_rating !== "all") {
      filtered = filtered.filter(app => app.SUGEF === activeFilters.sugef_rating);
    }

    // Apply business type filter
    if (activeFilters.business_type !== "all") {
      const isNew = activeFilters.business_type === "new";
      filtered = filtered.filter(app => (app.NewBusiness === 1) === isNew);
    }

    // Apply amount range filter
    if (activeFilters.amount_range !== "all") {
      const [min, max] = activeFilters.amount_range.split('-').map(Number);
      filtered = filtered.filter(app => {
        const amount = app.AmountRequested || 0;
        if (max) {
          return amount >= min && amount <= max;
        } else {
          return amount >= min;
        }
      });
    }

    // Apply ML recommendation filter
    if (activeFilters.ml_recommendation !== "all") {
      filtered = filtered.filter(app => app.ML_Recommendation === activeFilters.ml_recommendation);
    }

    setFilteredApplications(filtered);
  };

  const handleUpdateStatus = async (applicationId, newStatus, newNotes = "") => {
    try {
      const appToUpdate = applications.find(app => app.id === applicationId);
      if (!appToUpdate) return;

      // Update the main application record with the new status and notes
      await BusinessApplication.update(applicationId, {
        status: newStatus,
        notes: newNotes,
        decision_timestamp: new Date().toISOString()
      });

      // If a final decision is made, create a record in the decision table
      if (newStatus === 'Approved' || newStatus === 'Rejected') {
        await BusinessApplicationDecision.create({
          ApplicationID: appToUpdate.ApplicationID,
          ML_Recommendation: appToUpdate.ML_Recommendation,
          Final_Decision: newStatus,
          DecisionDate: new Date().toISOString(),
          AnalystID: "AnalystUser",
          DecisionNotes: newNotes,
          approved_amount: newStatus === 'Approved' ? appToUpdate.AmountRequested : 0
        });
      }

      // Refresh data and UI
      loadApplications();
      if (selectedApplication?.id === applicationId) {
        const updatedApp = { ...appToUpdate, status: newStatus, notes: newNotes };
        setSelectedApplication(updatedApp);
      }
    } catch (error) {
      console.error("Error updating business application status:", error);
    }
  };

  const handleRowDoubleClick = (application) => {
    // Navigate to detailed view
    navigate(createPageUrl(`BusinessApplicationDetail?id=${application.id}`));
  };

  const getQuickStats = () => {
    const total = applications.length;
    const pending = applications.filter(app => app.status === 'Submitted' || app.status === 'Under Review').length;
    const approved = applications.filter(app => app.status === 'Approved').length;
    const totalRequested = applications.reduce((sum, app) => sum + (app.AmountRequested || 0), 0);
    const avgAmount = total > 0 ? totalRequested / total : 0;

    return { total, pending, approved, totalRequested, avgAmount };
  };

  const stats = getQuickStats();

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#1a365d] mb-2">Business Loan Applications</h1>
            <p className="text-slate-600 text-lg">Review and manage business loan applications with AI insights</p>
          </div>
          <Link to={createPageUrl("BusinessLoanApplication")}>
            <Button className="bg-[#1a365d] hover:bg-[#2c5282] text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Business Application
            </Button>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Applications</p>
                  <p className="text-2xl font-bold text-[#1a365d]">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Pending Review</p>
                  <p className="text-2xl font-bold text-[#1a365d]">{stats.pending}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Approved</p>
                  <p className="text-2xl font-bold text-[#1a365d]">{stats.approved}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Requested</p>
                  <p className="text-2xl font-bold text-[#1a365d]">${(stats.totalRequested / 1000000).toFixed(1)}M</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search by company name, contact person, or application ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <BusinessApplicationFilters
            filters={activeFilters}
            onFiltersChange={setActiveFilters}
          />
        </div>

        {/* Applications Table/Details Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <BusinessApplicationsTable
              applications={filteredApplications}
              isLoading={isLoading}
              onSelectApplication={setSelectedApplication}
              selectedApplicationId={selectedApplication?.id}
              onRowDoubleClick={handleRowDoubleClick}
            />
          </div>

          <div className="lg:col-span-1">
            <BusinessApplicationDetails
              application={selectedApplication}
              onUpdateStatus={handleUpdateStatus}
            />
          </div>
        </div>
      </div>
    </div>
  );
}