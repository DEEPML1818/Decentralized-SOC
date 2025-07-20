import { useState, useEffect } from "react";
import { Router, Route, Switch } from "wouter";
import { Toaster } from "sonner";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AIAssistant from "./components/AIAssistant";
import { ThemeProvider } from "./components/ThemeProvider";
import "./App.css";
import SmartContractAudit from "./components/SmartContractAudit"; // Import the SmartContractAudit component


export default function App() {
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showAuditTool, setShowAuditTool] = useState(false); // State for the audit tool visibility

  useEffect(() => {
    const handleOpenAIAssistant = () => {
      setShowAIAssistant(true);
    };

    const handleOpenAuditTool = () => {
      setShowAuditTool(true);
    };

    window.addEventListener('openAIAssistant', handleOpenAIAssistant);
    window.addEventListener('openAuditTool', handleOpenAuditTool);

    return () => {
      window.removeEventListener('openAIAssistant', handleOpenAIAssistant);
      window.removeEventListener('openAuditTool', handleOpenAuditTool);
    };
  }, []);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <Router>
            <div className="min-h-screen bg-background text-foreground">
              <Switch>
                <Route path="/" component={Index} />
                <Route component={NotFound} />
              </Switch>
              <Toaster />

              {/* AI Assistant Modal */}
              {showAIAssistant && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-slate-800 border border-purple-500/30 rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b border-gray-700">
                      <h2 className="text-xl font-bold text-purple-400">AI Security Assistant</h2>
                      <button 
                        onClick={() => setShowAIAssistant(false)}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <AIAssistant />
                    </div>
                  </div>
                </div>
              )}

              {showAuditTool && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-slate-800 border border-purple-500/30 rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b border-gray-700">
                      <h2 className="text-xl font-bold text-purple-400">Smart Contract Auditor</h2>
                      <button 
                        onClick={() => setShowAuditTool(false)}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <SmartContractAudit />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Router>
        </ThemeProvider>
  );
}