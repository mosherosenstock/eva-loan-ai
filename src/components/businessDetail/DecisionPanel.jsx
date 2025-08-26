import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, FileText } from "lucide-react";
import { format } from "date-fns";

// Helper function to safely format dates
const safeFormatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return format(date, "MMM d, yyyy");
  } catch (error) {
    console.error("Error formatting date:", error);
    return "N/A";
  }
};

export default function DecisionPanel({ application, onStatusUpdate, isUpdating, decisions }) {
  const [notes, setNotes] = useState("");

  const handleDecision = (status) => {
    onStatusUpdate(status, notes);
    setNotes("");
  };

  // Safety check for application object
  if (!application) {
    return (
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <p className="text-slate-500 text-center">Loading application data...</p>
        </CardContent>
      </Card>
    );
  }

  const canMakeDecision = ['Submitted', 'Under Review'].includes(application.status);

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-[#1a365d]">
            <Clock className="w-5 h-5" />
            Application Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Current Status:</span>
            <Badge variant="outline" className={`px-3 py-1 font-medium ${
              application.status === 'Approved' ? 'bg-green-100 text-green-800 border-green-200' :
              application.status === 'Rejected' ? 'bg-red-100 text-red-800 border-red-200' :
              application.status === 'Under Review' ? 'bg-blue-100 text-blue-800 border-blue-200' :
              'bg-yellow-100 text-yellow-800 border-yellow-200'
            }`}>
              {application.status}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Application Date:</span>
            <span className="font-medium">
              {safeFormatDate(application.DateOfApplication || application.created_date)}
            </span>
          </div>
          
          {application.decision_timestamp && (
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Decision Date:</span>
              <span className="font-medium">
                {safeFormatDate(application.decision_timestamp)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Decision Making */}
      {canMakeDecision && (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-[#1a365d]">
              <CheckCircle className="w-5 h-5" />
              Make Decision
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="decision_notes" className="text-sm font-medium text-slate-700 mb-2 block">
                Decision Notes
              </Label>
              <Textarea
                id="decision_notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes explaining your decision..."
                className="h-24"
              />
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={() => handleDecision('Approved')} 
                disabled={isUpdating}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve Application
              </Button>
              
              <Button 
                onClick={() => handleDecision('Rejected')} 
                disabled={isUpdating}
                variant="destructive"
                className="w-full"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject Application
              </Button>
              
              {application.status === 'Submitted' && (
                <Button 
                  onClick={() => handleDecision('Under Review')} 
                  disabled={isUpdating}
                  variant="outline"
                  className="w-full"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Mark Under Review
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Decision History */}
      {decisions.length > 0 && (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-[#1a365d]">
              <FileText className="w-5 h-5" />
              Decision History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {decisions.map((decision, index) => (
              <div key={index} className="bg-slate-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className={`${
                    decision.Final_Decision === 'Approved' ? 'bg-green-100 text-green-800 border-green-200' :
                    'bg-red-100 text-red-800 border-red-200'
                  } font-medium`}>
                    {decision.Final_Decision}
                  </Badge>
                  <span className="text-xs text-slate-500">
                    {safeFormatDate(decision.DecisionDate)}
                  </span>
                </div>
                {decision.DecisionNotes && (
                  <p className="text-sm text-slate-700">{decision.DecisionNotes}</p>
                )}
                <p className="text-xs text-slate-500 mt-1">
                  By: {decision.AnalystID}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Current Application Notes */}
      {application.notes && (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-[#1a365d]">
              <FileText className="w-5 h-5" />
              Application Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-slate-700">{application.notes}</p>
              {application.decision_timestamp && (
                <p className="text-sm text-slate-500 mt-2">
                  Added on {safeFormatDate(application.decision_timestamp)}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}