
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { FileText, DollarSign, Brain, User } from "lucide-react";

export default function ApplicationsTable({ 
  applications, 
  isLoading, 
  onSelectApplication, 
  selectedApplicationId,
  onRowDoubleClick
}) {
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

  if (isLoading) {
    return (
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Loading Applications...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-[#1a365d] flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Applications ({applications.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200">
                <TableHead className="font-semibold text-slate-700">Applicant</TableHead>
                <TableHead className="font-semibold text-slate-700">Amount</TableHead>
                <TableHead className="font-semibold text-slate-700">Status</TableHead>
                <TableHead className="font-semibold text-slate-700">AI Score</TableHead>
                <TableHead className="font-semibold text-slate-700">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => (
                <TableRow 
                  key={application.id} 
                  className={`border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors ${
                    selectedApplicationId === application.id ? 'bg-blue-50 hover:bg-blue-50' : ''
                  }`}
                  onClick={() => onSelectApplication(application)}
                  onDoubleClick={() => onRowDoubleClick(application)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#1a365d] to-[#3182ce] rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-[#1a365d]">{application.form_full_name}</p>
                        <p className="text-xs text-slate-500">{application.form_email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 font-semibold text-[#1a365d]">
                      <DollarSign className="w-4 h-4" />
                      {(application.loan_amount_requested || 0).toLocaleString()}
                    </div>
                    <p className="text-xs text-slate-500 capitalize">
                      {application.purpose?.replace(/_/g, ' ')}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${getStatusColor(application.status)} border font-medium`}>
                      {application.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full"
                          style={{ width: `${((application.ai_score || 500) / 1000) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-700">
                        {application.ai_score || 'N/A'}
                      </span>
                    </div>
                    {application.ai_recommendation && (
                      <div className="flex items-center gap-1 mt-1">
                        <Brain className="w-3 h-3 text-blue-500" />
                        <span className="text-xs text-blue-600 capitalize">
                          {application.ai_recommendation}
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    <div>
                      <p className="font-medium">{format(new Date(application.submission_timestamp), "MMM d")}</p>
                      <p className="text-xs text-slate-400">{format(new Date(application.submission_timestamp), "yyyy")}</p>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {applications.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">No Applications Found</h3>
            <p className="text-slate-500 mb-6">No applications match your current filters.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
