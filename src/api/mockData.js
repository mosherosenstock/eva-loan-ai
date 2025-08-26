// Mock data to replace Base44 dependencies
export const mockBusinessApplications = [
  {
    id: "689d62a0cd6f70a5e468ea91",
    ApplicationID: "689d62a0cd6f70a5e468ea91",
    CompanyName: "Nature's World LLC",
    SUGEF: "A1",
    AmountRequested: 250000,
    created_date: "2024-01-15T10:30:00Z",
    DateOfApplication: "2024-01-15T10:30:00Z",
    status: "Submitted",
    industry: "Agriculture",
    location: "Costa Rica"
  },
  {
    id: "689d62a0cd6f70a5e468ea92",
    ApplicationID: "689d62a0cd6f70a5e468ea92",
    CompanyName: "Tech Solutions CR",
    SUGEF: "B2",
    AmountRequested: 500000,
    created_date: "2024-01-14T14:20:00Z",
    DateOfApplication: "2024-01-14T14:20:00Z",
    status: "Approved",
    industry: "Technology",
    location: "San José"
  },
  {
    id: "689d62a0cd6f70a5e468ea93",
    ApplicationID: "689d62a0cd6f70a5e468ea93",
    CompanyName: "Green Energy Corp",
    SUGEF: "A2",
    AmountRequested: 750000,
    created_date: "2024-01-13T09:15:00Z",
    DateOfApplication: "2024-01-13T09:15:00Z",
    status: "Under Review",
    industry: "Renewable Energy",
    location: "Heredia"
  },
  {
    id: "689d62a0cd6f70a5e468ea94",
    ApplicationID: "689d62a0cd6f70a5e468ea94",
    CompanyName: "Costa Rican Coffee Co",
    SUGEF: "A1",
    AmountRequested: 300000,
    created_date: "2024-01-12T16:45:00Z",
    DateOfApplication: "2024-01-12T16:45:00Z",
    status: "Approved",
    industry: "Agriculture",
    location: "Cartago"
  },
  {
    id: "689d62a0cd6f70a5e468ea95",
    ApplicationID: "689d62a0cd6f70a5e468ea95",
    CompanyName: "Digital Marketing Pro",
    SUGEF: "B1",
    AmountRequested: 150000,
    created_date: "2024-01-11T11:30:00Z",
    DateOfApplication: "2024-01-11T11:30:00Z",
    status: "Submitted",
    industry: "Marketing",
    location: "Alajuela"
  }
];

export const mockLoanApplications = [
  {
    id: "loan_001",
    applicantName: "Juan Carlos Mora",
    amount: 50000,
    purpose: "Home Renovation",
    status: "approved",
    created_date: "2024-01-10T08:00:00Z",
    creditScore: 720
  },
  {
    id: "loan_002", 
    applicantName: "María Elena Vargas",
    amount: 75000,
    purpose: "Business Expansion",
    status: "pending",
    created_date: "2024-01-09T14:30:00Z",
    creditScore: 680
  }
];

export const mockUser = {
  id: "user_001",
  name: "Business Analyst",
  role: "admin",
  email: "analyst@bank.com"
};

export const mockMLScores = [
  {
    applicationId: "689d62a0cd6f70a5e468ea91",
    ApplicationID: "689d62a0cd6f70a5e468ea91",
    ML_Score: 85,
    score: 85,
    riskLevel: "Low",
    factors: ["Good credit history", "Stable industry", "Strong cash flow"],
    created_date: "2024-01-15T10:30:00Z"
  },
  {
    applicationId: "689d62a0cd6f70a5e468ea92",
    ApplicationID: "689d62a0cd6f70a5e468ea92", 
    ML_Score: 72,
    score: 72,
    riskLevel: "Medium",
    factors: ["Moderate credit history", "Growing industry", "Adequate cash flow"],
    created_date: "2024-01-14T14:20:00Z"
  },
  {
    applicationId: "689d62a0cd6f70a5e468ea93",
    ApplicationID: "689d62a0cd6f70a5e468ea93",
    ML_Score: 65,
    score: 65,
    riskLevel: "Medium",
    factors: ["New business", "High growth potential", "Limited credit history"],
    created_date: "2024-01-13T09:15:00Z"
  },
  {
    applicationId: "689d62a0cd6f70a5e468ea94",
    ApplicationID: "689d62a0cd6f70a5e468ea94",
    ML_Score: 90,
    score: 90,
    riskLevel: "Low",
    factors: ["Excellent credit history", "Established business", "Strong financials"],
    created_date: "2024-01-12T16:45:00Z"
  },
  {
    applicationId: "689d62a0cd6f70a5e468ea95",
    ApplicationID: "689d62a0cd6f70a5e468ea95",
    ML_Score: 58,
    score: 58,
    riskLevel: "High",
    factors: ["Limited credit history", "New industry", "Moderate cash flow"],
    created_date: "2024-01-11T11:30:00Z"
  }
];
