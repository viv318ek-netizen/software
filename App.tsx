import React, { useState, useEffect, useRef } from 'react';
import { 
  Layout, 
  Code2, 
  Smartphone, 
  Tablet, 
  Monitor, 
  RefreshCw,
  History,
  Bot,
  User,
  ChevronRight
} from 'lucide-react';
import { sendMessage, resetSession } from './services/geminiService';
import { PreviewFrame } from './components/PreviewFrame';
import { PromptInput } from './components/PromptInput';
import { CodeViewer } from './components/CodeViewer';
import { DeviceView, Tab, ChatMessage } from './types';

const INITIAL_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 flex items-center justify-center min-h-screen">
    <div class="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md mx-4">
        <div class="mb-6 text-blue-500 flex justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/></svg>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Gemini Web Architect</h1>
        <p class="text-gray-600 mb-6">Describe your dream website in the chat below, and I'll build it for you instantly using React and Tailwind CSS.</p>
        <div class="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
            <span class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            Ready to create
        </div>
    </div>
</body>
</html>`;

export default function App() {
  const [html, setHtml] = useState<string>(INITIAL_HTML);
  const [device, setDevice] = useState<DeviceView>(DeviceView.DESKTOP);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.PREVIEW);
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom of chat when history updates
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  const handleSend = async (text: string) => {
    setLoading(true);
    
    // Add user message
    const userMsg: ChatMessage = { role: 'user', text, timestamp: Date.now() };
    setChatHistory(prev => [...prev, userMsg]);

    try {
      const response = await sendMessage(text);
      
      // Update HTML
      setHtml(response.html);
      
      // Add model response message
      const modelMsg: ChatMessage = { role: 'model', text: response.message, timestamp: Date.now() };
      setChatHistory(prev => [...prev, modelMsg]);
      
      // Switch to preview if not already
      setActiveTab(Tab.PREVIEW);
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = { 
        role: 'model', 
        text: "I encountered an error generating the website. Please try again or rephrase your request.", 
        timestamp: Date.now() 
      };
      setChatHistory(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to start over? This will clear the chat and the current design.")) {
      resetSession();
      setHtml(INITIAL_HTML);
      setChatHistory([]);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-gray-900 text-white overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-gray-900/50 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Layout size={20} className="text-white" />
          </div>
          <h1 className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Gemini Web Architect
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-gray-800 p-1 rounded-lg border border-gray-700">
            <button 
              onClick={() => setActiveTab(Tab.PREVIEW)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === Tab.PREVIEW ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
            >
              <Layout size={16} /> Preview
            </button>
            <button 
              onClick={() => setActiveTab(Tab.CODE)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === Tab.CODE ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
            >
              <Code2 size={16} /> Code
            </button>
          </div>
          
          <button 
             onClick={handleReset}
             className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
             title="Reset Project"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Chat Sidebar */}
        <div className="w-96 flex flex-col border-r border-gray-800 bg-gray-900/95 shrink-0 z-20">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {chatHistory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4 p-8 text-center opacity-60">
                <History size={48} strokeWidth={1} />
                <p className="text-sm">History is empty. Start by describing what you want to build.</p>
              </div>
            ) : (
              chatHistory.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-gray-700' : 'bg-gradient-to-br from-blue-500 to-purple-600'}`}>
                    {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-gray-800 text-white rounded-tr-sm' 
                      : 'bg-gray-800/50 text-gray-200 border border-gray-700 rounded-tl-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>
          
          <div className="p-4 border-t border-gray-800 bg-gray-900">
             <PromptInput onSend={handleSend} isLoading={loading} />
             <div className="mt-3 flex items-center justify-between text-xs text-gray-500 px-1">
                <span>Powered by Gemini 2.5 Flash</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Online</span>
             </div>
          </div>
        </div>

        {/* Workspace */}
        <div className="flex-1 flex flex-col bg-[#0e0e0e] relative overflow-hidden">
          {/* Toolbar */}
          <div className="h-12 border-b border-gray-800 flex items-center justify-center gap-2 px-4 bg-[#141414]">
             <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mr-2">Viewport</span>
             <button 
                onClick={() => setDevice(DeviceView.DESKTOP)}
                className={`p-2 rounded-md transition-all ${device === DeviceView.DESKTOP ? 'bg-gray-800 text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
                title="Desktop"
              >
                <Monitor size={18} />
             </button>
             <button 
                onClick={() => setDevice(DeviceView.TABLET)}
                className={`p-2 rounded-md transition-all ${device === DeviceView.TABLET ? 'bg-gray-800 text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
                title="Tablet"
              >
                <Tablet size={18} />
             </button>
             <button 
                onClick={() => setDevice(DeviceView.MOBILE)}
                className={`p-2 rounded-md transition-all ${device === DeviceView.MOBILE ? 'bg-gray-800 text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
                title="Mobile"
              >
                <Smartphone size={18} />
             </button>
          </div>

          {/* Canvas */}
          <div className="flex-1 p-8 overflow-hidden bg-grid-pattern relative">
            <div className="absolute inset-0 bg-gradient-to-b from-[#0e0e0e] via-transparent to-[#0e0e0e]/50 pointer-events-none z-0"></div>
            
            <div className="relative z-10 h-full w-full flex items-start justify-center">
              {activeTab === Tab.PREVIEW ? (
                 <PreviewFrame html={html} device={device} />
              ) : (
                 <div className="w-full h-full max-w-4xl">
                   <CodeViewer code={html} />
                 </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #374151;
          border-radius: 4px;
        }
        .bg-grid-pattern {
          background-size: 40px 40px;
          background-image: linear-gradient(to right, #232323 1px, transparent 1px),
                            linear-gradient(to bottom, #232323 1px, transparent 1px);
        }
      `}</style>
    </div>
  );
}
