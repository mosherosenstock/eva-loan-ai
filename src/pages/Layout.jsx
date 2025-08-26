
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { 
  LayoutDashboard, 
  Building2, 
  Upload, 
  BrainCircuit, 
  Menu,
  X,
  UserCog,
  UserCheck,
  Search
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const allNavItems = [
  {
    title: "General Dashboard",
    url: createPageUrl("GeneralDashboard"),
    icon: LayoutDashboard,
    description: "Global portfolio overview",
    roles: ['admin']
  },
  {
    title: "Manager Dashboard",
    url: createPageUrl("ManagerDashboard"),
    icon: UserCog,
    description: "Team performance & risk controls",
    roles: ['admin']
  },
  {
    title: "Analyst Dashboard",
    url: createPageUrl("AnalystDashboard"),
    icon: UserCheck,
    description: "My assigned work queue",
    roles: ['admin', 'user']
  },
  {
    title: "Business Applications",
    url: createPageUrl("BusinessApplications"),
    icon: Building2,
    description: "Manage business loan applications",
    roles: ['admin', 'user']
  },
  {
    title: "AI Agent",
    url: createPageUrl("AIAgent"),
    icon: BrainCircuit,
    description: "Chat with business loan data",
    roles: ['admin', 'user']
  },
  {
    title: "Apply for Business Loan",
    url: createPageUrl("BusinessLoanApplication"),
    icon: Upload,
    description: "Submit new business application",
    roles: ['admin', 'user', 'public']
  },
  {
      title: "Application Tracker",
      url: createPageUrl("ApplicationTracker"),
      icon: Search,
      description: "Track submitted application",
      roles: ['admin', 'user', 'public']
  },
  {
      title: "Test Page",
      url: createPageUrl("TestPage"),
      icon: Search,
      description: "Test routing functionality",
      roles: ['admin', 'user', 'public']
  }
];

const SidebarContent = ({ userRole }) => {
  const location = useLocation();
  
  const navigationItems = allNavItems.filter(item => item.roles.includes(userRole));
  
  return (
    <div className="flex flex-col h-full">
      <header className="border-b border-slate-200 p-6">
        <div className="flex items-center gap-3">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/951bcec0f_BN_LOGO.png" 
            alt="BN Logo" 
            className="h-8 w-auto object-contain"
          />
          <div>
            <h2 className="font-bold text-xl text-[#1a365d]">BusinessLoan_AI</h2>
            <p className="text-sm text-slate-500 font-medium">Credit Risk Platform</p>
          </div>
        </div>
      </header>
      
      <nav className="flex-1 p-3">
        <div className="space-y-2">
          {navigationItems.map((item) => (
            <Link 
              key={item.title}
              to={item.url} 
              className={`flex items-start gap-3 p-4 rounded-lg transition-all duration-200 hover:bg-blue-50 hover:text-[#1a365d] ${
                location.pathname === item.url 
                  ? 'bg-[#1a365d] text-white shadow-md' 
                  : 'text-slate-600'
              }`}
            >
              <item.icon className="w-6 h-6 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <span className="font-bold text-base block leading-tight">{item.title}</span>
                <span className="text-xs opacity-75 block">{item.description}</span>
              </div>
            </Link>
          ))}
        </div>
      </nav>

      <footer className="border-t border-slate-200 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#d69e2e] to-[#f6ad55] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-base">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[#1a365d] text-base truncate">Business Analyst</p>
            <p className="text-sm text-slate-500 truncate">Credit Risk Specialist</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await User.me();
        setUserRole(user.role || 'user');
      } catch (e) {
        console.log('User not authenticated, using public role:', e);
        setUserRole('public'); // Not logged in
      }
    };
    fetchUser();
  }, []);

  if (userRole === null) {
      return (
          <div className="flex h-screen w-full items-center justify-center">
              <Skeleton className="h-full w-80" />
              <div className="flex-1 p-8"><Skeleton className="h-16 w-full" /></div>
          </div>
      )
  }

  return (
    <div className="relative min-h-screen bg-slate-100">
      <aside className={`fixed inset-y-0 left-0 z-30 w-80 transform bg-white border-r border-slate-200 shadow-lg transition-transform duration-300 ease-in-out md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent userRole={userRole} />
      </aside>

      <div className="md:ml-80">
        <header className="sticky top-0 z-10 flex items-center justify-between bg-white p-4 shadow-sm md:hidden">
          <div className="flex items-center gap-3">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/951bcec0f_BN_LOGO.png" 
              alt="BN Logo" 
              className="h-7 w-auto object-contain"
            />
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-600 hover:text-slate-900">
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>
        
        <main className="flex-1">
          {children}
        </main>
      </div>

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}
