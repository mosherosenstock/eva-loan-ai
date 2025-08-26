import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { History, FileText } from "lucide-react";
import { format } from "date-fns";

export default function ApplicationHistory({ companyName, history, currentApplicationId }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'Under Review': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Submitted': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2 text-[#1a365d]">
          <History className="w-6 h-6" />
          Application History for {companyName}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {history.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No Previous Applications</h3>
            <p className="text-slate-500">This is {companyName}'s first application with us.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-slate-600">
              Found {history.length} previous application{history.length > 1 ? 's' : ''} from this company.
            </p>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Application Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Term</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>ML Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history
                    .sort((a, b) => new Date(b.DateOfApplication) - new Date(a.DateOfApplication))
                    .map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>
                        {app.DateOfApplication ? 
                          format(new Date(app.DateOfApplication), "MMM d, yyyy") :
                          app.created_date ? 
                            format(new Date(app.created_date), "MMM d, yyyy") :
                            "N/A"
                        }
                      </TableCell>
                      <TableCell className="font-semibold">
                        ${(app.AmountRequested || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {app.Term} months
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${getStatusColor(app.status)} border font-medium`}>
                          {app.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {app.ML_Score ? (
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-500 rounded-full"
                                style={{ width: `${app.ML_Score}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{app.ML_Score}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">N/A</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}