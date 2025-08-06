import { useState, useEffect } from "react";
import { Router, Route, Switch } from "wouter";
import { Toaster } from "sonner";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PoolsPage from "./pages/PoolsPage";
import GuidePage from "./pages/GuidePage";
import IOTAPage from "./pages/IOTAPage";
import EVMPage from "./pages/EVMPage";
import RewardsPage from "./pages/RewardsPage";
import AIAssistant from "./components/AIAssistant";
import IncidentReport from "./components/IncidentReport";
import EVMIncidentReport from "./components/EVMIncidentReport";
import { ThemeProvider } from "./components/ThemeProvider";
import { WalletProvider } from "./components/WalletProvider";
import "./App.css";
import SmartContractAudit from "./components/SmartContractAudit";

function App() {
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showAuditTool, setShowAuditTool] = useState(false);
  const [showIncidentReport, setShowIncidentReport] = useState(false);
  const [aiPosition, setAiPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - aiPosition.x,
      y: e.clientY - aiPosition.y
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setAiPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  useEffect(() => {
    const handleOpenAIAssistant = () => {
      setShowAIAssistant(true);
    };

    const handleOpenAuditTool = () => {
      setShowAuditTool(true);
    };

    const handleOpenIncidentReport = () => {
      setShowIncidentReport(true);
    };

    window.addEventListener('openAIAssistant', handleOpenAIAssistant);
    window.addEventListener('openAuditTool', handleOpenAuditTool);
    window.addEventListener('openIncidentReport', handleOpenIncidentReport);

    return () => {
      window.removeEventListener('openAIAssistant', handleOpenAIAssistant);
      window.removeEventListener('openAuditTool', handleOpenAuditTool);
      window.removeEventListener('openIncidentReport', handleOpenIncidentReport);
    };
  }, []);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <WalletProvider>
        <Router>
          <div className="min-h-screen bg-background text-foreground">
            <Switch>
              <Route path="/" component={Index} />
              <Route path="/iota" component={IOTAPage} />
              <Route path="/evm" component={EVMPage} />
              <Route path="/guide" component={GuidePage} />
              <Route path="/pools" component={PoolsPage} />
              <Route path="/rewards" component={RewardsPage} />
              <Route component={NotFound} />
            </Switch>
            <Toaster />

            {/* AI Assistant Modal */}
            {showAIAssistant && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div 
                  className="bg-slate-800 border border-purple-500/30 rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col relative"
                  style={{
                    transform: `translate(${aiPosition.x}px, ${aiPosition.y}px)`,
                    cursor: isDragging ? 'grabbing' : 'default'
                  }}
                >
                  <div 
                    className="flex items-center justify-between p-4 border-b border-gray-700 cursor-grab active:cursor-grabbing"
                    onMouseDown={handleMouseDown}
                  >
                    <h2 className="text-xl font-bold text-purple-400 select-none">AI Security Assistant</h2>
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

            {/* Incident Report Modal */}
            {showIncidentReport && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-slate-800 border border-red-500/30 rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col">
                  <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-red-400">Security Incident Report</h2>
                    <button 
                      onClick={() => setShowIncidentReport(false)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    {window.location.pathname === '/evm' ? (
                      <EVMIncidentReport onClose={() => setShowIncidentReport(false)} />
                    ) : (
                      <IncidentReport onClose={() => setShowIncidentReport(false)} />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Router>
      </WalletProvider>
    </ThemeProvider>
  );
}

export default App;