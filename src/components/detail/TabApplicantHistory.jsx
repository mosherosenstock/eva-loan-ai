import React, { useState, useEffect } from 'react';
import { LoanApplication } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { History, FileText, AlertTriangle } from 'lucide-react';

export default function TabApplicantHistory({ applicantEmail, currentApplicationId }) {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!applicantEmail) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const allApps = await LoanApplication.filter({ applicant_email: applicantEmail });
        const historicalApps = allApps.filter(app => app.id !== currentApplicationId);
        setHistory(historicalApps.sort((a,b) => new Date(b.created_date) - new Date(a.created_date)));
      } catch (error) {
        console.error("Error fetching applicant history:", error);
      }
      setIsLoading(false);
    };

    fetchHistory();
  }, [applicantEmail, currentApplicationId]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2 text-[#1a365d]">
          <History className="w-5 h-5" />
          Applicant History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {history.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map(app => (
                <TableRow key={app.id}>
                  <TableCell>{format(new Date(app.created_date), "MMM d, yyyy")}</TableCell>
                  <TableCell>${(app.loan_amount_requested || 0).toLocaleString()}</TableCell>
                  <TableCell className="capitalize">{app.loan_purpose?.replace(/_/g, ' ')}</TableCell>
                  <TableCell>{app.loan_term_months} months</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${getStatusColor(app.application_status)} border font-medium`}>
                      {app.application_status?.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">No Historical Data</h3>
            <p className="text-slate-500">This appears to be the applicant's first application.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}