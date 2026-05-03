
import { ChevronRight, Shield, Zap, Lock } from 'lucide-react';

const LandingView = ({ setView, user }) => {
  return (
    <div className="relative py-16 lg:py-24 animate-in slide-in-from-bottom duration-700 text-left">
      <div className="relative z-10 max-w-4xl">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium mb-8 shadow-sm">
          <Shield size={14} className="text-blue-500" />
          NIST SP 800-207 Compliant Core
        </div>
        
        <h1 className="text-5xl lg:text-7xl font-semibold mb-6 leading-tight tracking-tight text-white">
          Implicit trust is a <br />
          <span className="text-slate-400">global threat.</span>
        </h1>
        
        <p className="text-slate-400 text-lg lg:text-xl max-w-2xl mb-12 leading-relaxed">
          Deploy an intelligent Zero Trust architecture. We actively verify every access request using real-time telemetry, continuous adaptive risk scoring, and intelligent analysis.
        </p>
        
        <div className="flex flex-wrap items-center gap-4 justify-start mb-20">
          {user ? (
            <button onClick={() => setView('dashboard')} className="px-6 py-3 bg-white text-black hover:bg-slate-200 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2 shadow-sm">
              Return to Dashboard <ChevronRight size={16} />
            </button>
          ) : (
            <>
              <button onClick={() => setView('register')} className="px-6 py-3 bg-white text-black hover:bg-slate-200 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2 shadow-sm">
                Get Started <ChevronRight size={16} />
              </button>
              
              <button onClick={() => setView('login')} className="px-6 py-3 bg-transparent border border-slate-700 hover:border-slate-500 rounded-lg font-medium text-sm transition-colors text-white">
                Access Portal
              </button>
            </>
          )}
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl border-t border-slate-800 pt-12">
          <div className="flex flex-col gap-3 group">
            <div className="w-10 h-10 flex items-center justify-center bg-slate-900 rounded-lg border border-slate-800 text-blue-400">
              <Shield size={20} />
            </div>
            <div>
              <div className="text-white font-medium mb-1">End-to-end Encryption</div>
              <div className="text-slate-500 text-sm">Military-grade AES-256 securing all data in transit.</div>
            </div>
          </div>
          <div className="flex flex-col gap-3 group">
            <div className="w-10 h-10 flex items-center justify-center bg-slate-900 rounded-lg border border-slate-800 text-emerald-400">
              <Zap size={20} />
            </div>
            <div>
              <div className="text-white font-medium mb-1">Ultra-low Latency</div>
              <div className="text-slate-500 text-sm">Edge network ensuring &lt;50ms response times globally.</div>
            </div>
          </div>
          <div className="flex flex-col gap-3 group">
            <div className="w-10 h-10 flex items-center justify-center bg-slate-900 rounded-lg border border-slate-800 text-indigo-400">
              <Lock size={20} />
            </div>
            <div>
              <div className="text-white font-medium mb-1">Strict Authentication</div>
              <div className="text-slate-500 text-sm">Enforced MFA and adaptive TOTP standards by default.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingView;

