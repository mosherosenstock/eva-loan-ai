import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  DollarSign, 
  Mail,
  Phone,
  Cake
} from "lucide-react";

export default function ApplicationPreview({ applicationData }) {
  const formatCurrency = (amount) => {
    return amount ? `$${parseFloat(amount).toLocaleString()}` : 'Not provided';
  };

  const formatPercentage = (value) => {
    return value ? `${value}%` : 'Not provided';
  };

  const formatLoanPurpose = (purpose) => {
    return purpose ? purpose.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Not specified';
  };

  return (
    <div className="space-y-6">
       <Card className="border-slate-200">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-lg flex items-center gap-2 text-[#1a365d]">
            <User className="w-5 h-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-slate-600 flex items-center gap-2 mb-1">
                <User className="w-4 h-4" />
                Full Name
              </label>
              <p className="font-semibold text-[#1a365d]">{applicationData.full_name || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 flex items-center gap-2 mb-1">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <p className="font-semibold text-[#1a365d]">{applicationData.email || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 flex items-center gap-2 mb-1">
                <Phone className="w-4 h-4" />
                Phone
              </label>
              <p className="font-semibold text-[#1a365d]">{applicationData.phone_number || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 flex items-center gap-2 mb-1">
                <Cake className="w-4 h-4" />
                Date of Birth
              </label>
              <p className="font-semibold text-[#1a365d]">{applicationData.date_of_birth || 'Not provided'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-lg flex items-center gap-2 text-[#1a365d]">
            <DollarSign className="w-5 h-5" />
            Financial Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">Annual Income</label>
              <p className="font-semibold text-[#1a365d] text-lg">{formatCurrency(applicationData.annual_income)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">Loan Amount Requested</label>
              <p className="font-semibold text-[#1a365d] text-lg">{formatCurrency(applicationData.loan_amount_requested)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">Loan Purpose</label>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {formatLoanPurpose(applicationData.loan_purpose)}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">Loan Term</label>
              <p className="font-semibold text-[#1a365d]">{applicationData.loan_term_months} months</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">Employment Status</label>
              <p className="font-semibold text-[#1a365d] capitalize">{applicationData.employment_status?.replace(/_/g, ' ') || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">Debt-to-Income Ratio</label>
              <p className="font-semibold text-[#1a365d]">{formatPercentage(applicationData.dti)}</p>
            </div>
             <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">FICO Score</label>
              <p className="font-semibold text-[#1a365d] text-lg">{applicationData.fico_score || 'Not provided'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}