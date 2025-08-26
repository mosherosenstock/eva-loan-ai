
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LoanApplication, ApplicantProfile } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  User,
  DollarSign,
  FileText,
  Brain,
  AlertTriangle,
  CheckCircle,
  Clock,
  Phone,
  Mail,
  Calendar,
  History,
  Beaker
} from "lucide-react";
import { format } from "date-fns";
import { createPageUrl } from "@/utils";

import AIScoreGauge from "../components/detail/AIScoreGauge";
import FeatureBreakdown from "../components/detail/FeatureBreakdown";
import ActivitiesLog from "../components/detail/ActivitiesLog";
import TabApplicantHistory from "../components/detail/TabApplicantHistory";
import TabSimulationPlayground from "../components/detail/TabSimulationPlayground";

export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadApplication();
  }, [id]);

  const loadApplication = async () => {
    setIsLoading(true);
    setError(null); // Clear previous errors
    try {
      // Get ID from URL params - it might be in the query string
      const urlParams = new URLSearchParams(window.location.search);
      const applicationId = urlParams.get('id'); // Prioritize query param, then useParams

      if (!applicationId) {
        setError("Application ID not found in URL");
        setIsLoading(false);
        return;
      }

      const apps = await LoanApplication.filter({ id: applicationId });
      if (apps.length === 0) {
        setError("Application not found");
        setIsLoading(false);
        return;
      }

      const app = apps[0];
      let profile = null;
      if (app.applicant_id) { // Changed from applicant_profile_id to applicant_id
        const profiles = await ApplicantProfile.filter({ id: app.applicant_id });
        if (profiles.length > 0) {
          profile = profiles[0];
        }
      }

      setApplication({ ...app, applicantProfile: profile });

    } catch (e) {
      console.error("Error loading application:", e);
      setError("Failed to load application data.");
    }
    setIsLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800 border-green-200'; // Changed 'approved' to 'Approved'
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-200'; // Changed 'rejected' to 'Rejected'
      case 'Under Review': return 'bg-blue-100 text-blue-800 border-blue-200'; // Changed 'under_review' to 'Under Review'
      case 'Submitted': return 'bg-yellow-100 text-yellow-800 border-yellow-200'; // Changed 'pending' to 'Submitted'
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-8">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
            <div className="space-y-8">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-red-800 mb-2">{error}</h2>
              <Button onClick={() => navigate(createPageUrl("Applications"))} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Applications
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const applicantName = application.applicantProfile?.full_name; // Removed fallback
  const applicantEmail = application.applicantProfile?.email; // Removed fallback
  const applicantPhone = application.applicantProfile?.phone_number; // Removed fallback

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Breadcrumb and Back Button */}
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl("Applications"))}
            className="text-slate-600 hover:text-slate-900 p-0 h-auto font-semibold"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Applications
          </Button>
          <p className="text-sm text-slate-500 mt-1">
            Applications / Deep Dive / {applicantName} ({application.id})
          </p>
        </div>

        {/* Application Summary Header */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#1a365d] to-[#3182ce] rounded-xl flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-[#1a365d] mb-2">{applicantName}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                    <span className="flex items-center gap-1"><Mail className="w-4 h-4" />{applicantEmail}</span>
                    {applicantPhone && (<span className="flex items-center gap-1"><Phone className="w-4 h-4" />{applicantPhone}</span>)}
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />Applied {format(new Date(application.created_date), "MMM d, yyyy")}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-4">
                <Badge variant="outline" className={`${getStatusColor(application.status)} border font-semibold px-4 py-2 text-sm`}>
                  {application.status?.toUpperCase()} {/* Changed application_status to status and removed replace */}
                </Badge>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#1a365d]">${(application.loan_amount_requested || 0).toLocaleString()}</p>
                  <p className="text-sm text-slate-500 capitalize">{application.loan_purpose?.replace(/_/g, ' ')} • {application.loan_term_months || 36} months</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details"><FileText className="w-4 h-4 mr-2" />Application Details</TabsTrigger>
            <TabsTrigger value="history"><History className="w-4 h-4 mr-2" />Applicant History</TabsTrigger>
            <TabsTrigger value="simulation"><Beaker className="w-4 h-4 mr-2" />Simulation Playground</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                 <Card className="border-slate-200 shadow-sm">
                  <CardHeader><CardTitle className="text-xl flex items-center gap-2 text-[#1a365d]"><User className="w-5 h-5" />Client Profile</CardTitle></CardHeader>
                  <CardContent>
                     <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div><p className="text-sm text-slate-500">Full Name</p><p className="font-semibold text-slate-800">{applicantName}</p></div>
                          <div><p className="text-sm text-slate-500">Email</p><p className="font-semibold text-slate-800">{applicantEmail}</p></div>
                          <div><p className="text-sm text-slate-500">Phone</p><p className="font-semibold text-slate-800">{applicantPhone || 'N/A'}</p></div>
                          <div>
                            <p className="text-sm text-slate-500">Date of Birth</p>
                            <p className="font-semibold text-slate-800">
                               {application.applicantProfile?.date_of_birth ? format(new Date(application.applicantProfile.date_of_birth), "MMM d, yyyy") : 'N/A'}
                            </p>
                          </div>
                           <div><p className="text-sm text-slate-500">Address</p><p className="font-semibold text-slate-800">{application.applicantProfile?.address || 'N/A'}</p></div>
                        </div>
                      </div>
                  </CardContent>
                </Card>
                <ActivitiesLog application={application} />
              </div>
              <div className="space-y-8">
                 <Card className="border-slate-200 shadow-sm">
                  <CardHeader><CardTitle className="text-xl flex items-center gap-2 text-[#1a365d]"><Brain className="w-5 h-5" />AI Score</CardTitle></CardHeader>
                  <CardContent className="text-center space-y-4">
                      <AIScoreGauge score={application.ai_score} /> {/* Changed ai_risk_score to ai_score */}
                  </CardContent>
                </Card>
                <FeatureBreakdown application={application} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <TabApplicantHistory applicantEmail={applicantEmail} currentApplicationId={application.id} />
          </TabsContent>

          <TabsContent value="simulation" className="mt-6">
            <TabSimulationPlayground application={application} onUpdate={loadApplication} /> {/* Added onUpdate prop */}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
