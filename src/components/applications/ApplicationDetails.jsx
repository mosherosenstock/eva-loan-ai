
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { 
  User, 
  DollarSign, 
  CreditCard, 
  FileText, 
  CheckCircle, 
  XCircle,
  Clock,
  Brain,
  Mail,
  Phone,
  Building,
  Calendar,
  Percent,
  AlertTriangle
} from "lucide-react";

export default function ApplicationDetails({ application, onUpdateStatus }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [notes, setNotes] = useState("");

  if (!application) {
    return (
      <Card className="border-slate-200 shadow-sm">
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
    await onUpdateStatus(application.id, newStatus, notes);
    setNotes("");
    setIsUpdating(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Under Review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Submitted':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskLevel = (score) => {
    if (!score) return { level: 'Unknown', color: 'text-slate-500' };
    if (score >= 750) return { level: 'Low Risk', color: 'text-green-600' };
    if (score >= 600) return { level: 'Medium Risk', color: 'text-yellow-600' };
    if (score >= 400) return { level: 'High Risk', color: 'text-orange-600' };
    return { level: 'Very High Risk', color: 'text-red-600' };
  };

  const riskLevel = getRiskLevel(application.ai_score);

  return (
    <div className="space-y-6">
      {/* Application Header */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-[#1a365d] to-[#3182ce] text-white">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="w-5 h-5" />
            Application Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#1a365d]">{application.form_full_name}</h3>
                <p className="text-slate-600 flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4" />
                  {application.form_email}
                </p>
                {application.form_phone_number && (
                  <p className="text-slate-600 flex items-center gap-2 mt-1">
                    <Phone className="w-4 h-4" />
                    {application.form_phone_number}
                  </p>
                )}
              </div>
              <Badge variant="outline" className={`${getStatusColor(application.status)} border font-medium px-3 py-1`}>
                {application.status}
              </Badge>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="text-slate-500 block">Application ID</label>
                <p className="font-medium text-[#1a365d]">{application.id}</p>
              </div>
              <div>
                <label className="text-slate-500 block">Submitted</label>
                <p className="font-medium text-[#1a365d] flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(application.submission_timestamp), "MMM d, yyyy")}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loan Details */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-[#1a365d]">
            <DollarSign className="w-5 h-5" />
            Loan Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-500">Requested Amount</label>
              <p className="font-bold text-xl text-[#1a365d]">
                ${(application.loan_amount_requested || 0).toLocaleString()}
              </p>
            </div>
            <div>
              <label className="text-sm text-slate-500">Annual Income</label>
              <p className="font-bold text-xl text-[#1a365d]">
                ${(application.annual_income || 0).toLocaleString()}
              </p>
            </div>
            <div>
              <label className="text-sm text-slate-500">Loan Purpose</label>
              <p className="font-medium text-[#1a365d] capitalize">
                {application.purpose?.replace(/_/g, ' ') || 'Not specified'}
              </p>
            </div>
            <div>
              <label className="text-sm text-slate-500">Term</label>
              <p className="font-medium text-[#1a365d]">
                {application.preferred_loan_term_months || 36} months
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Risk Assessment */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-[#1a365d]">
            <Brain className="w-5 h-5" />
            AI Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {application.ai_score ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Risk Score</span>
                <span className={`font-bold ${riskLevel.color}`}>{riskLevel.level}</span>
              </div>
              <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${(application.ai_score / 1000) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>0</span>
                <span className="font-bold text-[#1a365d]">{application.ai_score}</span>
                <span>1000</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-slate-500">No AI assessment available</p>
            </div>
          )}

          {application.ai_recommendation && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="text-sm text-slate-500">AI Recommendation</label>
                <Badge variant="outline" className={`mt-1 ${
                  application.ai_recommendation === 'approve' ? 'bg-green-100 text-green-800 border-green-200' :
                  application.ai_recommendation === 'reject' ? 'bg-red-100 text-red-800 border-red-200' :
                  'bg-yellow-100 text-yellow-800 border-yellow-200'
                }`}>
                  {application.ai_recommendation}
                </Badge>
              </div>
              {/* Note: confidence score is not in top-level of new schema */}
            </div>
          )}

          {application.risk_segment && (
            <div>
              <label className="text-sm text-slate-500">Risk Segment</label>
              <Badge variant="outline" className="mt-1 bg-blue-100 text-blue-800 border-blue-200">
                {application.risk_segment.replace(/_/g, ' ')}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Credit Information */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-[#1a365d]">
            <CreditCard className="w-5 h-5" />
            Credit Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="text-slate-500">FICO Score</label>
              <p className="font-semibold text-[#1a365d]">{application.fico_score || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-slate-500">DTI Ratio</label>
              <p className="font-semibold text-[#1a365d]">
                {application.dti ? `${application.dti}%` : 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-slate-500">Credit History</label>
              <p className="font-semibold text-[#1a365d]">
                {application.age_oldest_credit_line_years ? `${application.age_oldest_credit_line_years} years` : 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Decision Making */}
      {(application.status === 'Submitted' || application.status === 'Under Review') && (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-[#1a365d]">
              <CheckCircle className="w-5 h-5" />
              Decision Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Decision Notes</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes for your decision..."
                className="h-24"
              />
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={() => handleStatusUpdate('Approved')}
                disabled={isUpdating}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </Button>
              <Button
                onClick={() => handleStatusUpdate('Rejected')}
                disabled={isUpdating}
                variant="destructive"
                className="flex-1"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
            </div>
            
            {application.status === 'Submitted' && (
              <Button
                onClick={() => handleStatusUpdate('Under Review')}
                disabled={isUpdating}
                variant="outline"
                className="w-full"
              >
                <Clock className="w-4 h-4 mr-2" />
                Mark Under Review
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Decision History */}
      {application.notes && (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-[#1a365d]">
              <FileText className="w-5 h-5" />
              Decision Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-slate-700">{application.notes}</p>
              {application.decision_timestamp && (
                <p className="text-sm text-slate-500 mt-2">
                  Decision made on {format(new Date(application.decision_timestamp), "MMM d, yyyy")}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
