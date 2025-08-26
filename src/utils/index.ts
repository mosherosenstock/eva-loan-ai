


export function createPageUrl(pageName: string) {
    // Special mapping for known page names to handle acronyms correctly
    const pageNameMap: { [key: string]: string } = {
        'AIAgent': 'ai-agent',
        'GeneralDashboard': 'general-dashboard',
        'ManagerDashboard': 'manager-dashboard',
        'AnalystDashboard': 'analyst-dashboard',
        'BusinessApplications': 'business-applications',
        'BusinessApplicationDetail': 'business-application-detail',
        'BusinessLoanApplication': 'business-loan-application',
        'ApplicationDetail': 'application-detail',
        'ApplicationTracker': 'application-tracker',
        'TestPage': 'test'
    };
    
    // Use mapping if available, otherwise use generic conversion
    if (pageNameMap[pageName]) {
        return '/' + pageNameMap[pageName];
    }
    
    // Fallback: Convert camelCase to kebab-case
    return '/' + pageName
        .replace(/([a-z])([A-Z])/g, '$1-$2') // Add hyphen between camelCase words
        .toLowerCase()
        .replace(/^-/, '') // Remove leading hyphen if present
        .replace(/ /g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-'); // Replace multiple consecutive hyphens with single hyphen
}