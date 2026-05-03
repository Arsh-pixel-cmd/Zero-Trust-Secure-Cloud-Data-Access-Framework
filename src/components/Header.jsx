
import { Shield, Terminal, MessageSquare, LogOut } from 'lucide-react';

const Header = ({ user, onLogout, onOpenPolicyLab, assistantOpen, onToggleAssistant, setView }) => {
  return (
    <nav className="h-16 border-b border-slate-800 bg-[#0A0A0A]/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition" onClick={() => setView('landing')}>
        <div className="bg-blue-600 p-1.5 rounded-lg">
          <Shield className="text-white w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-sm text-white tracking-tight">ZeroTrust</span>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        {user ? (
          <div className="flex items-center gap-4">
            <button onClick={onOpenPolicyLab} className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium" title="AI Policy Lab">
              <Terminal size={16} /> <span className="hidden sm:inline">Policy Lab</span>
            </button>
            <button onClick={onToggleAssistant} className={`text-slate-400 hover:text-white relative transition-colors flex items-center gap-2 text-sm font-medium ${assistantOpen ? 'text-white' : ''}`} title="AI Security Assistant">
              <MessageSquare size={16} /> <span className="hidden sm:inline">Assistant</span>
              {assistantOpen && <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></span>}
            </button>
            <div className="hidden sm:flex flex-col text-right leading-tight border-l border-slate-800 pl-4 ml-2">
              <span className="text-sm font-medium text-slate-200">{user.username}</span>
              <span className="text-xs text-slate-500">{user.role}</span>
            </div>
            <button onClick={onLogout} className="p-2 ml-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition">
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button onClick={() => setView('login')} className="text-sm font-medium text-slate-300 hover:text-white transition">Sign In</button>
        )}
      </div>
    </nav>
  );
};

export default Header;
