import { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Database, UserCheck, Cpu, RefreshCw, Terminal, Binary, Sparkles } from 'lucide-react';
import { callGemini } from '../services/geminiService';

const DashboardView = ({ user, token, riskScore }) => {
  const [securityTip, setSecurityTip] = useState("");

  useEffect(() => {
    const generateSecurityTip = async () => {
      const tip = await callGemini("Generate a unique, one-sentence Zero Trust security tip for a cloud engineer.", "You are a cybersecurity expert.");
      if (tip) setSecurityTip(tip);
    };
    generateSecurityTip();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* Security Tip Banner */}
      {securityTip && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-start gap-3">
          <Sparkles size={18} className="text-blue-400 shrink-0 mt-0.5" />
          <p className="text-sm text-slate-300 leading-relaxed">
            <strong className="text-white font-medium">Tip of the Day:</strong> {securityTip}
          </p>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-2 font-medium flex items-center gap-2">
            Session: <span className="font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">RS256-JWT</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-lg border text-sm font-medium flex items-center gap-2 ${
            riskScore < 0.4 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
          }`}>
            <Activity size={16} /> Risk Score: {riskScore}
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-medium text-sm">
            <ShieldCheck size={18} />
            <span>Secured</span>
          </div>
        </div>
      </div>

      {/* Data Decryption Layers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#111111] border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <Database className="text-blue-500" size={24} />
          </div>
          <div className="text-sm text-slate-500 font-medium mb-1">Storage Layer</div>
          <div className="text-xl font-semibold text-white">Encrypted</div>
          <div className="mt-4 flex items-center gap-2 text-xs text-emerald-500 font-medium">
            <RefreshCw size={12} className="animate-spin" /> Verifying
          </div>
        </div>
        <div className="bg-[#111111] border border-slate-800 p-6 rounded-2xl shadow-sm hover:border-slate-700 transition">
          <UserCheck className="text-indigo-500 mb-4" size={24} />
          <div className="text-sm text-slate-500 font-medium mb-1">Access Control</div>
          <div className="text-xl font-semibold text-white">{user.role}</div>
          <div className="mt-4 text-xs text-slate-500 font-medium">RBAC Enforced</div>
        </div>
        <div className="bg-[#111111] border border-slate-800 p-6 rounded-2xl shadow-sm hover:border-slate-700 transition">
          <Cpu className="text-orange-500 mb-4" size={24} />
          <div className="text-sm text-slate-500 font-medium mb-1">Network Latency</div>
          <div className="text-xl font-semibold text-white">42ms</div>
          <div className="mt-4 text-xs text-slate-500 font-medium">Edge optimized</div>
        </div>
      </div>

      {/* Secure Pipeline Artifacts */}
      <div className="bg-[#111111] border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <h3 className="font-medium text-sm text-white flex items-center gap-2">
            <Terminal size={16} className="text-blue-500" /> Audit Log
          </h3>
          <Binary size={16} className="text-slate-600" />
        </div>
        <div className="p-6 space-y-6">
           <div className="space-y-3">
              <div className="text-xs font-medium text-slate-500">Active Token</div>
              <div className="p-4 bg-[#0A0A0A] rounded-xl border border-slate-800 font-mono text-xs text-slate-400 break-all">
                {token}
              </div>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-5 bg-[#0A0A0A] rounded-xl border border-slate-800">
                <div className="text-xs text-slate-500 font-medium mb-1">Authentication</div>
                <div className="text-sm font-medium text-slate-200">TOTP (RFC 6238) Verified</div>
              </div>
              <div className="p-5 bg-[#0A0A0A] rounded-xl border border-slate-800">
                <div className="text-xs text-slate-500 font-medium mb-1">Monitoring</div>
                <div className="text-sm font-medium text-slate-200">Continuous Evaluation</div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
