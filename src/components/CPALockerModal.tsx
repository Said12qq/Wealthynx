import React, { useEffect, useState, useRef } from "react";
import { ShieldCheck, Loader2, Sparkles, RefreshCw, ArrowUpRight, Lock } from "lucide-react";
import { CPAOffer } from "../types";

// Fallback high-yield offers for pristine presentation
const fallbackOffers: CPAOffer[] = [
  {
    id: "f1",
    name: "Capital Portfolio Allocation Review",
    anchor: "Acknowledge high-yield premium interest parameters below",
    conversion: "Complete brief baseline questionnaire",
    epc: "0.22",
    category_id: "finance",
    url_domain: "wealth-review.com",
    user_payout: "4.50",
    payout: "4.50",
    network_icon: "",
    url: "https://example.com/mock-survey-1"
  },
  {
    id: "f2",
    name: "Standard Assets Risk Profiler",
    anchor: "Authorize risk coefficient calculations securely",
    conversion: "Establish dynamic security workspace profile",
    epc: "0.28",
    category_id: "finance",
    url_domain: "assets-secure.com",
    user_payout: "5.20",
    payout: "5.20",
    network_icon: "",
    url: "https://example.com/mock-survey-2"
  }
];

interface CPALockerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlockSuccess: () => void;
}

