
import React, { useState, useEffect } from 'react';
import { BusinessApplication } from '@/api/entities';
import { BusinessApplicationDecision } from '@/api/entities';
import { BusinessMLScore } from '@/api/entities';
import { SendEmail } from '@/api/integrations';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { formatDistanceToNow, differenceInDays, format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import {
  User, Clock, Target, TrendingUp, AlertTriangle, Mail,
  FileText, Award, CheckCircle, Send, Filter, RefreshCw,
  Building2, Brain, DollarSign // Added new icons
} from 'lucide-react';
import KPICard from '../components/dashboard/KPICard';

export default function AnalystDashboard() {
  const [myQueue, setMyQueue] = useState([]);
  const [allDecisions, setAllDecisions] = useState([]);
  const [applications, setApplications] = useState([]);
  const [mlScores, setMlScores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [notes, setNotes] = useState('');
  const [emailTemplate, setEmailTemplate] = useState('approved'); // State kept as is, though not used in new UI logic
  const [isProcessing, setIsProcessing] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Mock current user - in real app, get from User.me()
  const currentAnalyst = "AnalystUser";

  useEffect(() => {
    fetchAnalystData();
  }, []);

  const fetchAnalystData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Increased limit to ensure all related data is fetched
      const [appsData, decisionsData, scoresData] = await Promise.all([
        BusinessApplication.list('-created_date', 500),
        BusinessApplicationDecision.list('-created_date', 500),
        BusinessMLScore.list('-created_date', 500)
      ]);

      setApplications(appsData);
      setAllDecisions(decisionsData);
      setMlScores(scoresData);

      // Create a lookup map for faster and more reliable score matching
      const scoresMap = new Map(scoresData.map(score => [score.ApplicationID, score]));

      // Filter applications for this analyst's queue
      const myApps = appsData.filter(app =>
        ['Submitted', 'Under Review'].includes(app.status)
      ).map(app => {
        // Use the map to find the score and recommendation
        const mlScore = scoresMap.get(app.ApplicationID);
        return {
          ...app,
          ML_Score: mlScore?.ML_Score || null,
          ML_Recommendation: mlScore?.Recommendation || null, // Ensure ML_Recommendation is available
          waitTime: app.DateOfApplication ? formatDistanceToNow(new Date(app.DateOfApplication), { addSuffix: true }) : 'Unknown',
          daysPending: app.DateOfApplication ? differenceInDays(new Date(), new Date(app.DateOfApplication)) : 0
        };
      });

      setMyQueue(myApps);
    } catch (error) {
      console.error("Error loading analyst dashboard data:", error);
      setError("Failed to load dashboard data. Please try refreshing the page.");
    }
    setIsLoading(false);
  };

  // Analyst KPI Calculations
  const getMyStats = () => {
    const myDecisions = allDecisions.filter(d => d.AnalystID === currentAnalyst);
    const myApprovals = myDecisions.filter(d => d.Final_Decision === 'Approved');
    const myApprovalRate = myDecisions.length > 0 ? (myApprovals.length / myDecisions.length) * 100 : 0;

    // Team average for comparison
    const teamDecisions = allDecisions.filter(d => d.AnalystID && d.AnalystID !== 'Unassigned');
    const teamApprovals = teamDecisions.filter(d => d.Final_Decision === 'Approved');
    const teamApprovalRate = teamDecisions.length > 0 ? (teamApprovals.length / teamDecisions.length) * 100 : 0;

    // Average pending time for my cases
    const avgPendingTime = myQueue.length > 0
      ? myQueue.reduce((sum, app) => sum + app.daysPending, 0) / myQueue.length
      : 0;

    // Critical backlog (>5 days)
    const criticalBacklog = myQueue.filter(app => app.daysPending > 5).length;

    // Total potential impact ($)
    const potentialImpact = myQueue.reduce((sum, app) => sum + (app.AmountRequested || 0), 0);

    return {
      assignedCases: myQueue.length,
      myApprovalRate,
      teamApprovalRate,
      avgPendingTime,
      criticalBacklog,
      potentialImpact,
      completedThisWeek: myDecisions.filter(d =>
        new Date(d.created_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length
    };
  };

  const stats = getMyStats();

  // Error state rendering
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
          <Button onClick={fetchAnalystData} className="mb-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Priority sorting logic
  const getPrioritizedQueue = () => {
    let filtered = [...myQueue];

    if (priorityFilter === 'high_amount') {
      filtered = filtered.sort((a, b) => (b.AmountRequested || 0) - (a.AmountRequested || 0));
    } else if (priorityFilter === 'longest_wait') {
      filtered = filtered.sort((a, b) => b.daysPending - a.daysPending);
    } else if (priorityFilter === 'high_risk') {
      filtered = filtered.sort((a, b) => (a.ML_Score === null ? Infinity : a.ML_Score) - (b.ML_Score === null ? Infinity : b.ML_Score));
    } else if (priorityFilter === 'low_risk') {
      filtered = filtered.sort((a, b) => (b.ML_Score === null ? -Infinity : b.ML_Score) - (a.ML_Score === null ? -Infinity : a.ML_Score));
    }

    return filtered;
  };

  const handleQuickAction = async (application, action) => {
    setIsProcessing(true);
    try {
      let emailSubject, emailBody;

      if (action === 'approve') {
        await BusinessApplication.update(application.id, {
          status: 'Approved',
          notes: notes || 'Application approved by analyst',
          decision_timestamp: new Date().toISOString()
        });

        await BusinessApplicationDecision.create({
          ApplicationID: application.ApplicationID,
          Final_Decision: 'Approved',
          DecisionDate: new Date().toISOString(),
          AnalystID: currentAnalyst,
          DecisionNotes: notes || 'Application approved'
        });

        emailSubject = 'Business Loan Application Approved';
        emailBody = `Dear ${application.contact_person || 'Business Owner'},\n\nWe are pleased to inform you that your business loan application for $${application.AmountRequested?.toLocaleString()} has been approved.\n\nNext steps will be communicated shortly.\n\nBest regards,\nBusiness Loan Team`;

      } else if (action === 'reject') {
        await BusinessApplication.update(application.id, {
          status: 'Rejected',
          notes: notes || 'Application rejected by analyst',
          decision_timestamp: new Date().toISOString()
        });

        await BusinessApplicationDecision.create({
          ApplicationID: application.ApplicationID,
          Final_Decision: 'Rejected',
          DecisionDate: new Date().toISOString(),
          AnalystID: currentAnalyst,
          DecisionNotes: notes || 'Application rejected'
        });

        emailSubject = 'Business Loan Application Status Update';
        emailBody = `Dear ${application.contact_person || 'Business Owner'},\n\nThank you for your interest in our business loan program. After careful review, we are unable to approve your application at this time.\n\n${notes || 'Please feel free to reapply in the future.'}\n\nBest regards,\nBusiness Loan Team`;
      }

      // Send email notification
      if (application.contact_email) {
        await SendEmail({
          to: application.contact_email,
          subject: emailSubject,
          body: emailBody
        });
      }

      // Refresh data
      await fetchAnalystData();
      setSelectedApplication(null);
      setNotes('');

    } catch (error) {
      console.error("Error processing application:", error);
      setError("Failed to process application. Please try again.");
    }
    setIsProcessing(false);
  };

  const handleRowClick = (application) => {
    setSelectedApplication(application);
    setNotes(application.notes || '');
  };

  const handleRowDoubleClick = (application) => {
    navigate(createPageUrl(`BusinessApplicationDetail?id=${application.id}`));
  };

  // Chart data for personal performance
  const getPersonalTrendData = () => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayDecisions = allDecisions.filter(d =>
        d.AnalystID === currentAnalyst &&
        new Date(d.created_date).toDateString() === date.toDateString()
      );

      last7Days.push({
        day: date.toLocaleDateString('en', { weekday: 'short' }),
        decisions: dayDecisions.length,
        approvals: dayDecisions.filter(d => d.Final_Decision === 'Approved').length
      });
    }
    return last7Days;
  };

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-[#1a365d]">My Work Queue</h1>
            <p className="text-slate-600">Personal dashboard and case management</p>
          </div>
          <Button onClick={fetchAnalystData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Personal KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <KPICard
            title="Assigned Cases"
            value={stats.assignedCases}
            icon={FileText}
            isLoading={isLoading}
            gradient="from-blue-500 to-blue-600"
          />
          <KPICard
            title="My Approval Rate"
            value={`${stats.myApprovalRate.toFixed(1)}%`}
            icon={Target}
            isLoading={isLoading}
            gradient="from-green-500 to-green-600"
          />
          <KPICard
            title="Avg Pending Time"
            value={`${stats.avgPendingTime.toFixed(1)} days`}
            icon={Clock}
            isLoading={isLoading}
            gradient="from-orange-500 to-orange-600"
          />
          <KPICard
            title="Critical Backlog"
            value={stats.criticalBacklog}
            icon={AlertTriangle}
            isLoading={isLoading}
            gradient="from-red-500 to-red-600"
          />
          <KPICard
            title="Potential Impact"
            value={`$${(stats.potentialImpact / 1000000).toFixed(1)}M`}
            icon={TrendingUp}
            isLoading={isLoading}
            gradient="from-purple-500 to-purple-600"
          />
        </div>

        {/* Performance Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                My Performance vs Team
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#1a365d]">{stats.myApprovalRate.toFixed(1)}%</p>
                  <p className="text-sm text-slate-500">My Approval Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-600">{stats.teamApprovalRate.toFixed(1)}%</p>
                  <p className="text-sm text-slate-500">Team Average</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Performance vs Team:</span>
                  <Badge variant={stats.myApprovalRate > stats.teamApprovalRate ? 'default' : 'secondary'}>
                    {stats.myApprovalRate > stats.teamApprovalRate ? 'Above Average' : 'Below Average'}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Completed This Week:</span>
                  <span className="font-semibold">{stats.completedThisWeek}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Daily Activity (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={getPersonalTrendData()}>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="decisions" fill="#1a365d" name="Total Decisions" />
                  <Bar dataKey="approvals" fill="#3182ce" name="Approvals" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Main Work Queue */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>My Application Queue ({myQueue.length})</CardTitle>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-500" />
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cases</SelectItem>
                      <SelectItem value="high_amount">Highest Amount</SelectItem>
                      <SelectItem value="longest_wait">Longest Wait</SelectItem>
                      <SelectItem value="high_risk">High Risk First</SelectItem>
                      <SelectItem value="low_risk">Low Risk First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Wait Time</TableHead>
                      <TableHead>ML Score</TableHead>
                      <TableHead>Priority</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getPrioritizedQueue().map(app => (
                      <TableRow
                        key={app.id}
                        onClick={() => handleRowClick(app)}
                        onDoubleClick={() => handleRowDoubleClick(app)}
                        className={`cursor-pointer hover:bg-slate-50 ${
                          selectedApplication?.id === app.id ? 'bg-blue-50' : ''
                        }`}
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium">{app.CompanyName}</p>
                            <p className="text-xs text-slate-500">{app.contact_person}</p>
                          </div>
                        </TableCell>
                        <TableCell>${app.AmountRequested?.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-500" />
                            {app.waitTime}
                            {app.daysPending > 5 && (
                              <Badge variant="destructive" className="text-xs">Critical</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            app.ML_Score > 80 ? 'default' :
                            app.ML_Score > 60 ? 'secondary' : 'destructive'
                          }>
                            {app.ML_Score !== null ? app.ML_Score : 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {app.daysPending > 10 ? (
                            <Badge variant="destructive">Urgent</Badge>
                          ) : app.AmountRequested > 500000 ? (
                            <Badge variant="outline">High Value</Badge>
                          ) : (
                            <Badge variant="secondary">Normal</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Case Detail Panel */}
          <div>
            {selectedApplication ? (
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
                        <h3 className="text-xl font-bold text-[#1a365d]">{selectedApplication.CompanyName}</h3>
                        <p className="text-slate-600 flex items-center gap-2 mt-1"><User className="w-4 h-4" />{selectedApplication.contact_person}</p>
                        <p className="text-slate-600 flex items-center gap-2 mt-1"><Mail className="w-4 h-4" />{selectedApplication.contact_email}</p>
                      </div>
                      <Badge variant="outline" className={`${getStatusColor(selectedApplication.status)} border font-medium px-3 py-1`}>{selectedApplication.status}</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Risk Assessment */}
                {selectedApplication.ML_Score !== null && (
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
                        <span className={`font-bold ${getRiskColor(selectedApplication.ML_Score)}`}>{getRiskLevel(selectedApplication.ML_Score)}</span>
                      </div>
                      <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-500 rounded-full"
                          style={{ width: `${selectedApplication.ML_Score}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>0 (High Risk)</span>
                        <span className="font-bold text-[#1a365d]">{selectedApplication.ML_Score}</span>
                        <span>100 (Low Risk)</span>
                      </div>
                      {selectedApplication.ML_Recommendation && (
                        <div className="flex items-center gap-2 mt-2">
                          <label className="text-sm text-slate-500">AI Recommendation:</label>
                          <Badge variant="outline" className={getRecommendationColor(selectedApplication.ML_Recommendation)}>
                            {selectedApplication.ML_Recommendation}
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
                      <div><label className="text-slate-500 block">Amount Requested</label><p className="font-semibold text-[#1a365d]">${(selectedApplication.AmountRequested || 0).toLocaleString()}</p></div>
                      <div><label className="text-slate-500 block">Term</label><p className="font-semibold text-[#1a365d]">{selectedApplication.Term} months</p></div>
                      <div><label className="text-slate-500 block">SUGEF Rating</label><Badge variant="outline" className={getSUGEFColor(selectedApplication.SUGEF)}>{selectedApplication.SUGEF}</Badge></div>
                      <div><label className="text-slate-500 block">Years in Business</label><p className="font-semibold text-[#1a365d]">{selectedApplication.years_in_business} years</p></div>
                      <div><label className="text-slate-500 block">Employees</label><p className="font-semibold text-[#1a365d]">{selectedApplication.NoEmp}</p></div>
                      <div><label className="text-slate-500 block">Annual Revenue</label><p className="font-semibold text-[#1a365d]">${(selectedApplication.business_revenue || 0).toLocaleString()}</p></div>
                    </div>
                  </CardContent>
                </Card>

                {/* Decision Making */}
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader><CardTitle className="text-lg flex items-center gap-2 text-[#1a365d]"><CheckCircle className="w-5 h-5" />Quick Actions</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">Analyst Notes</label>
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        placeholder="Add your analysis notes..."
                        className="mb-4"
                      />
                    </div>
                    <div className="space-y-3">
                      <Button
                        onClick={() => handleQuickAction(selectedApplication, 'approve')}
                        disabled={isProcessing}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {isProcessing ? 'Processing...' : 'Approve & Notify'}
                      </Button>
                      <Button
                        onClick={() => handleQuickAction(selectedApplication, 'reject')}
                        disabled={isProcessing}
                        variant="destructive"
                        className="w-full"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {isProcessing ? 'Processing...' : 'Reject & Notify'}
                      </Button>
                      <Button
                        onClick={() => handleRowDoubleClick(selectedApplication)}
                        variant="outline"
                        className="w-full"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        View Full Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Decision History */}
                {selectedApplication.notes && (
                  <Card className="border-slate-200 shadow-sm">
                    <CardHeader><CardTitle className="text-lg flex items-center gap-2 text-[#1a365d]"><FileText className="w-5 h-5" />Previous Notes</CardTitle></CardHeader>
                    <CardContent>
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <p className="text-slate-700 break-words">{selectedApplication.notes}</p>
                        {selectedApplication.decision_timestamp && (<p className="text-sm text-slate-500 mt-2">Last updated on {format(new Date(selectedApplication.decision_timestamp), "MMM d, yyyy")}</p>)}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="border-slate-200 shadow-sm sticky top-8">
                <CardContent className="p-8 text-center">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-600 mb-2">No Application Selected</h3>
                  <p className="text-slate-500">Select an application from the table to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions for styling
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

const getRiskLevel = (score) => {
  return score >= 80 ? 'Low Risk' : score >= 60 ? 'Medium Risk' : 'High Risk';
};

const getRiskColor = (score) => {
  return score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600';
};

const getRecommendationColor = (recommendation) => {
  switch (recommendation) {
    case 'APPROVE': return 'bg-green-100 text-green-800 border-green-200';
    case 'DENY': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  }
};
