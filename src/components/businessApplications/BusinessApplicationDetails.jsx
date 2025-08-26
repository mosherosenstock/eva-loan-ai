
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label"; // Added this import
import { format } from "date-fns";
import { 
  Building2, 
  DollarSign, 
  Shield, 
  FileText, 
  CheckCircle, 
  XCircle,
  Clock,
  Brain,
  Mail,
  Phone,
  User,
  Calendar,
  Briefcase,
  TrendingUp,
  Globe,
  Users
} from "lucide-react";

export default function BusinessApplicationDetails({ application, onUpdateStatus }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [notes, setNotes] = useState("");

  if (!application) {
    return (
      <Card className="border-slate-200 shadow-sm sticky top-8">
        <CardContent className="p-8 text-center">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-600 mb-2">No Application Selected</h3>
          <p className="text-slate-500">Select an application from the table to view details</p>
        </CardContent>
      </Card>
    );
  }

  const handleStatusUpdate = async (newStatus) => {
    setIsUpdating(true);
    // In a real app, you would also save the decision to the BusinessApplicationDecision entity
    await onUpdateStatus(application.id, newStatus, notes);
    setNotes("");
    setIsUpdating(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'Under Review': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Submitted': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSUGEFColor = (rating) => {
    switch (rating) {
      case 'A1': case 'A2': return 'bg-green-100 text-green-800 border-green-200';
      case 'B1': case 'B2': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'C1': case 'C2': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'D': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const riskLevel = application.ML_Score >= 80 ? 'Low Risk' : application.ML_Score >= 60 ? 'Medium Risk' : 'High Risk';
  const riskColor = riskLevel === 'Low Risk' ? 'text-green-600' : riskLevel === 'Medium Risk' ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="space-y-6 sticky top-8">
      {/* Application Header */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-[#1a365d] to-[#3182ce] text-white">
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Application Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-[#1a365d]">{application.CompanyName}</h3>
              <p className="text-slate-600 flex items-center gap-2 mt-1"><User className="w-4 h-4" />{application.contact_person}</p>
              <p className="text-slate-600 flex items-center gap-2 mt-1"><Mail className="w-4 h-4" />{application.contact_email}</p>
            </div>
            <Badge variant="outline" className={`${getStatusColor(application.status)} border font-medium px-3 py-1`}>{application.status}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* AI Risk Assessment */}
      {application.ML_Score !== null && (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-[#1a365d]">
              <Brain className="w-5 h-5" />
              AI Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">ML Risk Score</span>
              <span className={`font-bold ${riskColor}`}>{riskLevel}</span>
            </div>
            <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-500 rounded-full" 
                style={{ width: `${application.ML_Score}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>0 (High Risk)</span>
              <span className="font-bold text-[#1a365d]">{application.ML_Score}</span>
              <span>100 (Low Risk)</span>
            </div>
            {application.ML_Recommendation && (
              <div className="flex items-center gap-2 mt-2">
                <label className="text-sm text-slate-500">AI Recommendation:</label>
                <Badge variant="outline" className={
                  application.ML_Recommendation === 'APPROVE' ? 'bg-green-100 text-green-800 border-green-200' :
                  application.ML_Recommendation === 'DENY' ? 'bg-red-100 text-red-800 border-red-200' :
                  'bg-yellow-100 text-yellow-800 border-yellow-200'
                }>
                  {application.ML_Recommendation}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Business & Loan Details */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader><CardTitle className="text-lg flex items-center gap-2 text-[#1a365d]"><DollarSign className="w-5 h-5" />Loan & Business Info</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div><label className="text-slate-500">Amount Req.</label><p className="font-semibold text-[#1a365d]">${(application.AmountRequested || 0).toLocaleString()}</p></div>
            <div><label className="text-slate-500">Term</label><p className="font-semibold text-[#1a365d]">{application.Term} months</p></div>
            <div><label className="text-slate-500">SUGEF Rating</label><Badge variant="outline" className={`${getSUGEFColor(application.SUGEF)} border`}>{application.SUGEF}</Badge></div>
            <div><label className="text-slate-500">Years in Business</label><p className="font-semibold text-[#1a365d]">{application.years_in_business} years</p></div>
            <div><label className="text-slate-500">Employees</label><p className="font-semibold text-[#1a365d]">{application.NoEmp}</p></div>
            <div><label className="text-slate-500">Annual Revenue</label><p className="font-semibold text-[#1a365d]">${(application.business_revenue || 0).toLocaleString()}</p></div>
          </div>
        </CardContent>
      </Card>

      {/* Decision Making */}
      {(application.status === 'Submitted' || application.status === 'Under Review') && (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader><CardTitle className="text-lg flex items-center gap-2 text-[#1a365d]"><CheckCircle className="w-5 h-5" />Decision Actions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="decision_notes" className="text-sm font-medium text-slate-700 mb-2 block">Decision Notes</Label>
              <Textarea id="decision_notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add notes for your decision..." className="h-24"/>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => handleStatusUpdate('Approved')} disabled={isUpdating} className="flex-1 bg-green-600 hover:bg-green-700"><CheckCircle className="w-4 h-4 mr-2" />Approve</Button>
              <Button onClick={() => handleStatusUpdate('Rejected')} disabled={isUpdating} variant="destructive" className="flex-1"><XCircle className="w-4 h-4 mr-2" />Reject</Button>
            </div>
            {application.status === 'Submitted' && (<Button onClick={() => handleStatusUpdate('Under Review')} disabled={isUpdating} variant="outline" className="w-full"><Clock className="w-4 h-4 mr-2" />Mark Under Review</Button>)}
          </CardContent>
        </Card>
      )}

      {/* Decision History */}
      {application.notes && (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader><CardTitle className="text-lg flex items-center gap-2 text-[#1a365d]"><FileText className="w-5 h-5" />Decision Notes</CardTitle></CardHeader>
          <CardContent>
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-slate-700">{application.notes}</p>
              {application.decision_timestamp && (<p className="text-sm text-slate-500 mt-2">Decision made on {format(new Date(application.decision_timestamp), "MMM d, yyyy")}</p>)}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
