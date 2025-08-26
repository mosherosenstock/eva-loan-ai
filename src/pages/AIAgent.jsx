
import React, { useState, useEffect, useMemo } from 'react';
import { BusinessApplication } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, Bot, BarChart3, FileText, Loader2 } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// Component Imports
import EnhancedChatInterface from '../components/aiAgent/EnhancedChatInterface';
import AIInsightsSidebar from '../components/aiAgent/AIInsightsSidebar';

// Component to render AI-generated charts or text
const AIResponseDisplay = ({ content }) => {
  if (!content) return null; // Don't render anything if no content

  const { type, data, title } = content;

  // New function to parse message and create links
  const renderWithLinks = (text) => {
    // Handle non-string inputs safely
    if (!text || typeof text !== 'string') {
      return text || "";
    }
    
    const parts = text.split(/(\[APP:[a-zA-Z0-9-]+\])/gi); // Updated regex to include hyphen and 'i' flag
    return parts.map((part, index) => {
      const appMatch = part.match(/\[APP:([a-zA-Z0-9-]+)\]/); // Updated regex to include hyphen
      if (appMatch) {
        const appId = appMatch[1];
        return (
          <Link 
            key={index}
            to={createPageUrl(`BusinessApplicationDetail?id=${appId}`)}
            className="text-blue-600 font-semibold hover:underline"
          >
            Application #{appId.substring(0, 8)}...
          </Link>
        );
      }
      return part;
    });
  };

  switch (type) {
    case 'chart':
      return (
        <Card className="mt-6 shadow-lg animate-in fade-in duration-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5" /> {title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.chartData}>
                  <XAxis dataKey={data.xAxisKey} stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey={data.yAxisKey} fill="#1a365d" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      );
    case 'summary':
    case 'text_response':
      return (
        <Card className="mt-6 shadow-lg animate-in fade-in duration-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" /> {title || 'AI Response'}</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <ReactMarkdown
              components={{
                p: ({ node, children, ...props }) => {
                  // ReactMarkdown's 'children' prop can be an array containing strings and React elements
                  // We need to apply 'renderWithLinks' only to the string parts of the content
                  const processedChildren = React.Children.map(children, (child, index) => {
                    if (typeof child === 'string') {
                      return renderWithLinks(child);
                    }
                    // For other nodes (e.g., strong, em, or other markdown parsed elements), return as is
                    return child;
                  });
                  return <p {...props}>{processedChildren}</p>;
                },
              }}
            >
              {data}
            </ReactMarkdown>
          </CardContent>
        </Card>
      );
    default:
      return null;
  }
};

export default function AIAgent() {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [aiResponseContent, setAiResponseContent] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const applicationsData = await BusinessApplication.list("-created_date", 500);
    setApplications(applicationsData);
    setIsLoading(false);
  };

  const handleActionExecution = (action) => {
    const { type, parameters } = action;

    switch (type) {
      case 'GENERATE_CHART':
        const { xAxis, yAxis, title } = parameters;
        const chartData = applications.reduce((acc, app) => {
          const key = app[xAxis] || 'N/A';
          const existing = acc.find(item => item[xAxis] === key);
          if (existing) {
            existing[yAxis]++;
          } else {
            acc.push({ [xAxis]: key, [yAxis]: 1 });
          }
          return acc;
        }, []);
        
        setAiResponseContent({
          type: 'chart',
          title: title || `Applications by ${xAxis}`,
          data: {
            chartData,
            xAxisKey: xAxis,
            yAxisKey: yAxis
          }
        });
        break;
      
      case 'SUMMARIZE_PORTFOLIO':
      case 'TEXT_RESPONSE':
        setAiResponseContent({
          type: 'text_response',
          title: parameters.title || 'AI Response',
          data: parameters.text
        });
        break;

      case 'CLEAR_RESPONSE': // New case for clearing AI response
        setAiResponseContent(null);
        break;

      default:
        setAiResponseContent(null);
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-[#1a365d]" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-full mx-auto space-y-6">
      <div className="text-center">
        <BrainCircuit className="w-12 h-12 mx-auto text-[#1a365d]" />
        <h1 className="text-3xl font-bold text-slate-900 mt-4">AI Banking Assistant</h1>
        <p className="text-slate-600 mt-2">Interact with your portfolio data using natural language.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Main Interaction Area */}
        <div className="lg:col-span-2 space-y-6">
          <EnhancedChatInterface
            onAction={handleActionExecution}
            applications={applications}
          />
          <AIResponseDisplay content={aiResponseContent} />
        </div>

        {/* AI Insights Sidebar */}
        <div className="lg:col-span-1">
          <AIInsightsSidebar applications={applications} />
        </div>
      </div>
    </div>
  );
}
