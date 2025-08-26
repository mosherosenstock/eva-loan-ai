import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  DollarSign, 
  Users,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  Calendar,
  Shield
} from "lucide-react";

export default function BusinessApplicationPreview({ applicationData }) {
  const formatCurrency = (amount) => {
    return amount ? `$${parseFloat(amount).toLocaleString()}` : 'Not provided';
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

  return (
    <div className="space-y-6">
      <Card className="border-slate-200">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-lg flex items-center gap-2 text-[#1a365d]">
            <Building2 className="w-5 h-5" />
            Company Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-slate-600 flex items-center gap-2 mb-1">
                <Building2 className="w-4 h-4" />
                Company Name
              </label>
              <p className="font-semibold text-[#1a365d]">{applicationData.CompanyName || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 flex items-center gap-2 mb-1">
                <Users className="w-4 h-4" />
                Contact Person
              </label>
              <p className="font-semibold text-[#1a365d]">{applicationData.contact_person || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 flex items-center gap-2 mb-1">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <p className="font-semibold text-[#1a365d]">{applicationData.contact_email || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 flex items-center gap-2 mb-1">
                <Phone className="w-4 h-4" />
                Phone
              </label>
              <p className="font-semibold text-[#1a365d]">{applicationData.contact_phone || 'Not provided'}</p>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-600 flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4" />
                Business Address
              </label>
              <p className="font-semibold text-[#1a365d]">{applicationData.business_address || 'Not provided'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-lg flex items-center gap-2 text-[#1a365d]">
            <TrendingUp className="w-5 h-5" />
            Business Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">Years in Business</label>
              <p className="font-semibold text-[#1a365d] text-lg">{applicationData.years_in_business || 'Not provided'} years</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">Annual Revenue</label>
              <p className="font-semibold text-[#1a365d] text-lg">{formatCurrency(applicationData.business_revenue)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">Number of Employees</label>
              <p className="font-semibold text-[#1a365d] text-lg">{applicationData.NoEmp || 'Not provided'}</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">SUGEF Rating</label>
              <Badge variant="outline" className={`${getSUGEFColor(applicationData.SUGEF)} border`}>
                <Shield className="w-3 h-3 mr-1" />
                {applicationData.SUGEF || 'Not provided'}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">Business Type</label>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {applicationData.NewBusiness === 1 ? 'New Business' : 'Existing Business'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-lg flex items-center gap-2 text-[#1a365d]">
            <DollarSign className="w-5 h-5" />
            Loan Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">Loan Amount Requested</label>
              <p className="font-semibold text-[#1a365d] text-lg">{formatCurrency(applicationData.AmountRequested)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">Loan Term</label>
              <p className="font-semibold text-[#1a365d] text-lg">{applicationData.Term} months</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">Loan Purpose</label>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {applicationData.loan_purpose?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Not specified'}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">Location Type</label>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                {applicationData.UrbanRural === 1 ? 'Rural' : 'Urban'}
              </Badge>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">Jobs to Create</label>
              <p className="font-semibold text-[#1a365d]">{applicationData.CreateJob || '0'} jobs</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">Jobs to Retain</label>
              <p className="font-semibold text-[#1a365d]">{applicationData.RetainedJob || '0'} jobs</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">Revolving Credit</label>
              <Badge variant="outline" className={applicationData.IsRevolvingCredit === 1 ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-700 border-gray-200'}>
                {applicationData.IsRevolvingCredit === 1 ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">Low Documentation</label>
              <Badge variant="outline" className={applicationData.IsLowDoc === 1 ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-gray-50 text-gray-700 border-gray-200'}>
                {applicationData.IsLowDoc === 1 ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">Franchise</label>
              <Badge variant="outline" className={applicationData.IsFranchise === 1 ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-gray-50 text-gray-700 border-gray-200'}>
                {applicationData.IsFranchise === 1 ? 'Yes' : 'No'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}