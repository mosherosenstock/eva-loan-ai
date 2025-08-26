
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, User, Send, Sparkles, Loader2, BarChart3, FileText, Search, Mail, Download, RotateCw } from 'lucide-react';
import { InvokeLLM } from '@/api/integrations';
import { Avatar } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ReactMarkdown from 'react-markdown';

export default function EnhancedChatInterface({ onAction, applications }) {
  const [messages, setMessages] = useState([
    { type: 'bot', content: 'Hello! I am your AI Banking Assistant. I can analyze applications, generate charts, search for specific applications, and much more. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Listen for quick action events from sidebar
    const handleQuickAction = (event) => {
      handleSend(event.detail);
    };

    window.addEventListener('quickAction', handleQuickAction);
    return () => window.removeEventListener('quickAction', handleQuickAction);
  }, []);

  const suggestedPrompts = [
    { icon: FileText, text: 'Show me the latest applications', prompt: 'Show me the latest applications submitted this week.' },
    { icon: BarChart3, text: 'Chart applications by SUGEF rating', prompt: 'Generate a bar chart of applications by SUGEF rating.' },
    { icon: Search, text: 'Find high-risk applications', prompt: 'Find all applications with SUGEF rating C1, C2, or D that need immediate attention.' },
    { icon: Mail, text: 'Draft compliance email', prompt: 'Draft an email to compliance about the 3 highest-risk applications that require review.' },
  ];

  const handleRestart = () => {
    setMessages([
      { type: 'bot', content: 'Hello! I am your AI Banking Assistant. How can I assist you now?' }
    ]);
    setIsTyping(false);
    onAction({ type: 'CLEAR_RESPONSE' });
  };

  // This function pre-processes the AI's response to convert [APP:id] tags into standard markdown links
  const formatLinksForMarkdown = (text) => {
    if (!text || typeof text !== 'string') return '';
    
    return text.replace(/\[APP:([a-zA-Z0-9-]+)\]/g, (match, appId) => {
      const app = applications.find(a => a.id === appId);
      const name = app ? app.CompanyName : `Application #${appId.substring(0,8)}`;
      const url = createPageUrl(`BusinessApplicationDetail?id=${appId}`);
      // Create a markdown link that will be rendered by ReactMarkdown
      return `[**${name}**](${url})`;
    });
  };

  const handleSend = async (prompt = input) => {
    if (!prompt.trim()) return;

    const userMessage = { type: 'user', content: prompt };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const applicationContext = applications.slice(0, 10).map(app => ({
        id: app.id,
        CompanyName: app.CompanyName,
        SUGEF: app.SUGEF,
        AmountRequested: app.AmountRequested,
      }));

      const llmPrompt = `
        You are an AI assistant for a banking analyst. 
        Your MOST IMPORTANT rule is to reference applications using the format [APP:application_id].

        **CRITICAL**: Every time you mention a company name from the list below, you MUST wrap its corresponding ID in the [APP:...] format.

        Example of a BAD response:
        "Nature's World LLC is a high-value application."

        Example of a GOOD response:
        "The application from [APP:689d62a0cd6f70a5e468ea91] is high-value."

        User Request: "${prompt}"
        
        Available Applications (use these exact IDs for the [APP:...] format):
        ${applicationContext.map(app => `- Company: ${app.CompanyName}, ID: ${app.id}`).join('\n')}

        Now, generate a helpful and actionable markdown response following all rules.
      `;

      const result = await InvokeLLM({ prompt: llmPrompt });
      
      const preprocessedContent = formatLinksForMarkdown(result);
      
      const botMessage = { 
        type: 'bot', 
        content: preprocessedContent,
      };
      setMessages(prev => [...prev, botMessage]);

      // Also trigger chart actions if requested
      if (prompt.toLowerCase().includes('chart') || prompt.toLowerCase().includes('graph')) {
        if (prompt.toLowerCase().includes('sugef')) {
          onAction({ 
            type: 'GENERATE_CHART', 
            parameters: { xAxis: 'SUGEF', yAxis: 'count', title: 'Applications by SUGEF Rating' } 
          });
        } else if (prompt.toLowerCase().includes('industry')) {
            onAction({ 
              type: 'GENERATE_CHART', 
              parameters: { 
                xAxis: 'Industry', 
                yAxis: 'count', 
                title: 'Applications by Industry' 
              } 
            });
          }
      }

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = { 
        type: 'bot', 
        content: "I encountered an issue processing your request. Please try rephrasing or use one of the quick actions."
      };
      setMessages(prev => [...prev, errorMessage]);
    }
    
    setIsTyping(false);
  };

  return (
    <Card className="shadow-xl">
      <CardHeader className="bg-gradient-to-r from-[#1a365d] to-[#3182ce] text-white flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-6 h-6" />
          AI Banking Assistant
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={handleRestart} className="text-white hover:bg-white/20">
          <RotateCw className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-4 flex flex-col">
        {/* Suggested Prompts */}
        <div className="mb-4">
          <p className="text-sm text-slate-600 mb-2 font-medium">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((prompt, index) => (
              <Button 
                key={index} 
                variant="outline" 
                size="sm" 
                className="text-xs h-8 px-3" 
                onClick={() => handleSend(prompt.prompt)}
              >
                <prompt.icon className="w-3 h-3 mr-1" />
                {prompt.text}
              </Button>
            ))}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="h-[600px] overflow-y-auto p-4 space-y-4 border rounded-lg bg-slate-50 mb-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex items-start gap-3 ${message.type === 'user' ? 'justify-end' : ''}`}>
              {message.type === 'bot' && <Avatar className="w-8 h-8 bg-blue-600 text-white flex-shrink-0 flex items-center justify-center"><Sparkles className="w-4 h-4" /></Avatar>}
              
              <div className={`max-w-lg p-3 rounded-lg text-sm ${
                message.type === 'bot' 
                ? 'bg-white shadow-sm prose prose-sm max-w-none prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline' 
                : 'bg-blue-600 text-white'
              }`}>
                {message.type === 'bot' ? (
                  <ReactMarkdown
                    components={{
                      a: ({node, ...props}) => <Link to={props.href} target="_blank" {...props} />
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                ) : (
                  <div className="whitespace-pre-wrap">{message.content}</div>
                )}
              </div>

              {message.type === 'user' && <Avatar className="w-8 h-8 flex-shrink-0 flex items-center justify-center"><User className="w-4 h-4" /></Avatar>}
            </div>
          ))}
          {isTyping && (
            <div className="flex items-start gap-3">
              <Avatar className="w-8 h-8 bg-blue-600 text-white flex-shrink-0 flex items-center justify-center"><Sparkles className="w-4 h-4" /></Avatar>
              <div className="p-3 rounded-lg bg-white shadow-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                <span className="text-sm text-slate-500">Analyzing...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input Form */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about applications, generate charts, or request analysis..."
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1"
          />
          <Button onClick={() => handleSend()} disabled={isTyping} className="bg-[#1a365d] hover:bg-[#2c5282]">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
