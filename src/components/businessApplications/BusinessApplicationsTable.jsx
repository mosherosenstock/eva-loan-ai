
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Building2, DollarSign, Brain, Calendar } from "lucide-react";

export default function BusinessApplicationsTable({ 
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
          <Building2 className="w-5 h-5" />
          Business Applications ({applications.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200">
                <TableHead className="font-semibold text-slate-700">Company</TableHead>
                <TableHead className="font-semibold text-slate-700">Amount</TableHead>
                <TableHead className="font-semibold text-slate-700">Status</TableHead>
                <TableHead className="font-semibold text-slate-700">AI Recommendation</TableHead>
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
                        <Building2 className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-[#1a365d]">{application.CompanyName}</p>
                        <p className="text-xs text-slate-500">{application.contact_person}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 font-semibold text-[#1a365d]">
                      <DollarSign className="w-4 h-4" />
                      {(application.AmountRequested || 0).toLocaleString()}
                    </div>
                    <p className="text-xs text-slate-500 capitalize">
                      {application.loan_purpose?.replace(/_/g, ' ')}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${getStatusColor(application.status)} border font-medium`}>
                      {application.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {application.ML_Score !== null ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-500 rounded-full"
                              style={{ width: `${application.ML_Score}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold text-[#1a365d]">
                            {application.ML_Score}
                          </span>
                        </div>
                        {application.ML_Recommendation && (
                          <div className="flex items-center gap-1">
                            <Brain className="w-3 h-3 text-blue-500" />
                            <span className={`text-xs font-medium ${
                              application.ML_Recommendation === 'APPROVE' ? 'text-green-600' :
                              application.ML_Recommendation === 'DENY' ? 'text-red-600' : 'text-yellow-600'
                            }`}>
                              {application.ML_Recommendation}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">No ML Score</span>
                    )}
                  </TableCell>
                  <TableCell className="text-slate-600">
                     <div>
                      <p className="font-medium">{format(new Date(application.DateOfApplication), "MMM d")}</p>
                      <p className="text-xs text-slate-400">{format(new Date(application.DateOfApplication), "yyyy")}</p>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {applications.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">No Applications Found</h3>
            <p className="text-slate-500 mb-6">No applications match your current filters.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
