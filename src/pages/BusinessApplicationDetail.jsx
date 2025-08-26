
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { BusinessApplication } from "@/api/entities";
import { BusinessMLScore } from "@/api/entities";
import { BusinessApplicationDecision } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Building2, 
  ArrowLeft, 
  DollarSign, 
  Users, 
  MapPin,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  Shield,
  Brain,
  CheckCircle,
  XCircle,
  Clock,
  History,
  FileText,
  AlertTriangle
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { createPageUrl } from "@/utils";

import BusinessProfileOverview from "../components/businessDetail/BusinessProfileOverview";
import MLRiskAssessment from "../components/businessDetail/MLRiskAssessment";
import ApplicationHistory from "../components/businessDetail/ApplicationHistory";
import DecisionPanel from "../components/businessDetail/DecisionPanel";
import SimulationPlayground from "../components/businessDetail/SimulationPlayground";

export default function BusinessApplicationDetail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const applicationId = searchParams.get('id');
  
  const [application, setApplication] = useState(null);
  const [mlScore, setMlScore] = useState(null);
  const [decisions, setDecisions] = useState([]);
  const [applicationHistory, setApplicationHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (applicationId) {
      loadApplicationDetails();
    }
  }, [applicationId]);

  const loadApplicationDetails = async () => {
    setIsLoading(true);
    try {
      // Load current application
      const currentApp = await BusinessApplication.list();
      const app = currentApp.find(a => a.id === applicationId);
      
      if (!app) {
        console.error("Application not found");
        navigate(createPageUrl("BusinessApplications"));
        return;
      }
      
      // Load ML score for this application
      const mlScores = await BusinessMLScore.list();
      const appMlScore = mlScores.find(score => score.ApplicationID === app.ApplicationID);
      
      // Load decisions for this application
      const allDecisions = await BusinessApplicationDecision.list();
      const appDecisions = allDecisions.filter(decision => decision.ApplicationID === app.ApplicationID);
      
      // Load application history for this company
      const companyHistory = currentApp.filter(a => 
        a.CompanyName === app.CompanyName && a.id !== app.id
      );
      
      // Merge ML data
      const appWithMlData = {
        ...app,
        ML_Score: appMlScore?.ML_Score || null,
        ML_Recommendation: appMlScore?.ML_Score ? getMLRecommendation(appMlScore.ML_Score) : null
      };
      
      setApplication(appWithMlData);
      setMlScore(appMlScore);
      setDecisions(appDecisions);
      setApplicationHistory(companyHistory);
      
    } catch (error) {
      console.error("Error loading application details:", error);
    }
    setIsLoading(false);
  };

  const getMLRecommendation = (score) => {
    if (score >= 80) return "APPROVE";
    if (score >= 60) return "REVIEW";
    return "DENY";
  };

  const handleStatusUpdate = async (newStatus, notes = "") => {
    setIsUpdating(true);
    try {
      // Update application status
      await BusinessApplication.update(application.id, {
        status: newStatus,
        notes: notes,
        decision_timestamp: new Date().toISOString()
      });

      // Create decision record if final decision
      if (newStatus === 'Approved' || newStatus === 'Rejected') {
        await BusinessApplicationDecision.create({
          ApplicationID: application.ApplicationID,
          ML_Recommendation: application.ML_Recommendation,
          Final_Decision: newStatus,
          DecisionDate: new Date().toISOString(),
          AnalystID: "current_user", // In real app, get from auth
          DecisionNotes: notes,
          approved_amount: newStatus === 'Approved' ? application.AmountRequested : 0
        });
      }

      // Reload data
      loadApplicationDetails();
    } catch (error) {
      console.error("Error updating application:", error);
    }
    setIsUpdating(false);
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-slate-200 rounded"></div>
                <div className="h-48 bg-slate-200 rounded"></div>
              </div>
              <div className="space-y-6">
                <div className="h-32 bg-slate-200 rounded"></div>
                <div className="h-48 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto text-center">
          <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Application Not Found</h2>
          <p className="text-slate-600 mb-6">The requested business application could not be found.</p>
          <Button onClick={() => navigate(createPageUrl("BusinessApplications"))}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Applications
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate(createPageUrl("BusinessApplications"))}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Applications
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-[#1a365d]">{application.CompanyName}</h1>
              <p className="text-slate-600">Business Loan Application Detail</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className={`px-3 py-1 font-medium ${
              application.status === 'Approved' ? 'bg-green-100 text-green-800 border-green-200' :
              application.status === 'Rejected' ? 'bg-red-100 text-red-800 border-red-200' :
              application.status === 'Under Review' ? 'bg-blue-100 text-blue-800 border-blue-200' :
              'bg-yellow-100 text-yellow-800 border-yellow-200'
            }`}>
              {application.status}
            </Badge>
            <span className="text-sm text-slate-500">
              ID: {application.ApplicationID}
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <BusinessProfileOverview application={application} />
            <MLRiskAssessment application={application} mlScore={mlScore} />
            <SimulationPlayground application={application} />
            <ApplicationHistory 
              companyName={application.CompanyName}
              history={applicationHistory} 
              currentApplicationId={application.id}
            />
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            <DecisionPanel 
              application={application}
              onStatusUpdate={handleStatusUpdate}
              isUpdating={isUpdating}
              decisions={decisions}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
