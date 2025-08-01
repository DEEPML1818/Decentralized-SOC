import { useState, useEffect, createContext, useContext } from "react";
import { Router, Route, Switch } from "wouter";
import { Toaster } from "sonner";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AIAssistant from "./components/AIAssistant";
import IncidentReport from "./components/IncidentReport";
import { ThemeProvider } from "./components/ThemeProvider";
import "./App.css";
import SmartContractAudit from "./components/SmartContractAudit";
import { ethers } from 'ethers';

// Define contract addresses
const contractAddresses = {
  CLTReward: "0xBb647745eFfFD6a950d08cE6Dddc6D6c308D1403",
  CLTStakingPool: "0xB480FA23e8d586Af034aae3CA9a0D111E071a01e",
  SOCService: "0x284B4cE9027b8f81211efd19A3a5D40D8b232D60",
};

// Create a WalletContext to manage wallet state
const WalletContext = createContext({
  isEVMConnected: false,
  evmAddress: null,
  connectEVM: async () => {},
  disconnectEVM: () => {},
  provider: null,
});

// Custom hook to use the WalletContext
export const useWallet = () => useContext(WalletContext);

// WalletProvider component to handle EVM connection
const WalletProvider = ({ children }) => {
  const [isEVMConnected, setIsEVMConnected] = useState(false);
  const [evmAddress, setEvmAddress] = useState(null);
  const [provider, setProvider] = useState(null);

  const connectEVM = async () => {
    if (window.ethereum) {
      try {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        const signer = web3Provider.getSigner();
        const address = await signer.getAddress();

        setProvider(web3Provider);
        setEvmAddress(address);
        setIsEVMConnected(true);
      } catch (error) {
        console.error("EVM connection error:", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const disconnectEVM = () => {
    setEvmAddress(null);
    setIsEVMConnected(false);
    setProvider(null);
  };

  const value = {
    isEVMConnected,
    evmAddress,
    connectEVM,
    disconnectEVM,
    provider,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

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
      <WalletProvider> {/* Wrap the entire app with WalletProvider */}
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
                    <IncidentReport onClose={() => setShowIncidentReport(false)} />
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