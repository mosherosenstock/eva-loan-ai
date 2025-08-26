import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  DollarSign, 
  Users, 
  MapPin, 
  Mail, 
  Phone, 
  Calendar,
  TrendingUp,
  Shield,
  Briefcase
} from "lucide-react";
import { format } from "date-fns";

export default function BusinessProfileOverview({ application }) {
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
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-[#1a365d] to-[#3182ce] text-white">
        <CardTitle className="text-xl flex items-center gap-2">
          <Building2 className="w-6 h-6" />
          Business Profile Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Company Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-[#1a365d] flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Company Details
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-slate-500">Company Name</label>
                <p className="font-semibold text-slate-800">{application.CompanyName}</p>
              </div>
              <div>
                <label className="text-sm text-slate-500">Contact Person</label>
                <p className="font-semibold text-slate-800">{application.contact_person || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm text-slate-500 flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  Email
                </label>
                <p className="font-semibold text-slate-800">{application.contact_email || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm text-slate-500 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  Phone
                </label>
                <p className="font-semibold text-slate-800">{application.contact_phone || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Address
                </label>
                <p className="font-semibold text-slate-800">{application.business_address || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Business Metrics */}
          <div className="space-y-4">
            <h3 className="font-semibold text-[#1a365d] flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Business Metrics
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-slate-500">Years in Business</label>
                <p className="font-semibold text-slate-800 text-lg">{application.years_in_business || 'Not provided'} years</p>
              </div>
              <div>
                <label className="text-sm text-slate-500">Annual Revenue</label>
                <p className="font-semibold text-slate-800 text-lg">{formatCurrency(application.business_revenue)}</p>
              </div>
              <div>
                <label className="text-sm text-slate-500 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Employees
                </label>
                <p className="font-semibold text-slate-800 text-lg">{application.NoEmp || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm text-slate-500">SUGEF Rating</label>
                <Badge variant="outline" className={`${getSUGEFColor(application.SUGEF)} border font-medium`}>
                  <Shield className="w-3 h-3 mr-1" />
                  {application.SUGEF}
                </Badge>
              </div>
              <div>
                <label className="text-sm text-slate-500">Business Type</label>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {application.NewBusiness === 1 ? 'New Business' : 'Existing Business'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Loan Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-[#1a365d] flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Loan Request
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-slate-500">Amount Requested</label>
                <p className="font-semibold text-[#1a365d] text-xl">{formatCurrency(application.AmountRequested)}</p>
              </div>
              <div>
                <label className="text-sm text-slate-500">Term</label>
                <p className="font-semibold text-slate-800">{application.Term} months</p>
              </div>
              <div>
                <label className="text-sm text-slate-500">Purpose</label>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <Briefcase className="w-3 h-3 mr-1" />
                  {application.loan_purpose?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Not specified'}
                </Badge>
              </div>
              <div>
                <label className="text-sm text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Application Date
                </label>
                <p className="font-semibold text-slate-800">
                  {application.DateOfApplication ? 
                    format(new Date(application.DateOfApplication), "MMMM d, yyyy") :
                    application.created_date ? 
                      format(new Date(application.created_date), "MMMM d, yyyy") :
                      "N/A"
                  }
                </p>
              </div>
              <div>
                <label className="text-sm text-slate-500">Jobs Impact</label>
                <div className="flex gap-2">
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                    +{application.CreateJob || 0} Created
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {application.RetainedJob || 0} Retained
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}