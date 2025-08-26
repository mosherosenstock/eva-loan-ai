
import React, { useState } from "react";
import { BusinessApplication } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Building2, 
  DollarSign, 
  Users, 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle,
  AlertCircle,
  Brain,
  Calendar,
  TrendingUp
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

import BusinessDocumentUpload from "../components/businessApplication/BusinessDocumentUpload";
import BusinessApplicationPreview from "../components/businessApplication/BusinessApplicationPreview";
import { BusinessMLScore } from "@/api/entities";

export default function BusinessLoanApplicationPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [applicationData, setApplicationData] = useState({
    // Company Information
    CompanyName: "",
    contact_person: "",
    contact_email: "",
    contact_phone: "",
    business_address: "",
    years_in_business: "",
    business_revenue: "",
    Industry: "",
    NoEmp: "",
    // Loan Details
    AmountRequested: "",
    Term: "36",
    loan_purpose: "",
    SUGEF: "",
    // Business Characteristics
    NewBusiness: 0,
    CreateJob: "",
    RetainedJob: "",
    UrbanRural: 0,
    IsRevolvingCredit: 0,
    IsLowDoc: 0,
    IsFranchise: 0,
    // Documents
    documents_uploaded: []
  });

  const handleInputChange = (field, value) => {
    setApplicationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDocumentUpload = (documentUrls) => {
    setApplicationData(prev => ({
      ...prev,
      documents_uploaded: [...prev.documents_uploaded, ...documentUrls]
    }));
  };

  const generateMLRecommendation = (data) => {
    // Simple business rules for ML recommendation simulation
    let score = 70; // Base score
    
    // SUGEF rating impact
    if (data.SUGEF === 'A1') score += 15;
    else if (data.SUGEF === 'A2') score += 10;
    else if (data.SUGEF === 'B1') score += 5;
    else if (data.SUGEF === 'B2') score += 0;
    else if (data.SUGEF === 'C1') score -= 10;
    else if (data.SUGEF === 'C2') score -= 15;
    else if (data.SUGEF === 'D') score -= 25;
    
    // Business age impact
    const yearsInBusiness = parseFloat(data.years_in_business) || 0;
    if (yearsInBusiness >= 5) score += 10;
    else if (yearsInBusiness >= 2) score += 5;
    else if (yearsInBusiness < 1) score -= 10;
    
    // New business penalty
    if (data.NewBusiness === 1) score -= 5;
    
    // Amount vs employees ratio
    const amountPerEmp = (parseFloat(data.AmountRequested) || 0) / (parseInt(data.NoEmp) || 1);
    if (amountPerEmp > 100000) score -= 10;
    else if (amountPerEmp > 50000) score -= 5;
    
    // Job creation bonus
    const jobsCreated = parseInt(data.CreateJob) || 0;
    if (jobsCreated >= 10) score += 5;
    else if (jobsCreated >= 5) score += 3;
    
    score = Math.max(0, Math.min(100, score)); // Clamp between 0-100
    
    let recommendation;
    if (score >= 80) recommendation = "APPROVE";
    else if (score >= 60) recommendation = "REVIEW";
    else recommendation = "DENY";
    
    return { ML_Score: score, ML_Recommendation: recommendation };
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      // Generate a unique ApplicationID
      const applicationID = Date.now();
      
      // Generate ML recommendation
      const mlResult = generateMLRecommendation(applicationData);
      
      // Prepare application data for creation
      const businessApplicationData = {
        ...applicationData,
        ApplicationID: applicationID, // Use the generated ID
        DateOfApplication: new Date().toISOString(),
        status: "Submitted",
        NoEmp: parseInt(applicationData.NoEmp) || 0,
        Term: parseInt(applicationData.Term) || 36,
        AmountRequested: parseFloat(applicationData.AmountRequested) || 0,
        business_revenue: parseFloat(applicationData.business_revenue) || 0,
        years_in_business: parseFloat(applicationData.years_in_business) || 0,
        CreateJob: parseInt(applicationData.CreateJob) || 0,
        RetainedJob: parseInt(applicationData.RetainedJob) || 0,
        Industry: parseInt(applicationData.Industry) || 0,
        ML_Score: mlResult.ML_Score,
        ML_Recommendation: mlResult.ML_Recommendation
      };

      // 1. Create the main application record
      await BusinessApplication.create(businessApplicationData);

      // 2. Create the associated ML score record
      await BusinessMLScore.create({
        ApplicationID: applicationID,
        CompanyName: applicationData.CompanyName,
        ML_Score: mlResult.ML_Score
      });
      
      setSubmitMessage(`Application submitted successfully! ML Risk Score: ${mlResult.ML_Score}/100 - Recommendation: ${mlResult.ML_Recommendation}`);
      
      // Redirect after delay
      setTimeout(() => {
        navigate(createPageUrl("BusinessApplications"));
      }, 3000);
      
    } catch (error) {
      console.error("Error submitting business application:", error);
      setSubmitMessage("Error submitting application. Please try again.");
    }
    
    setIsSubmitting(false);
  };

  const steps = [
    { number: 1, title: "Company Info", icon: Building2 },
    { number: 2, title: "Loan Details", icon: DollarSign },
    { number: 3, title: "Documents & Submit", icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg p-3">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/951bcec0f_BN_LOGO.png" 
              alt="BN Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold text-[#1a365d] mb-2">Business Loan Application</h1>
          <p className="text-slate-600 text-lg">AI-powered business credit assessment for growth</p>
        </div>

        {submitMessage && (
          <Alert className={`mb-6 ${submitMessage.includes('successfully') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            {submitMessage.includes('successfully') ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={submitMessage.includes('successfully') ? 'text-green-800' : 'text-red-800'}>
              {submitMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Steps Progress */}
        <div className="flex justify-around items-center mb-8 px-4">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 border-2 transition-all ${
                currentStep >= step.number 
                  ? 'bg-[#1a365d] border-[#1a365d] text-white' 
                  : 'bg-white border-slate-300 text-slate-400'
              }`}>
                <step.icon className="w-5 h-5" />
              </div>
              <span className={`text-xs font-medium ${currentStep >= step.number ? 'text-[#1a365d]' : 'text-slate-400'}`}>
                {step.title}
              </span>
            </div>
          ))}
        </div>

        <Card className="border-slate-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-[#1a365d] to-[#3182ce] text-white">
            <CardTitle className="text-xl flex items-center gap-2">
              {React.createElement(steps[currentStep - 1].icon, { className: "w-5 h-5" })}
              Step {currentStep}: {steps[currentStep - 1].title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="CompanyName" className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Company Name *
                    </Label>
                    <Input
                      id="CompanyName"
                      value={applicationData.CompanyName}
                      onChange={(e) => handleInputChange('CompanyName', e.target.value)}
                      placeholder="Enter company name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_person" className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Contact Person *
                    </Label>
                    <Input
                      id="contact_person"
                      value={applicationData.contact_person}
                      onChange={(e) => handleInputChange('contact_person', e.target.value)}
                      placeholder="Primary contact name"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="contact_email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Address *
                    </Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={applicationData.contact_email}
                      onChange={(e) => handleInputChange('contact_email', e.target.value)}
                      placeholder="business@company.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_phone" className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="contact_phone"
                      value={applicationData.contact_phone}
                      onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business_address" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Business Address
                  </Label>
                  <Input
                    id="business_address"
                    value={applicationData.business_address}
                    onChange={(e) => handleInputChange('business_address', e.target.value)}
                    placeholder="123 Business St, City, State 12345"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="years_in_business">Years in Business</Label>
                    <Input
                      id="years_in_business"
                      type="number"
                      step="0.5"
                      value={applicationData.years_in_business}
                      onChange={(e) => handleInputChange('years_in_business', e.target.value)}
                      placeholder="5.0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="business_revenue">Annual Revenue ($)</Label>
                    <Input
                      id="business_revenue"
                      type="number"
                      value={applicationData.business_revenue}
                      onChange={(e) => handleInputChange('business_revenue', e.target.value)}
                      placeholder="500000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="NoEmp">Number of Employees *</Label>
                    <Input
                      id="NoEmp"
                      type="number"
                      value={applicationData.NoEmp}
                      onChange={(e) => handleInputChange('NoEmp', e.target.value)}
                      placeholder="25"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="SUGEF">SUGEF Risk Rating *</Label>
                    <Select value={applicationData.SUGEF} onValueChange={(value) => handleInputChange('SUGEF', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select SUGEF rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A1">A1 - Excellent</SelectItem>
                        <SelectItem value="A2">A2 - Very Good</SelectItem>
                        <SelectItem value="B1">B1 - Good</SelectItem>
                        <SelectItem value="B2">B2 - Satisfactory</SelectItem>
                        <SelectItem value="C1">C1 - Fair</SelectItem>
                        <SelectItem value="C2">C2 - Poor</SelectItem>
                        <SelectItem value="D">D - High Risk</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="Industry">Industry Classification</Label>
                    <Input
                      id="Industry"
                      type="number"
                      value={applicationData.Industry}
                      onChange={(e) => handleInputChange('Industry', e.target.value)}
                      placeholder="Industry code (e.g., 541)"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="UrbanRural">Location Type</Label>
                    <Select value={applicationData.UrbanRural.toString()} onValueChange={(value) => handleInputChange('UrbanRural', parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Urban</SelectItem>
                        <SelectItem value="1">Rural</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="NewBusiness">Business Type</Label>
                    <Select value={applicationData.NewBusiness.toString()} onValueChange={(value) => handleInputChange('NewBusiness', parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Existing Business</SelectItem>
                        <SelectItem value="1">New Business</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="AmountRequested">Loan Amount Requested ($) *</Label>
                    <Input
                      id="AmountRequested"
                      type="number"
                      value={applicationData.AmountRequested}
                      onChange={(e) => handleInputChange('AmountRequested', e.target.value)}
                      placeholder="100000"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="Term">Loan Term (months)</Label>
                    <Select value={applicationData.Term} onValueChange={(value) => handleInputChange('Term', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12">12 months</SelectItem>
                        <SelectItem value="24">24 months</SelectItem>
                        <SelectItem value="36">36 months</SelectItem>
                        <SelectItem value="48">48 months</SelectItem>
                        <SelectItem value="60">60 months</SelectItem>
                        <SelectItem value="84">84 months</SelectItem>
                        <SelectItem value="120">120 months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loan_purpose">Loan Purpose *</Label>
                  <Select value={applicationData.loan_purpose} onValueChange={(value) => handleInputChange('loan_purpose', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select loan purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="working_capital">Working Capital</SelectItem>
                      <SelectItem value="equipment">Equipment Purchase</SelectItem>
                      <SelectItem value="expansion">Business Expansion</SelectItem>
                      <SelectItem value="inventory">Inventory Financing</SelectItem>
                      <SelectItem value="real_estate">Real Estate</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="CreateJob">Jobs to be Created</Label>
                    <Input
                      id="CreateJob"
                      type="number"
                      value={applicationData.CreateJob}
                      onChange={(e) => handleInputChange('CreateJob', e.target.value)}
                      placeholder="5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="RetainedJob">Jobs to be Retained</Label>
                    <Input
                      id="RetainedJob"
                      type="number"
                      value={applicationData.RetainedJob}
                      onChange={(e) => handleInputChange('RetainedJob', e.target.value)}
                      placeholder="15"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="IsRevolvingCredit">Revolving Credit?</Label>
                    <Select value={applicationData.IsRevolvingCredit.toString()} onValueChange={(value) => handleInputChange('IsRevolvingCredit', parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">No</SelectItem>
                        <SelectItem value="1">Yes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="IsLowDoc">Low Documentation?</Label>
                    <Select value={applicationData.IsLowDoc.toString()} onValueChange={(value) => handleInputChange('IsLowDoc', parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">No</SelectItem>
                        <SelectItem value="1">Yes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="IsFranchise">Franchise Business?</Label>
                    <Select value={applicationData.IsFranchise.toString()} onValueChange={(value) => handleInputChange('IsFranchise', parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">No</SelectItem>
                        <SelectItem value="1">Yes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-8">
                <BusinessDocumentUpload 
                  onDocumentUpload={handleDocumentUpload}
                  uploadedDocuments={applicationData.documents_uploaded}
                />
                <BusinessApplicationPreview 
                  applicationData={applicationData}
                />
              </div>
            )}

            <div className="flex justify-between pt-8 border-t border-slate-200 mt-8">
              <Button
                variant="outline"
                onClick={() => currentStep > 1 && setCurrentStep(currentStep - 1)}
                disabled={currentStep === 1 || isSubmitting}
              >
                Previous
              </Button>
              
              {currentStep < 3 ? (
                <Button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={isSubmitting}
                  className="bg-[#1a365d] hover:bg-[#2c5282]"
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <>
                      <Brain className="w-4 h-4 mr-2 animate-spin" />
                      Processing with AI...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Submit Application
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
