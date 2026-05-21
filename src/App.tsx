import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowRight, 
  DollarSign, 
  LineChart, 
  Lock, 
  Unlock, 
  Mail, 
  User, 
  Wallet, 
  Compass, 
  FileText, 
  HelpCircle, 
  Sparkles, 
  ShieldCheck, 
  Download, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  Coins, 
  ChevronRight,
  Info,
  Layers,
  ArrowUpRight,
  Sparkle,
  Briefcase,
  LockKeyhole
} from "lucide-react";

import { BudgetData, AnalysisResult } from "./types";
import { DoughnutChart } from "./components/DoughnutChart";
import { CPALockerModal } from "./components/CPALockerModal";
import { addLead, LeadSubmission } from "./lib/firebase";

export default function App() {
  // Navigation & Wizard Phase State
  // 'landing' | 'inputs' | 'analyzing' | 'dashboard'
  const [phase, setPhase] = useState<'landing' | 'inputs' | 'analyzing' | 'dashboard'>('landing');

  // Onboarding/Account state
  const [userData, setUserData] = useState({ name: "Private Auditor", email: "auditor@local-ledger.secure" });
  const [accountError, setAccountError] = useState("");

  // Budget numbers input state
  const [inputs, setInputs] = useState({
    monthlyIncome: "0",
    rent: "0",
    bills: "0",
    foodLifestyle: "0",
    debtPayments: "0",
    subscriptions: "0",
    otherSpending: "0"
  });

  // Loading/Console Ticker Lines
  const [tickerIndex, setTickerIndex] = useState(0);
  const tickers = [
    "[SYSTEM] Structuring secure local sandbox ledger...",
    "[ALGO] Computing primary income-to-shelter ratio (Target: <30%)...",
    "[ENGINE] Running predictive risk modeling loops on fixed rate nodes...",
    "[ALGO] Cross-referencing non-discretionary debt payment obligations...",
    "[PREDICT] Mapping lifestyle outflow efficiency targets...",
    "[SYSTEM] Drafting personalized capital amortization protocols...",
    "[OPTIMIZER] Final verification of optimal allocation multipliers..."
  ];

  // Calculated Results
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [freeInsights, setFreeInsights] = useState<string[]>([]);
  const [premiumStrategy, setPremiumStrategy] = useState<string>("");
  const [downloadBlueprint, setDownloadBlueprint] = useState<string>("");

  // Locker and Premium Unlock state
  const [isLockerOpen, setIsLockerOpen] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [tempEmail, setTempEmail] = useState("");

  // Field validation and errors
  const [formError, setFormError] = useState("");

  // Handle CTA Landing
  const handleStartAnalysis = () => {
    setPhase('inputs');
  };

  // Handle Account creation onboarding
  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData.name.trim()) {
      setAccountError("Please enter your name to authorize the portfolio workspace.");
      return;
    }
    if (!userData.email.trim() || !userData.email.includes("@")) {
      setAccountError("Please provide a valid email address.");
      return;
    }
    setAccountError("");
    setPhase('inputs');
  };

  // Run budget math algorithms locally & query API
  const handleBudgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check numbers
    const values = {
      monthlyIncome: parseFloat(inputs.monthlyIncome) || 0,
      rent: parseFloat(inputs.rent) || 0,
      bills: parseFloat(inputs.bills) || 0,
      foodLifestyle: parseFloat(inputs.foodLifestyle) || 0,
      debtPayments: parseFloat(inputs.debtPayments) || 0,
      subscriptions: parseFloat(inputs.subscriptions) || 0,
      otherSpending: parseFloat(inputs.otherSpending) || 0,
    };

    if (values.monthlyIncome <= 0) {
      setFormError("Monthly income must be a positive transactional amount.");
      return;
    }
    setFormError("");

    // Trigger analyzing phase with console ticker simulation
    setPhase('analyzing');
    setTickerIndex(0);

    const tickerTimer = setInterval(() => {
      setTickerIndex((prev) => {
        if (prev >= tickers.length - 1) {
          clearInterval(tickerTimer);
          return prev;
        }
        return prev + 1;
      });
    }, 850);

    try {
      // Calculate financial output metrics locally
      const totalSpending = values.rent + values.bills + values.foodLifestyle + values.debtPayments + values.subscriptions + values.otherSpending;
      const remainingCapital = values.monthlyIncome - totalSpending;
      const expenseRate = totalSpending / values.monthlyIncome;
      const housingRatio = values.rent / values.monthlyIncome;
      const debtPressure = values.debtPayments / values.monthlyIncome;

      // Calculate dynamic Financial Safety Score (Standard Wealth Ratio Algorithm)
      let baseScore = 100;
      // Subtract for high housing
      if (housingRatio > 0.3) {
        baseScore -= Math.round((housingRatio - 0.3) * 200);
      }
      // Subtract for high debt burden
      if (debtPressure > 0.15) {
        baseScore -= Math.round((debtPressure - 0.15) * 300);
      }
      // Subtract for excess total spending pressure
      if (expenseRate > 0.85) {
        baseScore -= 25;
      }
      if (expenseRate >= 1.0) {
        baseScore -= 20; // deficit penalty
      }
      const safetyScore = Math.max(10, Math.min(100, baseScore));

      // Determine qualitative risk levels
      let riskLevel: 'Secure' | 'Moderate' | 'High Risk' | 'Critical' = 'Secure';
      if (expenseRate >= 1.0 || safetyScore < 35) {
        riskLevel = 'Critical';
      } else if (expenseRate >= 0.8 || safetyScore < 55) {
        riskLevel = 'High Risk';
      } else if (expenseRate >= 0.6 || safetyScore < 80) {
        riskLevel = 'Moderate';
      }

      setAnalysis({
        remainingCapital,
        totalSpending,
        safetyScore,
        expenseRate,
        riskLevel,
        housingRatio,
        debtPressure
      });

      // Secure full-stack server-side Gemini generation POST API request
      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          name: userData.name,
          email: userData.email
         })
      });

      if (!response.ok) {
        throw new Error("Failsafe triggers: request finished with server-side validation alerts.");
      }

      const reply = await response.json();
      setFreeInsights(reply.freeInsights || []);
      setPremiumStrategy(reply.premiumStrategy || "");
      setDownloadBlueprint(reply.downloadBlueprint || "");

    } catch (err) {
      console.warn("Express backend generated local state backup models because server endpoints were resting:", err);
    } finally {
      // Small timeout buffer so the console lines settle beautifully
      setTimeout(() => {
        setPhase('dashboard');
        setIsLockerOpen(false);
      }, 6500); // 6.5s analysis to display tickers fully and look super pro
    }
  };

  // Safe file downloader for the TXT blueprint
  const downloadBlueprintFile = () => {
    if (!downloadBlueprint) return;
    const blob = new Blob([downloadBlueprint], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Wealthynx_Premium_Wealth_Blueprint_${userData.name.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    
    // Garbage cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  };

  // Formatting utility to parse basic Markdown segments to beautiful DOM layout list
  const renderMarkdownContent = (text: string) => {
    if (!text) return null;
    return text.split("\n").map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-2" />;
      
      // Headers
      if (trimmed.startsWith("###")) {
        return (
          <h4 key={idx} className="text-sm font-bold text-neutral-200 mt-5 mb-2 flex items-center gap-2 font-display tracking-wide uppercase">
            <span className="w-1.5 h-3.5 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-sm" />
            {trimmed.replace("###", "").trim()}
          </h4>
        );
      }
      if (trimmed.startsWith("##")) {
        return (
          <h3 key={idx} className="text-base font-bold text-white mt-6 mb-3 border-b border-white/5 pb-1.5 font-display tracking-tight">
            {trimmed.replace("##", "").trim()}
          </h3>
        );
      }
      if (trimmed.startsWith("#")) {
        return (
          <h2 key={idx} className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400 mt-7 mb-4 tracking-tight font-display uppercase">
            {trimmed.replace("#", "").trim()}
          </h2>
        );
      }
      
      // Bullets
      if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
        const bulletText = trimmed.replace(/^[-*]\s*/, "");
        // Highlight bold text inside bullet points
        const boldRegex = /\*\*(.*?)\*\*/g;
        const parts = [];
        let lastIndex = 0;
        let match;
        while ((match = boldRegex.exec(bulletText)) !== null) {
          if (match.index > lastIndex) {
            parts.push(bulletText.substring(lastIndex, match.index));
          }
          parts.push(<strong key={match.index} className="text-emerald-400 font-semibold">{match[1]}</strong>);
          lastIndex = boldRegex.lastIndex;
        }
        if (lastIndex < bulletText.length) {
          parts.push(bulletText.substring(lastIndex));
        }

        return (
          <div key={idx} className="flex items-start gap-3 my-2 text-[13px] text-neutral-300 font-sans leading-relaxed">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0 mt-2 shadow-sm shadow-emerald-500/50" />
            <span>{parts.length > 0 ? parts : bulletText}</span>
          </div>
        );
      }

      // Strong paragraphs
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      while ((match = boldRegex.exec(trimmed)) !== null) {
        if (match.index > lastIndex) {
          parts.push(trimmed.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="text-white font-medium">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      if (lastIndex < trimmed.length) {
        parts.push(trimmed.substring(lastIndex));
      }

      return (
        <p key={idx} className="text-[13px] text-neutral-400 font-sans leading-relaxed mb-3.5">
          {parts.length > 0 ? parts : trimmed}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#02050b] via-[#030914] to-[#010204] text-slate-200 flex flex-col justify-between selection:bg-emerald-500/30 selection:text-emerald-100 overflow-x-hidden relative font-sans">

      {/* Premium Finance Mesh Gradient Background Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-950/20 rounded-full blur-[160px] pointer-events-none select-none animate-blob-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-amber-950/10 rounded-full blur-[160px] pointer-events-none select-none animate-blob-slow-reverse"></div>
      <div className="absolute top-[30%] right-[20%] w-[40%] h-[40%] bg-emerald-950/10 rounded-full blur-[140px] pointer-events-none select-none"></div>
      
      {/* Subtle overlay high-tech ledger grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#02050b_85%),linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />

      {/* Modern High-End Premium Finance Header */}
      <header className="relative w-full border-b border-white/[0.04] bg-[#02050b]/65 backdrop-blur-2xl z-40 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative group/logo">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500 to-emerald-500 rounded-lg blur opacity-50 group-hover/logo:opacity-100 transition duration-500" />
              <div className="relative w-9 h-9 sm:w-10 h-10 bg-black rounded-xl flex items-center justify-center border border-white/10 shrink-0">
                <Compass className="w-5 h-5 text-amber-400 animate-[spin_120s_linear_infinite]" />
              </div>
            </div>
            <div>
              <span className="text-xs sm:text-sm font-extrabold font-display text-white tracking-widest uppercase leading-none block">
                Wealthy<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-300 font-black">NX</span>
              </span>
              <span className="text-[8px] sm:text-[9px] font-mono text-slate-400 tracking-wider mt-1 uppercase hidden xs:block">
                INTELLIGENT WEALTH ARCHITECTURE
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {phase === 'dashboard' && (
              <div className="hidden md:flex items-center gap-2 bg-white/[0.02] hover:bg-white/[0.04] p-1.5 px-3.5 rounded-xl border border-white/[0.06] transition-colors">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs text-slate-300 font-mono font-medium">{userData.name}</span>
              </div>
            )}
            
            <div className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 text-[9px] sm:text-[10px] font-mono rounded-full font-bold border transition-all ${
              isUnlocked 
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/35 glow-green" 
                : "bg-amber-505/10 text-amber-400 border-amber-500/25 shadow-sm shadow-amber-500/5"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isUnlocked ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>{isUnlocked ? "PREMIUM SERVICE ACTIVE" : "SECURE SANDBOX SUITE"}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Core Dynamic Screen Frame */}
      <main className="flex-grow flex items-center justify-center py-10 px-4 relative z-10 w-full max-w-7xl mx-auto">
        <AnimatePresence mode="wait">

          {/* PHASE 1: Landing Page */}
          {phase === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-4xl text-center flex flex-col items-center"
            >
              {/* Premium Hero Banner Badge */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-emerald-500/10 via-amber-500/5 to-emerald-500/10 text-amber-400 rounded-full text-xs font-sans font-bold tracking-wider border border-amber-500/20 mb-8 uppercase hover:border-amber-400/35 transition-colors cursor-default"
              >
                <Sparkle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Intelligent Wealth & Amortization Engineering</span>
              </motion.div>

              <h1 className="text-4xl sm:text-6xl font-black font-display text-white tracking-tight leading-[1.23] mb-6 max-w-4xl text-center font-sans">
                Architect Your Financial Legacy<br />
                <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-amber-300 bg-clip-text text-transparent drop-shadow-md">
                  With Absolute Local Privacy
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-3xl mb-10 font-sans leading-relaxed font-light">
                Secure your sovereign wealth. Instantly audit structural micro-budget stress vectors, construct capital safety coefficients, and implement standardized repayment roadmaps designed with complete zero-knowledge private ledger isolation.
              </p>

              {/* Start Button directly under paragraph */}
              <button
                id="start_analysis_btn"
                onClick={handleStartAnalysis}
                className="group relative px-9 py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500 text-white font-extrabold font-display text-xs rounded-2xl uppercase tracking-wider shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2.5 overflow-hidden border border-emerald-400/30 glow-premium mb-14"
              >
                {/* Shiny hover glare */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <span className="font-sans font-bold">Initialize Free Strategic Audit</span>
                <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1.5 transition-transform text-white/90" />
              </button>

              {/* Bento Grid Features Layout - Translated to English */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl mb-14 select-none">
                
                {/* Panel 1 */}
                <div className="bg-slate-900/[0.12] border-t-2 border-t-emerald-500/40 border-l border-r border-b border-white/[0.05] p-6 rounded-2xl text-left hover:border-emerald-500/25 hover:bg-slate-900/[0.2] transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <ShieldCheck className="w-16 h-16 text-emerald-400" />
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/20 md:ml-0 md:mr-auto">
                    <ShieldCheck className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="font-bold text-sm text-white mb-2 font-sans tracking-tight">Solvency & Liquidity Rating</h3>
                  <p className="text-xs text-slate-400 font-sans leading-relaxed">Synthesize cash reserves and liquidity indices to draw up a robust risk-adjusted asset framework.</p>
                </div>

                {/* Panel 2 */}
                <div className="bg-slate-900/[0.12] border-t-2 border-t-amber-500/40 border-l border-r border-b border-white/[0.05] p-6 rounded-2xl text-left hover:border-amber-500/25 hover:bg-slate-900/[0.2] transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <TrendingUp className="w-16 h-16 text-amber-400" />
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4 border border-amber-500/20 md:ml-0 md:mr-auto">
                    <TrendingUp className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="font-bold text-sm text-white mb-2 font-sans tracking-tight">Deficit & Spending Compression</h3>
                  <p className="text-xs text-slate-400 font-sans leading-relaxed">Locate and curb hidden digital liabilities and non-essential outflows to optimize monthly savings ratios.</p>
                </div>

                {/* Panel 3 */}
                <div className="bg-slate-900/[0.12] border-t-2 border-t-emerald-500/40 border-l border-r border-b border-white/[0.05] p-6 rounded-2xl text-left hover:border-emerald-500/25 hover:bg-slate-900/[0.2] transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Sparkles className="w-16 h-16 text-emerald-450" />
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/20 md:ml-0 md:mr-auto">
                    <Sparkles className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="font-bold text-sm text-white mb-2 font-sans tracking-tight">Liability Debt Compaction</h3>
                  <p className="text-xs text-slate-400 font-sans leading-relaxed">Model debt liabilities against accelerated repayment vectors to optimize amortization and release cash flow.</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* PHASE 3: Budget Form inputs */}
          {phase === 'inputs' && (
            <motion.div
              key="inputs"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch"
            >
              {/* Left Column - Information Cockpit Card */}
              <div className="md:col-span-4 bg-slate-950/80 border border-white/[0.08] backdrop-blur-2xl rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden shadow-xl text-left font-sans">
                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/25 rounded-md text-[9px] font-mono text-amber-400 font-bold uppercase tracking-widest leading-none">
                      Step 1 of 2
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Ledger Metrics</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-white tracking-tight leading-snug mb-3">
                    Budget Allocations
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans mb-4">
                    Provide your monthly income and average spending distribution figures below. This will calibrate custom savings trajectories, solvency ratios, and accelerated amortization plans.
                  </p>
                </div>
                <div className="p-4 bg-white/[0.02] border border-white/[0.04] rounded-2xl flex items-center gap-3 select-none text-left">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <span className="block text-[10px] font-mono text-slate-500 uppercase leading-none">Active Profile</span>
                    <span className="block text-xs font-semibold text-neutral-100 truncate mt-1">{userData.name}</span>
                  </div>
                </div>
              </div>

              {/* Right Column - The Form Fields (8 Cols) */}
              <div className="md:col-span-8 bg-slate-950/85 border border-white/[0.08] backdrop-blur-2xl rounded-3xl p-8 relative shadow-2xl flex flex-col justify-between font-sans">
                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-555/40 to-transparent" />
                
                {formError && (
                  <div className="p-3.5 mb-5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-xs font-mono flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <form onSubmit={handleBudgetSubmit} className="space-y-6">
                  
                  {/* Prime Income */}
                  <div className="p-5 bg-emerald-500/[0.02] border border-emerald-500/20 hover:border-emerald-500/35 rounded-2xl shadow-inner transition-colors text-left animate-pulse-slow">
                    <label className="block text-[10px] font-bold text-emerald-400 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5 text-emerald-450" /> Net Monthly Income
                    </label>
                    <div className="relative mt-2">
                      <span className="absolute left-1 top-1.5 text-slate-300 font-display font-light text-2xl select-none">$</span>
                      <input
                        id="input_monthlyIncome"
                        type="number"
                        required
                        placeholder="0"
                        value={inputs.monthlyIncome}
                        onChange={(e) => setInputs({ ...inputs, monthlyIncome: e.target.value })}
                        className="w-full pb-2 pl-6 bg-transparent border-b border-white/5 focus:border-emerald-400 transition-colors text-xl font-bold font-mono text-white focus:outline-none text-left"
                      />
                    </div>
                  </div>

                  <div className="text-left">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3 select-none">
                      Monthly Spending Breakdown:
                    </h4>
                    
                    {/* Input Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                      
                      {/* Rent */}
                      <div className="p-3.5 bg-white/[0.015] border border-white/[0.04] focus-within:border-emerald-500/40 focus-within:bg-white/[0.025] rounded-xl transition-all">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                          Rent & Shelter
                        </label>
                        <div className="relative mt-1">
                          <span className="absolute left-0 top-1 text-slate-500 text-xs">$</span>
                          <input
                            id="input_rent"
                            type="number"
                            placeholder="0"
                            value={inputs.rent}
                            onChange={(e) => setInputs({ ...inputs, rent: e.target.value })}
                            className="w-full pb-1 pl-4.5 bg-transparent border-b border-white/5 focus:border-white transition-colors text-xs font-semibold font-mono text-white focus:outline-none text-left"
                          />
                        </div>
                      </div>

                      {/* Utilities */}
                      <div className="p-3.5 bg-white/[0.015] border border-white/[0.04] focus-within:border-blue-500/40 focus-within:bg-white/[0.025] rounded-xl transition-all">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                          Utility Bills & Services
                        </label>
                        <div className="relative mt-1">
                          <span className="absolute left-0 top-1 text-slate-500 text-xs">$</span>
                          <input
                            id="input_bills"
                            type="number"
                            placeholder="0"
                            value={inputs.bills}
                            onChange={(e) => setInputs({ ...inputs, bills: e.target.value })}
                            className="w-full pb-1 pl-4.5 bg-transparent border-b border-white/5 focus:border-white transition-colors text-xs font-semibold font-mono text-white focus:outline-none text-left"
                          />
                        </div>
                      </div>

                      {/* Food & Lifestyle */}
                      <div className="p-3.5 bg-white/[0.015] border border-white/[0.04] focus-within:border-teal-500/40 focus-within:bg-white/[0.025] rounded-xl transition-all">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                          Food & Lifestyle spending
                        </label>
                        <div className="relative mt-1">
                          <span className="absolute left-0 top-1 text-slate-500 text-xs">$</span>
                          <input
                            id="input_foodLifestyle"
                            type="number"
                            placeholder="0"
                            value={inputs.foodLifestyle}
                            onChange={(e) => setInputs({ ...inputs, foodLifestyle: e.target.value })}
                            className="w-full pb-1 pl-4.5 bg-transparent border-b border-white/5 focus:border-white transition-colors text-xs font-semibold font-mono text-white focus:outline-none text-left"
                          />
                        </div>
                      </div>

                      {/* Debts */}
                      <div className="p-3.5 bg-white/[0.015] border border-white/[0.04] focus-within:border-amber-500/40 focus-within:bg-white/[0.025] rounded-xl transition-all">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                          Debt Payments
                        </label>
                        <div className="relative mt-1">
                          <span className="absolute left-0 top-1 text-slate-500 text-xs">$</span>
                          <input
                            id="input_debtPayments"
                            type="number"
                            placeholder="0"
                            value={inputs.debtPayments}
                            onChange={(e) => setInputs({ ...inputs, debtPayments: e.target.value })}
                            className="w-full pb-1 pl-4.5 bg-transparent border-b border-white/5 focus:border-white transition-colors text-xs font-semibold font-mono text-white focus:outline-none text-left"
                          />
                        </div>
                      </div>

                      {/* Subscriptions */}
                      <div className="p-3.5 bg-white/[0.015] border border-white/[0.04] focus-within:border-violet-500/40 focus-within:bg-white/[0.025] rounded-xl transition-all">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                          Digital Subscriptions
                        </label>
                        <div className="relative mt-1">
                          <span className="absolute left-0 top-1 text-slate-500 text-xs">$</span>
                          <input
                            id="input_subscriptions"
                            type="number"
                            placeholder="0"
                            value={inputs.subscriptions}
                            onChange={(e) => setInputs({ ...inputs, subscriptions: e.target.value })}
                            className="w-full pb-1 pl-4.5 bg-transparent border-b border-white/5 focus:border-white transition-colors text-xs font-semibold font-mono text-white focus:outline-none text-left"
                          />
                        </div>
                      </div>

                      {/* Other */}
                      <div className="p-3.5 bg-white/[0.015] border border-white/[0.04] focus-within:border-neutral-500/40 focus-within:bg-white/[0.025] rounded-xl transition-all">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                          Other Spending
                        </label>
                        <div className="relative mt-1">
                          <span className="absolute left-0 top-1 text-slate-500 text-xs">$</span>
                          <input
                            id="input_otherSpending"
                            type="number"
                            placeholder="0"
                            value={inputs.otherSpending}
                            onChange={(e) => setInputs({ ...inputs, otherSpending: e.target.value })}
                            className="w-full pb-1 pl-4.5 bg-transparent border-b border-white/5 focus:border-white transition-colors text-xs font-semibold font-mono text-white focus:outline-none text-left"
                          />
                        </div>
                      </div>

                    </div>
                  </div>

                  <button
                    id="budget_submit_btn"
                    type="submit"
                    className="w-full py-4.5 bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500 hover:from-emerald-500 hover:to-amber-400 text-white font-extrabold text-xs rounded-xl uppercase tracking-wider hover:scale-[1.01] active:scale-95 transition-all shadow-xl shadow-emerald-500/10 cursor-pointer flex items-center justify-center gap-2 mt-4 border border-emerald-400/20 glow-premium animate-pulse-slow"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Run Financial Diagnostic Algorithms</span>
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* PHASE 4: Analysis Loading Screen */}
          {phase === 'analyzing' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-md bg-slate-950/80 border border-white/[0.08] backdrop-blur-2xl rounded-3xl p-8 relative overflow-hidden text-center shadow-2xl"
            >
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
              
              {/* Floating Glowing Compass Loader */}
              <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center " id="algo_spinner">
                <div className="absolute inset-0 bg-amber-500/10 rounded-full animate-ping" />
                <div className="absolute inset-2 bg-gradient-to-tr from-emerald-500 via-amber-400 to-emerald-700 rounded-full animate-spin duration-[2.5s]" />
                <div className="absolute inset-[10px] bg-[#02050b] rounded-full" />
                <Compass className="w-8 h-8 text-amber-400 absolute animate-pulse" />
              </div>

              <h2 className="text-xl font-extrabold text-white font-display mt-2 tracking-tight">
                Synthesizing Wealth Vectors
              </h2>
              <p className="text-xs text-slate-400 mt-1.5 max-w-xs mx-auto leading-relaxed font-sans">
                Aligning current parameters against standardized asset preservation ratios...
              </p>

              {/* Console logs terminal mock box */}
              <div className="mt-8 bg-neutral-900/30 border border-white/[0.04] p-5 rounded-2xl min-h-[100px] backdrop-blur-md flex items-center justify-center text-left">
                <AnimatePresence mode="popLayout">
                  <motion.p
                    key={tickerIndex}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                    className="text-xs text-emerald-400 font-mono text-center tracking-tight leading-relaxed max-w-[280px]"
                  >
                    {tickers[tickerIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* Loader indicators */}
              <div className="mt-6 flex items-center justify-between text-[9px] font-mono text-slate-500 select-none uppercase tracking-widest border-t border-white/[0.04] pt-4">
                <span>LEDGER GATEWAY: SECURE</span>
                <span>COMPLY REGIME: CONFIRMED</span>
              </div>
            </motion.div>
          )}

          {/* PHASE 5: Live Dashboard */}
          {phase === 'dashboard' && analysis && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              
              {/* Upper Header Module Row (12 columns) */}
              <div className="lg:col-span-12 flex flex-col sm:flex-row items-center justify-between gap-5 bg-slate-950/[0.4] border border-white/[0.06] backdrop-blur-3xl p-6 rounded-3xl">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest">Active Safe Session</span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5 font-display">
                    Private Capital Ledger
                  </h2>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">Asset metrics formulated exclusively for <span className="text-white font-medium">{userData.name}</span></p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    id="back_to_inputs_btn"
                    onClick={() => {
                      setInputs({
                        monthlyIncome: "6500",
                        rent: "1850",
                        bills: "450",
                        foodLifestyle: "1100",
                        debtPayments: "500",
                        subscriptions: "120",
                        otherSpending: "350"
                      });
                      setPhase('inputs');
                    }}
                    className="text-xs text-slate-300 hover:text-white bg-white/[0.02] border border-white/[0.08] px-5 py-3 rounded-xl hover:bg-white/[0.04] active:scale-95 transition-all font-display tracking-wide font-bold uppercase cursor-pointer"
                  >
                    Adjust Figures
                  </button>
                </div>
              </div>

              {/* ROW 1 COLUMN 1: Key math diagnostics (4 cols) */}
              <div className="lg:col-span-4 flex flex-col gap-6 w-full">
                
                {/* Net Remaining Money Display */}
                <div className="bg-slate-950/80 border border-white/[0.08] backdrop-blur-3xl p-6 rounded-3xl relative overflow-hidden shadow-xl animate-fade-in" id="net_earnings_card">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none select-none text-white">
                    <Wallet className="w-24 h-24 stroke-1" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Net Residual Capacity</span>
                  <div className="flex items-baseline gap-1 mt-3">
                    <span className={`text-4xl font-extrabold font-display tracking-tight leading-none ${analysis.remainingCapital >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      ${analysis.remainingCapital.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                    <span className="text-slate-500 font-mono text-xs">/ Mo</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-4 font-sans leading-relaxed">
                    {analysis.remainingCapital >= 0 
                      ? "Pristine posture. Your current cash flow creates active resources for wealth preservation. We can map this to compounding accounts."
                      : "Deficit stress warning. Active outflows exceed income. Immediete stabilization required to protect basic solvency and prevent debt cascades."
                    }
                  </p>
                </div>

                {/* Wealth Standard Ratio Diagnostic Indicators (Only visible when unlocked) */}
                {isUnlocked && (
                  <div className="bg-slate-950/80 border border-white/[0.08] backdrop-blur-3xl p-6 rounded-3xl space-y-5">
                    <h3 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-white/[0.06] pb-3 select-none">
                      <Info className="w-4 h-4 text-slate-400" /> Capital Pressure Scores
                    </h3>

                    {/* Housing Rent Index (Standard < 30%) */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-400 font-sans">Shelter Stress Ratio:</span>
                        <span className={`font-mono font-bold ${analysis.housingRatio > 0.3 ? "text-red-400" : "text-emerald-400"}`}>
                          {Math.round(analysis.housingRatio * 100)}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${analysis.housingRatio > 0.3 ? "bg-red-400" : "bg-emerald-500"}`}
                          style={{ width: `${Math.min(100, analysis.housingRatio * 100)}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 font-sans mt-2 leading-normal">
                        Wealth standards recommend housing costs under <strong className="text-slate-400">30%</strong>. Your position is {analysis.housingRatio > 0.3 ? "elevated and locks down key liquid reserves." : "within optimal parameters."}
                      </p>
                    </div>

                    {/* Debt Pressure Ratio (Standard < 15%) */}
                    <div className="pt-2 border-t border-white/[0.04]">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-400 font-sans">Debt Service Burden:</span>
                        <span className={`font-mono font-bold ${analysis.debtPressure > 0.15 ? "text-amber-400" : "text-emerald-400"}`}>
                          {Math.round(analysis.debtPressure * 100)}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${analysis.debtPressure > 0.15 ? "bg-amber-400" : "bg-emerald-500"}`}
                          style={{ width: `${Math.min(100, analysis.debtPressure * 100)}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 font-sans mt-2 leading-normal">
                        Safety guidelines suggest maintaining debt payments under <strong className="text-slate-400">15%</strong>. High rates demand fast compaction scheduling.
                      </p>
                    </div>
                  </div>
                )}

              </div>

              {/* ROW 1 COLUMN 2: Performance metrics and Circle Gauge charts (8 cols) - ALWAYS VISIBLE! */}
              <div className="lg:col-span-8 flex flex-col gap-6 w-full">
                
                {/* Score and Chart Layout panel - Fully visible of stability index rating and ring spending details */}
                <div className="bg-slate-950/80 border border-white/[0.08] backdrop-blur-3xl p-6 rounded-3xl">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Performance metric circle gauges */}
                    <div className="md:col-span-1 flex flex-col justify-between" id="safety_score_card">
                      <div>
                        <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase leading-none block">Stability Index Rating</span>
                        <h3 className="font-sans text-[11px] text-slate-500 mt-1 leading-snug">Overall financial runway solvency rating.</h3>
                      </div>

                      {/* Circular SVG scale meter */}
                      <div className="relative w-28 h-28 my-6 mx-auto flex items-center justify-center">
                        <svg width="100" height="100" className="transform -rotate-90">
                          <circle cx="50" cy="50" r="40" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="7" fill="transparent" />
                          <circle 
                            cx="50" 
                            cy="50" 
                            r="40" 
                            stroke={analysis.safetyScore > 75 ? "#10b981" : analysis.safetyScore > 45 ? "#f59e0b" : "#ef4444"} 
                            strokeWidth="7" 
                            strokeDasharray={`${2.51 * analysis.safetyScore} 251`}
                            strokeLinecap="round"
                            fill="transparent" 
                            className="transition-all duration-1000"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                          <span className="text-3xl font-extrabold text-white font-display leading-none">{analysis.safetyScore}</span>
                          <span className="text-[8px] font-mono text-slate-500 font-semibold tracking-wider mt-1">UNITS</span>
                        </div>
                      </div>

                      <div className="text-center font-mono text-xs text-slate-400">
                        <span className="text-slate-500 text-[10px] uppercase">Solvency: </span>
                        <span className={`font-bold uppercase tracking-wider text-[11px] ${
                          analysis.safetyScore > 75 ? "text-emerald-400" : analysis.safetyScore > 45 ? "text-amber-400" : "text-red-400"
                        }`}>
                          {analysis.riskLevel}
                        </span>
                      </div>
                    </div>

                    {/* Chart and Legend wrapper */}
                    <div className="md:col-span-2 flex flex-col justify-center">
                      <DoughnutChart 
                        housing={parseFloat(inputs.rent) || 0}
                        bills={parseFloat(inputs.bills) || 0}
                        food={parseFloat(inputs.foodLifestyle) || 0}
                        debt={parseFloat(inputs.debtPayments) || 0}
                        subs={parseFloat(inputs.subscriptions) || 0}
                        other={parseFloat(inputs.otherSpending) || 0}
                      />
                    </div>

                  </div>
                </div>

                {/* Free Insights lists from Gemini (Only visible when unlocked) */}
                {isUnlocked && (
                  <div className="bg-slate-950/80 border border-white/[0.08] backdrop-blur-3xl p-6 rounded-3xl">
                    <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 select-none border-b border-white/[0.06] pb-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Analytical Vector Findings
                    </h3>
                    
                    {freeInsights.length === 0 ? (
                      <div className="space-y-3.5">
                        <div className="h-4.5 bg-white/5 rounded w-5/6 animate-pulse" />
                        <div className="h-4.5 bg-white/5 rounded w-full animate-pulse" />
                        <div className="h-4.5 bg-white/5 rounded w-4/5 animate-pulse" />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {freeInsights.map((insight, idx) => {
                          return (
                            <div 
                              key={idx} 
                              className="p-3.5 bg-white/[0.015] border border-white/[0.05] rounded-xl text-xs text-slate-300 leading-relaxed font-sans flex items-start gap-3 transition-colors hover:bg-white/[0.03]"
                            >
                              <span className="px-1.5 py-0.5 mt-0.5 bg-emerald-500/10 text-[9px] font-mono font-bold text-emerald-400 rounded shrink-0 border border-emerald-500/20 uppercase tracking-wider">
                                VAL-{100 + idx}
                              </span>
                              <span className="pt-0.5">{insight}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* INTEGRATED PROFESSIONAL CTA CARD UNDER THE PRIMARY SCORES */}
              {!isUnlocked && (
                <div className="lg:col-span-12 mt-4">
                  <div className="relative w-full rounded-3xl border border-amber-500/20 overflow-hidden bg-gradient-to-b from-[#060c1d]/90 to-[#02050b]/95 p-6 md:p-8 flex flex-col items-center justify-center text-center backdrop-blur-3xl shadow-2xl">
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500/50 via-amber-500/50 to-blue-500/50 animate-pulse" />
                    
                    {/* Floating Locks / Sparks Icons */}
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center mb-5 relative shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                      <Lock className="w-6 h-6 text-amber-400 animate-pulse" />
                    </div>

                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-400 rounded-md text-[10px] font-mono font-bold tracking-widest border border-amber-500/20 uppercase mb-3">
                      Sovereign Cryptographic Node Locked
                    </span>

                    <h3 className="text-xl md:text-2xl font-black text-white font-sans tracking-tight mb-2">
                      Unlock Your Customized Capital Multiplier Blueprint
                    </h3>
                    
                    <p className="text-xs text-slate-400 max-w-xl mx-auto mb-6 leading-relaxed">
                      Your unique financial ratios demand a specialized, algorithmic repayment compaction sequence. Submit your confirmation email and complete the fast gateway audit to unlock your complete SHA-256 decrypted reports and Excel spreadsheet calculators instantly.
                    </p>

                    {/* Highly Professional CTA Button */}
                    <button 
                      type="button"
                      onClick={() => setIsEmailOpen(true)}
                      className="group relative px-8 py-4 bg-gradient-to-r from-emerald-500 via-amber-500 to-emerald-600 hover:from-emerald-600 hover:via-amber-600 hover:to-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center gap-3 border border-white/10 glow-premium"
                    >
                      <Unlock className="w-4.5 h-4.5 text-white/90 animate-bounce" />
                      <span className="font-sans font-black tracking-wide text-xs">
                        Unlock Full Compaction Roadmap & Reports
                      </span>
                      <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </button>

                    {/* Simulated blurred lists of what we get */}
                    <div className="w-full max-w-2xl mt-8 pt-6 border-t border-white/[0.04] grid grid-cols-2 xs:grid-cols-4 gap-4 text-left select-none opacity-40 filter blur-[0.5px]">
                      <div>
                        <span className="block text-[9px] font-mono text-slate-500">FORMAT</span>
                        <span className="text-xs font-bold text-slate-300">PFD & Excel Workbook</span>
                      </div>
                      <div>
                        <span className="block text-[9px] font-mono text-slate-500">DEBT FORMULA</span>
                        <span className="text-xs font-bold text-slate-300 font-mono">Accelerated Compaction</span>
                      </div>
                      <div>
                        <span className="block text-[9px] font-mono text-slate-500">DENSITY RATING</span>
                        <span className="text-xs font-bold text-slate-300">Pristine 98/100</span>
                      </div>
                      <div>
                        <span className="block text-[9px] font-mono text-slate-500">SECURE SIGNATURE</span>
                        <span className="text-xs font-bold text-slate-300 font-mono">SHA-256 Validated</span>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* SECOND BLOCK: Advanced Strategic Premium Content Section (Only shown when unlocked) */}
              {isUnlocked && (
                <div className="lg:col-span-12 mt-4 relative">
                  
                  {/* Main Content card containing unlocked pristine metrics */}
                  <div className="relative w-full rounded-3xl border border-white/[0.08] overflow-hidden bg-slate-950/80 p-6 md:p-8 flex flex-col justify-between backdrop-blur-3xl shadow-2xl">
                    <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-550/30 to-transparent" />

                    {/* Sub Header Badge parameters */}
                    <div className="flex items-center justify-between mb-6 border-b border-white/[0.06] pb-4 select-none">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                          Advisory Allocation Protocols
                        </span>
                      </div>

                      <span className="px-2.5 py-1 text-[10px] font-mono rounded-full font-bold uppercase shrink-0 border bg-emerald-500/10 text-emerald-400 border-emerald-500/25 glow-green">
                        Premium Matrix Unlocked
                      </span>
                    </div>

                    <div className="transition-all duration-700">
                      
                      {/* Premium Section Title */}
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2 text-emerald-400 text-xs font-mono font-bold">
                          <Sparkles className="w-4 h-4 text-emerald-400" /> COMPREHENSIVE WEALTH AMORTIZATION PROTOCOL
                        </div>
                        <h3 className="text-xl md:text-2xl font-black text-white font-display tracking-tight leading-none">
                          Advanced Capital Multiplier Blueprint
                        </h3>
                        <p className="text-xs text-slate-400 mt-1.5">
                          Synthesized corresponding to client's primary stress indicators and net savings levels.
                        </p>
                      </div>

                      {/* Strategy Output rendering blocks */}
                      <div className="bg-white/[0.015] border border-white/[0.05] rounded-2xl p-6 md:p-8 space-y-4 max-w-4xl text-left">
                        {renderMarkdownContent(premiumStrategy)}
                      </div>

                      {/* Action buttons */}
                      <div className="mt-8 flex flex-col sm:flex-row items-center gap-5">
                        <button
                          id="download_blueprint_btn"
                          onClick={downloadBlueprintFile}
                          className="w-full sm:w-auto px-7 py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 text-white font-extrabold font-display text-xs uppercase tracking-wider rounded-xl shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer border border-white/10"
                        >
                          <Download className="w-4 h-4 shrink-0 text-white/90" />
                          <span>Download Wealth Blueprint (TXT)</span>
                        </button>
                        <span className="text-[10px] text-slate-500 font-mono tracking-wider">
                          MD5 HASH SUM: 5937E1B4F2 | SECURE LEDGER PROTOCOL
                        </span>
                      </div>

                    </div>

                  </div>

                </div>
              )}

            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Sleek Minimalist Footer */}
      <footer className="w-full relative border-t border-white/[0.04] bg-[#02050b]/80 backdrop-blur-md pt-8 pb-8 mt-16 select-none">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col gap-1.5 text-center sm:text-left">
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest leading-relaxed">
              © {new Date().getFullYear()} Wealthynx. All Rights Reserved.
            </p>
            <p className="text-[10px] text-slate-600 font-sans leading-normal">
              Educational calculations sandbox. Not financial advisory services.
            </p>
          </div>
          
          <div className="flex items-center gap-3 text-[9px] text-slate-500 font-mono shrink-0 uppercase tracking-widest bg-white/[0.01] border border-white/[0.04] p-2.5 rounded-full px-4">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>SSL SECURED CLIENT NODE</span>
            <span>•</span>
            <span className="text-emerald-400">GATEWAY CONNECTED</span>
          </div>
        </div>
      </footer>

      {/* EMAIL REGISTRATION POPUP MODAL */}
      {isEmailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop screen */}
          <div 
            className="absolute inset-0 bg-[#02050b]/80 backdrop-blur-md" 
            onClick={() => setIsEmailOpen(false)} 
          />
          
          {/* Main Modal container */}
          <div className="relative w-full max-w-md bg-[#040813]/98 border border-amber-500/30 rounded-3xl p-6 sm:p-8 overflow-hidden shadow-2xl flex flex-col z-10 scale-in-center transition-all backdrop-blur-3xl">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 via-amber-500 to-emerald-600" />
            
            {/* Header info */}
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/10 to-emerald-500/10 border border-amber-500/25 flex items-center justify-center relative shadow-lg shadow-amber-500/5">
                  <Mail className="w-5 h-5 text-amber-400" />
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-amber-500/10 text-amber-400 rounded-md text-[9px] font-mono font-bold tracking-wider border border-amber-500/20 uppercase mb-2">
                Identity Profile Binding
              </span>
              <h3 className="text-lg font-black text-white tracking-tight leading-none mt-1">
                Secure Your Wealth Profile
              </h3>
              <p className="text-xs text-slate-400 mt-2 font-sans leading-relaxed">
                Enter your email address to bind your SHA-256 decrypted strategy files before starting verification.
              </p>
            </div>

            {/* Form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!tempEmail.trim() || !tempEmail.includes("@")) {
                  return;
                }

                // Calculate financial metrics for the lead payload
                const totalSpending = (
                  parseFloat(inputs.rent || "0") + 
                  parseFloat(inputs.bills || "0") + 
                  parseFloat(inputs.foodLifestyle || "0") + 
                  parseFloat(inputs.debtPayments || "0") + 
                  parseFloat(inputs.subscriptions || "0") + 
                  parseFloat(inputs.otherSpending || "0")
                );
                const netSurplus = parseFloat(inputs.monthlyIncome || "0") - totalSpending;

                // Create the secure Lead submission object
                const newLead: LeadSubmission = {
                  timestamp: new Date().toISOString(),
                  email: tempEmail,
                  monthlyIncome: inputs.monthlyIncome,
                  rent: inputs.rent,
                  bills: inputs.bills,
                  foodLifestyle: inputs.foodLifestyle,
                  debtPayments: inputs.debtPayments,
                  subscriptions: inputs.subscriptions,
                  otherSpending: inputs.otherSpending,
                  netSurplus: netSurplus.toString()
                };

                // Asynchronously save to Firebase Firestore database to persist securely 
                addLead(newLead)
                  .then(() => {
                    console.log("[FIREBASE] Visitor lead registered successfully with secure DB");
                  })
                  .catch((err) => {
                    console.error("[FIREBASE] Lead secure storage alert:", err);
                  });

                // Save to local React and storage state
                setUserData({ ...userData, email: tempEmail });

                // Switch modals
                setIsEmailOpen(false);
                setIsLockerOpen(true);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Private Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4 text-slate-404" />
                  </div>
                  <input
                    type="email"
                    required
                    value={tempEmail}
                    onChange={(e) => setTempEmail(e.target.value)}
                    placeholder="name@corporation.com"
                    className="w-full bg-[#030712] border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/35 transition-all font-mono animate-none"
                  />
                </div>
                <p className="text-[9px] text-slate-500 mt-2 leading-relaxed">
                  *Your cryptographic report uses point-to-point protection. Your information is never logged publicly.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500 hover:from-emerald-600 hover:to-amber-600 text-white font-black font-sans text-xs uppercase tracking-wider rounded-xl shadow-lg transition-transform active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer border border-white/10"
              >
                <span>Initialize Gateway Decryption</span>
                <ArrowRight className="w-4 h-4 text-white/90" />
              </button>

              {/* Cancel Button */}
              <button
                type="button"
                onClick={() => setIsEmailOpen(false)}
                className="w-full text-center text-[10px] text-slate-500 font-mono hover:text-slate-350 cursor-pointer pt-1"
              >
                [ RETURN TO RESULTS ]
              </button>

            </form>

          </div>
        </div>
      )}

      {/* FLOATING CPA LOCKER OVERLAY MODAL */}
      {isLockerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop screen */}
          <div 
            className="absolute inset-0 bg-[#02050b]/80 backdrop-blur-md" 
            onClick={() => setIsLockerOpen(false)} 
          />
          
          {/* Modal Container */}
          <div className="relative z-10 w-full max-w-2xl">
            <CPALockerModal 
              isOpen={isLockerOpen}
              onClose={() => setIsLockerOpen(false)}
              onUnlockSuccess={() => {
                setIsUnlocked(true);
                setIsLockerOpen(false);
              }}
            />
          </div>
        </div>
      )}

    </div>
  );
}
