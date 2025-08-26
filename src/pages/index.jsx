import Layout from "./Layout.jsx";

import ApplicationDetail from "./ApplicationDetail";

import AIAgent from "./AIAgent";

import BusinessLoanApplication from "./BusinessLoanApplication";

import BusinessApplications from "./BusinessApplications";

import BusinessApplicationDetail from "./BusinessApplicationDetail";

import GeneralDashboard from "./GeneralDashboard";

import ManagerDashboard from "./ManagerDashboard";

import AnalystDashboard from "./AnalystDashboard";

import ApplicationTracker from "./ApplicationTracker";
import TestPage from "./TestPage";
import ErrorBoundary from "../components/ErrorBoundary";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    ApplicationDetail: ApplicationDetail,
    
    AIAgent: AIAgent,
    
    BusinessLoanApplication: BusinessLoanApplication,
    
    BusinessApplications: BusinessApplications,
    
    BusinessApplicationDetail: BusinessApplicationDetail,
    
    GeneralDashboard: GeneralDashboard,
    
    ManagerDashboard: ManagerDashboard,
    
    AnalystDashboard: AnalystDashboard,
    
    ApplicationTracker: ApplicationTracker,
    
    TestPage: TestPage,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    // Handle kebab-case URLs by converting them to camelCase for matching
    const convertKebabToCamel = (kebab) => {
        return kebab.split('-').map((part, index) => {
            if (index === 0) return part;
            return part.charAt(0).toUpperCase() + part.slice(1);
        }).join('');
    };

    // Try exact match first
    let pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    
    // If no exact match, try converting kebab-case to camelCase
    if (!pageName) {
        const camelCaseUrl = convertKebabToCamel(urlLastPart);
        pageName = Object.keys(PAGES).find(page => page === camelCaseUrl);
    }
    
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <ErrorBoundary>
            <Layout currentPageName={currentPage}>
                <Routes>            
                    
                        <Route path="/" element={<GeneralDashboard />} />
                    
                    
                    <Route path="/application-detail" element={<ApplicationDetail />} />
                    
                    <Route path="/ai-agent" element={<AIAgent />} />
                    
                    <Route path="/business-loan-application" element={<BusinessLoanApplication />} />
                    
                    <Route path="/business-applications" element={<BusinessApplications />} />
                    
                    <Route path="/business-application-detail" element={<BusinessApplicationDetail />} />
                    
                    <Route path="/general-dashboard" element={<GeneralDashboard />} />
                    
                    <Route path="/manager-dashboard" element={<ManagerDashboard />} />
                    
                    <Route path="/analyst-dashboard" element={<AnalystDashboard />} />
                    
                    <Route path="/application-tracker" element={<ApplicationTracker />} />
                    
                    <Route path="/test" element={<TestPage />} />
                    
                </Routes>
            </Layout>
        </ErrorBoundary>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}