export function CPALockerModal({ isOpen, onClose, onUnlockSuccess }: CPALockerModalProps) {
  const [offers, setOffers] = useState<CPAOffer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const [checkingStatus, setCheckingStatus] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(15);
  const [totalChecks, setTotalChecks] = useState<number>(0);

  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadOffers();
      startStatusChecking();
    } else {
      stopChecking();
    }

    return () => {
      stopChecking();
    };
  }, [isOpen]);

  const loadOffers = () => {
    setLoading(true);
    const callbackName = `cpa_feed_cb_${Math.floor(Math.random() * 1000000)}`;

    (window as any)[callbackName] = (data: any) => {
      if (Array.isArray(data)) {
        setOffers(data.slice(0, 3)); // Limit to top 3 offers for cleaner minimal look
      } else {
        setOffers(fallbackOffers);
      }
      setLoading(false);
      cleanup();
    };

    const script = document.createElement("script");
    script.src = `https://d1cdbd1x576ga0.cloudfront.net/public/offers/feed.php?user_id=344483&api_key=8d6662d560e540f662d6149bc92eb31b&callback=${callbackName}`;
    script.async = true;
    script.id = callbackName;
    
    script.onerror = () => {
      setOffers(fallbackOffers);
      setLoading(false);
      cleanup();
    };

    const cleanup = () => {
      try {
        const el = document.getElementById(callbackName);
        if (el) el.remove();
        delete (window as any)[callbackName];
      } catch (e) {}
    };

    document.body.appendChild(script);
  };

  const runLeadCompletionCheck = () => {
    if (checkingStatus) return;
    setCheckingStatus(true);

    const callbackName = `check_lead_cb_${Math.floor(Math.random() * 1000000)}`;

    (window as any)[callbackName] = (data: any) => {
      setCheckingStatus(false);
      setTotalChecks((prev) => prev + 1);
      
      if (Array.isArray(data) && data.length > 0) {
        handleUnlockSuccess();
      }
      cleanup();
    };

    const script = document.createElement("script");
    script.src = `https://d1cdbd1x576ga0.cloudfront.net/public/external/check2.php?testing=0&user_id=344483&api_key=8d6662d560e540f662d6149bc92eb31b&callback=${callbackName}`;
    script.async = true;
    script.id = callbackName;

    script.onerror = () => {
      setCheckingStatus(false);
      cleanup();
    };

    const cleanup = () => {
      try {
        const el = document.getElementById(callbackName);
        if (el) el.remove();
        delete (window as any)[callbackName];
      } catch (e) {}
    };

    document.body.appendChild(script);
  };

  const startStatusChecking = () => {
    stopChecking();
    runLeadCompletionCheck();

    checkIntervalRef.current = setInterval(() => {
      runLeadCompletionCheck();
      setCountdown(15);
    }, 15000);

    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) return 15;
        return prev - 1;
      });
    }, 1000);
  };

  const stopChecking = () => {
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setCheckingStatus(false);
  };

  const handleUnlockSuccess = () => {
    stopChecking();
    onUnlockSuccess();
  };

  if (!isOpen) return null;

  return (
    <div 
      id="premium_verification_panel" 
      className="relative w-full max-w-2xl mx-auto bg-[#040813]/99 border border-amber-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col scale-in-center transition-all p-6 sm:p-8 backdrop-blur-3xl"
    >
      {/* Dynamic diagonal shine accent */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 via-amber-500 to-emerald-600" />
      <div className="absolute top-[-10%] right-[-10%] w-[120px] h-[120px] bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header Info */}
      <div className="pb-6 border-b border-white/[0.04] text-center select-none">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/10 to-emerald-500/10 border border-amber-500/25 flex items-center justify-center relative shadow-lg shadow-amber-500/5">
            <div className="absolute inset-[2px] bg-amber-500/5 rounded-xl animate-pulse" />
            <span className="text-xl">🛡️</span>
          </div>
        </div>
        
        <span className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-amber-500/10 text-amber-400 rounded-md text-[9px] font-mono font-bold tracking-wider border border-amber-500/20 uppercase mb-2">
          Secure Cryptographic File Node
        </span>
        
        <h3 className="text-lg font-black text-white font-sans tracking-tight leading-snug">
          Decrypt Your Custom Strategic Wealth Files
        </h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto mt-2 font-sans leading-relaxed">
          Your personal data stress indexes have been tabulated successfully. Review the generated core metrics below, then verify human identity to unlock the premium spreadsheet downloads.
        </p>
      </div>



      {/* Gateway Status Sync Tracking */}
      <div className="bg-white/[0.015] px-5 py-2.5 border-b border-white/[0.04] flex items-center justify-between text-[10px] font-mono select-none text-slate-500">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-amber-400/80">Awaiting Decryptor Key...</span>
        </div>
        <span>Syncing database in {countdown}s</span>
      </div>

      {/* Interactive Options list of audits/offers */}
      <div className="py-5 space-y-3 flex-grow max-h-[38vh] overflow-y-auto scrollbar-thin">
        <span className="block text-[9px] font-mono font-bold uppercase tracking-widest text-slate-500 mb-1 text-left">
          SELECT ONE ACTIVE PORTALS TO EXECUTE DECRYPTION:
        </span>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
            <p className="text-xs text-slate-500 mt-3 font-mono">Quering secure identity portals...</p>
          </div>
        ) : offers.length === 0 ? (
          <div className="py-8 text-center text-slate-500 font-mono text-xs">
            No active audit routes found for your location. Please check again.
          </div>
        ) : (
          offers.map((offer) => {
            return (
              <a
                key={offer.id}
                href={offer.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center justify-between p-4 bg-white/[0.02] hover:bg-emerald-500/[0.03] border border-white/[0.06] hover:border-amber-500/40 rounded-2xl transition-all duration-300 block hover:scale-[1.01]"
              >
                <div className="flex items-center gap-3.5 overflow-hidden pr-2 text-left">
                  {/* Icon or generic sparkles */}
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] shrink-0 overflow-hidden flex items-center justify-center p-2 relative group-hover:border-amber-500/30">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                  </div>

                  <div className="text-left overflow-hidden">
                    <h4 className="font-bold text-xs text-neutral-100 group-hover:text-amber-300 truncate transition-colors font-sans tracking-tight">
                      {offer.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5 font-sans leading-tight">
                      {offer.anchor.replace(/&nbsp;/g, ' ')}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center pl-2">
                  <span className="px-3 py-1.5 bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-black rounded-lg text-[9px] font-mono font-extrabold tracking-wide transition-all duration-300 flex items-center gap-1 shadow-inner">
                    ACTIVATE <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </a>
            );
          })
        )}
      </div>

      {/* Secure encryption footer */}
      <div className="pt-4 border-t border-white/[0.04] select-none flex flex-col items-center justify-center gap-1 text-center">
        <p className="text-[8px] text-slate-600 font-mono flex items-center justify-center gap-1.5 uppercase tracking-widest">
          <ShieldCheck className="w-3.5 h-3.5 text-zinc-700" /> SECURE ADVOCATE CRYPTOGRAPHY PROTOCOL
        </p>
      </div>

    </div>
  );
}
