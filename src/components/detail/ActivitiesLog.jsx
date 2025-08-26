import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { 
  FileText, 
  User, 
  Brain, 
  CheckCircle, 
  Clock,
  Upload
} from "lucide-react";

export default function ActivitiesLog({ application }) {
  // Generate activities based on application data
  const generateActivities = (app) => {
    const activities = [];

    // Application submitted
    activities.push({
      id: 1,
      type: 'application',
      title: 'Application Submitted',
      description: `${app.applicant_name} submitted loan application for $${(app.loan_amount_requested || 0).toLocaleString()}`,
      timestamp: app.created_date,
      icon: FileText,
      color: 'blue'
    });

    // Documents uploaded
    if (app.documents_uploaded && app.documents_uploaded.length > 0) {
      activities.push({
        id: 2,
        type: 'documents',
        title: 'Documents Uploaded',
        description: `${app.documents_uploaded.length} supporting documents uploaded`,
        timestamp: app.created_date,
        icon: Upload,
        color: 'purple'
      });
    }

    // AI assessment
    if (app.ai_risk_score) {
      activities.push({
        id: 3,
        type: 'ai_assessment',
        title: 'AI Risk Assessment Completed',
        description: `AI generated risk score: ${app.ai_risk_score}/1000 (${app.ml_prediction || 'Review'})`,
        timestamp: app.created_date,
        icon: Brain,
        color: 'indigo'
      });
    }

    // Status changes
    if (app.application_status === 'under_review') {
      activities.push({
        id: 4,
        type: 'status_change',
        title: 'Application Under Review',
        description: 'Application moved to manual review stage',
        timestamp: app.updated_date,
        icon: Clock,
        color: 'yellow'
      });
    }

    if (app.application_status === 'approved') {
      activities.push({
        id: 5,
        type: 'decision',
        title: 'Application Approved',
        description: app.approved_amount 
          ? `Approved for $${app.approved_amount.toLocaleString()} at ${app.approved_rate}% APR`
          : 'Application approved',
        timestamp: app.decision_date || app.updated_date,
        icon: CheckCircle,
        color: 'green'
      });
    }

    if (app.application_status === 'rejected') {
      activities.push({
        id: 6,
        type: 'decision',
        title: 'Application Rejected',
        description: app.decision_notes || 'Application did not meet approval criteria',
        timestamp: app.decision_date || app.updated_date,
        icon: CheckCircle,
        color: 'red'
      });
    }

    return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  const activities = generateActivities(application);

  const getColorClasses = (color) => {
    const colorMap = {
      blue: 'bg-blue-100 text-blue-600',
      purple: 'bg-purple-100 text-purple-600',
      indigo: 'bg-indigo-100 text-indigo-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      green: 'bg-green-100 text-green-600',
      red: 'bg-red-100 text-red-600'
    };
    return colorMap[color] || 'bg-gray-100 text-gray-600';
  };

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2 text-[#1a365d]">
          <Clock className="w-5 h-5" />
          Activity Log
        </CardTitle>
        <p className="text-sm text-slate-500">Application timeline and key events</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length > 0 ? activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4 p-3 bg-slate-50 rounded-lg">
              <div className={`p-2 rounded-lg ${getColorClasses(activity.color)}`}>
                <activity.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-slate-800 text-sm">{activity.title}</h4>
                  <span className="text-xs text-slate-500">
                    {format(new Date(activity.timestamp), "MMM d, HH:mm")}
                  </span>
                </div>
                <p className="text-sm text-slate-600">{activity.description}</p>
              </div>
            </div>
          )) : (
            <div className="text-center py-6">
              <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-500">No activities recorded</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}