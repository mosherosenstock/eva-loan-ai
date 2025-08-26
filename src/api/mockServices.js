// Mock services to replace Base44 integrations and entities
import { mockBusinessApplications, mockLoanApplications, mockUser, mockMLScores } from './mockData';

// Mock BusinessApplication entity
export const BusinessApplication = {
  list: async (sortBy = "-created_date", limit = 500) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockBusinessApplications.slice(0, limit);
  },
  
  get: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockBusinessApplications.find(app => app.id === id);
  },
  
  create: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newApp = {
      id: `app_${Date.now()}`,
      ...data,
      created_date: new Date().toISOString(),
      status: "pending"
    };
    mockBusinessApplications.push(newApp);
    return newApp;
  },
  
  update: async (id, data) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockBusinessApplications.findIndex(app => app.id === id);
    if (index !== -1) {
      mockBusinessApplications[index] = { ...mockBusinessApplications[index], ...data };
      return mockBusinessApplications[index];
    }
    throw new Error("Application not found");
  }
};

// Mock LoanApplication entity
export const LoanApplication = {
  list: async (sortBy = "-created_date", limit = 500) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockLoanApplications.slice(0, limit);
  },
  
  get: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockLoanApplications.find(app => app.id === id);
  },
  
  create: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newApp = {
      id: `loan_${Date.now()}`,
      ...data,
      created_date: new Date().toISOString(),
      status: "pending"
    };
    mockLoanApplications.push(newApp);
    return newApp;
  }
};

// Mock ApplicantProfile entity
export const ApplicantProfile = {
  get: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return {
      id,
      name: "Sample Applicant",
      email: "applicant@example.com",
      phone: "+506 1234-5678",
      address: "San José, Costa Rica",
      creditScore: 720,
      employmentHistory: [
        { company: "Tech Corp", position: "Developer", years: 3 },
        { company: "Startup Inc", position: "Founder", years: 2 }
      ]
    };
  }
};

// Mock BusinessMLScore entity
export const BusinessMLScore = {
  get: async (applicationId) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockMLScores.find(score => score.applicationId === applicationId) || {
      applicationId,
      score: 75,
      riskLevel: "Medium",
      factors: ["Standard risk factors"]
    };
  },
  
  list: async (sortBy = "-created_date", limit = 100) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockMLScores.slice(0, limit);
  }
};

// Mock BusinessApplicationDecision entity
export const BusinessApplicationDecision = {
  create: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      id: `decision_${Date.now()}`,
      ...data,
      created_date: new Date().toISOString(),
      status: "approved"
    };
  },
  
  list: async (sortBy = "-created_date", limit = 100) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [
      {
        id: "decision_001",
        ApplicationID: "689d62a0cd6f70a5e468ea91",
        Final_Decision: "Approved",
        DecisionDate: "2024-01-15T10:30:00Z",
        Decision_Date: "2024-01-15T10:30:00Z",
        created_date: "2024-01-15T10:30:00Z",
        Decision_Reason: "Strong financial profile and good credit history",
        DecisionNotes: "Application approved based on strong financial profile and good credit history",
        AnalystID: "analyst_001",
        Approved_Amount: 250000
      },
      {
        id: "decision_002",
        ApplicationID: "689d62a0cd6f70a5e468ea92",
        Final_Decision: "Approved",
        DecisionDate: "2024-01-14T14:20:00Z",
        Decision_Date: "2024-01-14T14:20:00Z",
        created_date: "2024-01-14T14:20:00Z",
        Decision_Reason: "Good business plan and adequate collateral",
        DecisionNotes: "Application approved due to good business plan and adequate collateral",
        AnalystID: "analyst_002",
        Approved_Amount: 500000
      },
      {
        id: "decision_003",
        ApplicationID: "689d62a0cd6f70a5e468ea93",
        Final_Decision: "Under Review",
        DecisionDate: null,
        Decision_Date: null,
        created_date: "2024-01-13T09:15:00Z",
        Decision_Reason: "Additional documentation required",
        DecisionNotes: "Application placed under review pending additional documentation",
        AnalystID: "analyst_003",
        Approved_Amount: null
      }
    ].slice(0, limit);
  }
};

// Mock User auth
export const User = {
  me: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockUser;
  },
  
  login: async (credentials) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Mock login - always succeed
    return { ...mockUser, token: "mock_token_123" };
  },
  
  logout: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return { success: true };
  }
};

// Mock Core integrations
export const Core = {
  InvokeLLM: async ({ prompt }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return `This is a mock AI response to: "${prompt}". In a real implementation, this would be an actual AI-generated response based on your business loan data and requirements.`;
  },
  
  SendEmail: async ({ to, subject, body }) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`Mock email sent to ${to}: ${subject}`);
    return { success: true, messageId: `email_${Date.now()}` };
  },
  
  UploadFile: async ({ file }) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const fileUrl = `https://mock-storage.com/files/${file.name}_${Date.now()}`;
    return { file_url: fileUrl };
  },
  
  GenerateImage: async ({ prompt }) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return { image_url: `https://mock-image-gen.com/images/${Date.now()}.png` };
  },
  
  ExtractDataFromUploadedFile: async ({ file_url }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      extracted_data: {
        company_name: "Sample Company",
        revenue: 1000000,
        employees: 50,
        industry: "Technology"
      }
    };
  }
};

// Individual integration exports for backward compatibility
export const InvokeLLM = Core.InvokeLLM;
export const SendEmail = Core.SendEmail;
export const UploadFile = Core.UploadFile;
export const GenerateImage = Core.GenerateImage;
export const ExtractDataFromUploadedFile = Core.ExtractDataFromUploadedFile;
