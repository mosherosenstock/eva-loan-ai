import React, { useState } from 'react';
import { BusinessApplication } from '@/api/entities';
import { BusinessMLScore } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Loader2, AlertCircle, FileSearch, TrendingUp, Building2, DollarSign, Calendar, User } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

const applicationSteps = [
  { key: 'Submitted', label: 'Application Submitted', icon: FileSearch },
  { key: 'Under Review', label: 'Under Review', icon: Clock },
  { key: 'AI Analysis', label: 'AI Risk Assessment', icon: TrendingUp },
  { key: 'Final Decision', label: 'Final Decision', icon: CheckCircle }
];

export default function ApplicationTracker() {
  const [searchId, setSearchId] = useState('');
  const [application, setApplication] = useState(null);
  const [mlScore, setMlScore] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!searchId.trim()) {
      setError('Please enter an Application ID.');
      return;
    }

    setIsLoading(true);
    setError('');
    setApplication(null);
    setMlScore(null);

    try {
      // Search by ApplicationID (integer) or by record id (string)
      let results = await BusinessApplication.filter({ ApplicationID: parseInt(searchId) });
      
      if (results.length === 0) {
        // Try searching by record id
        results = await BusinessApplication.filter({ id: searchId });
      }

      if (results.length > 0) {
        const app = results[0];
        setApplication(app);

        // Get ML Score if available
        const scores = await BusinessMLScore.filter({ ApplicationID: app.ApplicationID });
        if (scores.length > 0) {
          setMlScore(scores[0]);
        }
      } else {
        setError('No application found with that ID. Please check your Application ID and try again.');
      }
    } catch (error) {
      console.error('Error searching for application:', error);
      setError('An error occurred while searching. Please try again.');
    }

    setIsLoading(false);
  };

  const getCurrentStep = () => {
    if (!application) return -1;
    
    switch (application.status) {
      case 'Submitted': return 0;
      case 'Under Review': return mlScore ? 2 : 1; // If ML score exists, we're past AI analysis
      case 'Approved':
      case 'Rejected': return 3;
      default: return 0;
    }
  };

  const getProgressPercentage = () => {
    const currentStep = getCurrentStep();
    return currentStep >= 0 ? ((currentStep + 1) / applicationSteps.length) * 100 : 0;
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

  const getEstimatedApprovalProbability = () => {
    if (!mlScore || !mlScore.ML_Score) return null;
    
    // Convert ML Score (0-100) to approval probability
    // Higher ML_Score = lower risk = higher probability
    return Math.min(95, Math.max(5, mlScore.ML_Score));
  };

  const getDaysInProcess = () => {
    if (!application) return 0;
    return differenceInDays(new Date(), new Date(application.DateOfApplication));
  };

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg p-3">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/951bcec0f_BN_LOGO.png" 
              alt="BN Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold text-[#1a365d] mb-2">Track Your Application</h1>
          <p className="text-slate-600 text-lg">Enter your Application ID to see the current status and progress</p>
        </div>
        
        {/* Search */}
        <Card className="border-slate-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <Input 
                placeholder="Enter your Application ID (e.g., 1732727816782)" 
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 text-lg"
              />
              <Button 
                onClick={handleSearch} 
                disabled={isLoading}
                className="bg-[#1a365d] hover:bg-[#2c5282] text-white px-8"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <FileSearch className="w-5 h-5" />
                )}
                <span className="ml-2">Track</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>Application Not Found</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Application Status */}
        {application && (
          <div className="space-y-8">
            {/* Application Summary */}
            <Card className="border-slate-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-[#1a365d] to-[#3182ce] text-white">
                <CardTitle className="flex items-center gap-3">
                  <Building2 className="w-6 h-6" />
                  Application Status for {application.CompanyName}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Loan Amount</p>
                      <p className="text-xl font-bold text-[#1a365d]">
                        ${application.AmountRequested?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Applied On</p>
                      <p className="text-xl font-bold text-[#1a365d]">
                        {format(new Date(application.DateOfApplication), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Days in Process</p>
                      <p className="text-xl font-bold text-[#1a365d]">
                        {getDaysInProcess()} days
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={`${getStatusColor(application.status)} border font-semibold px-4 py-2 text-lg`}>
                    {application.status}
                  </Badge>
                  
                  {application.contact_person && (
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Contact Person</p>
                      <p className="font-semibold text-[#1a365d]">{application.contact_person}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Progress Timeline */}
            <Card className="border-slate-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Application Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-medium text-slate-600">Progress</span>
                    <span className="text-sm font-medium text-[#1a365d]">
                      {getProgressPercentage().toFixed(0)}% Complete
                    </span>
                  </div>
                  <Progress value={getProgressPercentage()} className="h-3" />
                </div>

                <div className="space-y-4">
                  {applicationSteps.map((step, index) => {
                    const currentStep = getCurrentStep();
                    const isCompleted = index <= currentStep;
                    const isCurrent = index === currentStep;
                    
                    return (
                      <div key={step.key} className={`flex items-center gap-4 p-4 rounded-lg ${
                        isCompleted ? 'bg-green-50 border-green-200 border' : 
                        isCurrent ? 'bg-blue-50 border-blue-200 border' : 'bg-slate-50'
                      }`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isCompleted ? 'bg-green-500 text-white' :
                          isCurrent ? 'bg-blue-500 text-white' : 'bg-slate-300 text-slate-500'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <step.icon className="w-5 h-5" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-semibold ${
                            isCompleted || isCurrent ? 'text-[#1a365d]' : 'text-slate-500'
                          }`}>
                            {step.label}
                          </h3>
                          {step.key === 'AI Analysis' && mlScore && (
                            <p className="text-sm text-slate-600 mt-1">
                              Risk Score: {mlScore.ML_Score}/100
                            </p>
                          )}
                        </div>
                        {isCompleted && (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Complete
                          </Badge>
                        )}
                        {isCurrent && (
                          <Badge variant="outline" className="border-blue-500 text-blue-700">
                            In Progress
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* AI Assessment & Final Status */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* AI Risk Assessment */}
              {mlScore && (
                <Card className="border-slate-200 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      AI Risk Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center p-6">
                    <div className="mb-6">
                      <div className="relative w-32 h-32 mx-auto mb-4">
                        <Progress 
                          value={getEstimatedApprovalProbability()} 
                          className="w-full h-full rounded-full transform rotate-0" 
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-[#1a365d]">
                              {getEstimatedApprovalProbability()}%
                            </div>
                            <div className="text-xs text-slate-500">Approval Probability</div>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600">
                        Based on AI analysis of your application
                      </p>
                    </div>
                    
                    <div className="text-xs text-slate-400 border-t pt-4">
                      <p>* This is an AI-generated assessment and not a final guarantee of approval</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Final Decision */}
              {['Approved', 'Rejected'].includes(application.status) && (
                <Card className="border-slate-200 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Final Decision
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {application.status === 'Approved' ? (
                      <Alert className="bg-green-50 border-green-200">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <AlertTitle className="text-green-800">Congratulations! Application Approved</AlertTitle>
                        <AlertDescription className="text-green-700">
                          Your business loan application has been approved. You will be contacted by our team with next steps.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert variant="destructive" className="bg-red-50 border-red-200">
                        <AlertCircle className="h-5 w-5" />
                        <AlertTitle>Application Status: Rejected</AlertTitle>
                        <AlertDescription>
                          {application.notes || 'Your application has been reviewed and we are unable to approve it at this time. Please feel free to contact us for more information or to discuss reapplication.'}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {application.decision_timestamp && (
                      <div className="mt-4 text-sm text-slate-600">
                        <p>
                          <strong>Decision Date:</strong> {format(new Date(application.decision_timestamp), 'PPP')}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Contact Information */}
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-[#1a365d] mb-2">Need Help?</h3>
                  <p className="text-slate-600 mb-4">
                    If you have questions about your application or need additional assistance, please contact our support team.
                  </p>
                  <div className="flex justify-center gap-4">
                    <Badge variant="outline" className="px-4 py-2">
                      Application ID: {application.ApplicationID}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}