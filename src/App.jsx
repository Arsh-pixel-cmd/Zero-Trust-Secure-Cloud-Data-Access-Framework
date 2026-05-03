import { useState, useEffect, useMemo, useCallback } from 'react';
import { ShieldAlert } from 'lucide-react';
import Header from './components/Header';
import Footer from './components/Footer';
import AssistantPanel from './components/AssistantPanel';
import PolicyLabModal from './components/PolicyLabModal';
import LoadingOverlay from './components/LoadingOverlay';
import RiskPanel from './components/RiskPanel';
import LandingView from './views/LandingView';
import LoginView from './views/LoginView';
import MfaSetupView from './views/MfaSetupView';
import MfaVerifyView from './views/MfaVerifyView';
import DashboardView from './views/DashboardView';

const App = () => {
  // --- View & Navigation State ---
  const [view, setView] = useState('landing'); 
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [logs, setLogs] = useState([]);
  
  // --- Identity & Session State ---
  const [user, setUser] = useState(null);
  const [tempUser, setTempUser] = useState(null); 
  const [token, setToken] = useState(null);
  const [mfaSecret, setMfaSecret] = useState(null);

  // --- Modals & Overlays ---
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [policyLabOpen, setPolicyLabOpen] = useState(false);

  // --- Dynamic Risk Scoring Factors ---
  const [riskFactors, setRiskFactors] = useState({
    badIp: false,        // 0.30
    newLocation: false,  // 0.25
    unknownDevice: false,// 0.20
    oddHour: false,      // 0.15
    highFrequency: false // 0.10
  });

  const RISK_THRESHOLD_BLOCK = 0.70;
  const RISK_THRESHOLD_REAUTH = 0.40;

  // --- Telemetry Logging Utility ---
  const addLog = useCallback((msg, type = 'info') => {
    setLogs(prev => [{ 
      id: Math.random(), 
      msg, 
      type, 
      time: new Date().toLocaleTimeString() 
    }, ...prev].slice(0, 40));
  }, []);

  const notify = useCallback((msg, type = 'error') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  // --- RISK SCORING ENGINE ---
  const riskScore = useMemo(() => {
    let R = 0;
    if (riskFactors.badIp) R += 0.30;
    if (riskFactors.newLocation) R += 0.25;
    if (riskFactors.unknownDevice) R += 0.20;
    if (riskFactors.oddHour) R += 0.15;
    if (riskFactors.highFrequency) R += 0.10;
    return parseFloat(R.toFixed(2));
  }, [riskFactors]);

  const handleLogout = useCallback(async () => {
    if (token) {
      try {
        await fetch('http://localhost:5001/api/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (err) {
        console.error("Logout error", err);
      }
    }
    setUser(null);
    setToken(null);
    setView('landing');
    addLog("Session invalidated. Token ID moved to Redis blocklist.", "info");
  }, [token, addLog]);

  // --- CONTINUOUS FEEDBACK LOOP ---
  useEffect(() => {
    if (user && riskScore >= RISK_THRESHOLD_BLOCK) {
      setTimeout(() => {
        addLog(`CRITICAL: PEP detected Risk Index ${riskScore}. Policy requires session termination.`, 'error');
        notify("CRITICAL ALERT: Implicit trust revoked due to environmental anomaly.", "error");
        handleLogout();
      }, 0);
    } else if (user && riskScore >= RISK_THRESHOLD_REAUTH) {
      setTimeout(() => {
        addLog(`ADAPTIVE: Monitoring frequency increased for node ${user.username}. Score: ${riskScore}`, 'warning');
      }, 0);
    }
  }, [riskScore, user, addLog, handleLogout, notify]);

  // --- ACCESS PIPELINE HANDLERS ---
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const username = e.target.username.value;
    const password = e.target.password?.value || 'password123'; // fallback if password field missing
    
    try {
      if (view === 'register') {
        const res = await fetch('http://localhost:5001/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        
        if (res.ok) {
          setMfaSecret(data.secret);
          setTempUser({ username, temp_token: data.temp_token, role: data.user.role });
          addLog(`Stage 1: Identity enrollment context initialized for ${username}.`, 'success');
          setView('mfa-setup');
        } else {
          notify(data.error || "Registration failed");
          addLog(`Registration error: ${data.error}`, 'error');
        }
      } else {
        const res = await fetch('http://localhost:5001/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        
        if (res.ok) {
          if (data.require_mfa) {
            setTempUser({ username, temp_token: data.temp_token });
            addLog(`Stage 1: Primary credentials verified for node ${username}.`, 'info');
            setView('mfa-verify');
          } else {
            setToken(data.token);
            setUser(data.user);
            addLog(`Stage 7: Access granted. Trust established.`, 'success');
            setView('dashboard');
          }
        } else {
          notify(data.error || "Login failed");
          addLog(`Login error: ${data.error}`, 'error');
        }
      }
    } catch (err) {
      notify("Failed to connect to backend");
      addLog(`Connection error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otp = e.target.otp.value;

    if (otp.length !== 6) {
      notify("OTP must be 6 numeric digits.");
      return;
    }

    setLoading(true);
    
    if (riskScore >= RISK_THRESHOLD_BLOCK) {
      addLog(`Stage 3 REJECTION: Risk Index ${riskScore} exceeds PEP block policy.`, 'error');
      notify("ACCESS DENIED: High Behavioral Risk Detected.", "error");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:5001/api/auth/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ temp_token: tempUser?.temp_token, code: otp })
      });
      const data = await res.json();

      if (res.ok) {
        setToken(data.token);
        setUser(data.user);
        setTempUser(null);
        addLog(`Stage 7: Access granted to protected data layer. Trust established.`, 'success');
        setView('dashboard');
      } else {
        notify(data.error || "MFA verification failed");
        addLog(`MFA error: ${data.error}`, 'error');
      }
    } catch (err) {
      notify("Failed to connect to backend");
      addLog(`Connection error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-slate-300 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      <Header 
        user={user} 
        onLogout={handleLogout} 
        onOpenPolicyLab={() => setPolicyLabOpen(true)} 
        onToggleAssistant={() => setAssistantOpen(!assistantOpen)} 
        assistantOpen={assistantOpen}
        setView={setView}
      />

      {/* Security Toast Notifications */}
      {notification && (
        <div className={`fixed top-20 right-8 p-4 rounded-2xl border-2 z-50 animate-in slide-in-from-right shadow-2xl backdrop-blur-xl ${
          notification.type === 'error' ? 'bg-red-950/40 border-red-500/50 text-red-100' : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-100'
        }`}>
          <div className="flex items-center gap-3">
            <ShieldAlert size={20} className={notification.type === 'error' ? 'animate-pulse' : ''} />
            <span className="text-sm font-black uppercase tracking-tight">{notification.msg}</span>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* CENTER INTERACTION PANEL (LHS) */}
        <div className="lg:col-span-8 space-y-8 relative">
          {assistantOpen && (
            <AssistantPanel 
              onClose={() => setAssistantOpen(false)} 
              riskScore={riskScore}
            />
          )}

          {view === 'landing' && <LandingView setView={setView} />}
          {(view === 'login' || view === 'register') && (
            <LoginView view={view} setView={setView} onSubmit={handleAuthSubmit} loading={loading} />
          )}
          {view === 'mfa-setup' && <MfaSetupView mfaSecret={mfaSecret} setView={setView} />}
          {view === 'mfa-verify' && <MfaVerifyView handleVerifyOTP={handleVerifyOTP} loading={loading} />}
          {view === 'dashboard' && user && (
            <DashboardView user={user} token={token} riskScore={riskScore} />
          )}
        </div>

        {/* RISK & TELEMETRY ENGINE (RHS) */}
        <div className="lg:col-span-4">
          <RiskPanel 
            riskFactors={riskFactors} 
            setRiskFactors={setRiskFactors} 
            riskScore={riskScore} 
            logs={logs} 
            RISK_THRESHOLD_BLOCK={RISK_THRESHOLD_BLOCK} 
            RISK_THRESHOLD_REAUTH={RISK_THRESHOLD_REAUTH}
            setGeminiLoading={setGeminiLoading}
          />
        </div>
      </main>

      {policyLabOpen && (
        <PolicyLabModal 
          onClose={() => setPolicyLabOpen(false)} 
          setGeminiLoading={setGeminiLoading}
        />
      )}

      {geminiLoading && <LoadingOverlay />}

      <Footer />
      
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoom-in { from { transform: scale(0.97); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-in { animation-fill-mode: forwards; }
      `}</style>
    </div>
  );
};

export default App;
