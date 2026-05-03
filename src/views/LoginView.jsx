import { useState } from 'react';
import { User, Lock, EyeOff, Eye } from 'lucide-react';

const LoginView = ({ view, setView, onSubmit, loading }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="max-w-md mx-auto bg-[#111111] border border-slate-800 p-8 sm:p-10 rounded-2xl shadow-xl animate-in zoom-in duration-300">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Lock className="text-blue-500" size={24} />
        </div>
        <h2 className="text-2xl font-semibold text-white tracking-tight">{view === 'login' ? 'Welcome back' : 'Create an account'}</h2>
        <p className="text-slate-400 text-sm mt-2 font-medium">Continue to your dashboard</p>
      </div>
      
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-300">Username</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input required name="username" className="w-full bg-[#0A0A0A] border border-slate-800 rounded-lg pl-11 pr-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition text-sm font-medium text-white" placeholder="admin" />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-300">Password</label>
          <div className="relative">
            <input 
              required 
              name="password" 
              type={showPassword ? "text" : "password"} 
              className="w-full bg-[#0A0A0A] border border-slate-800 rounded-lg pl-4 pr-11 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition text-sm font-medium text-white" 
              placeholder="••••••••" 
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <button disabled={loading} className="w-full bg-white text-black py-3 rounded-lg font-semibold text-sm transition hover:bg-slate-200 active:scale-[0.98] disabled:opacity-50 mt-2">
          {loading ? 'Authenticating...' : (view === 'login' ? 'Sign In' : 'Sign Up')}
        </button>
        <div className="text-center mt-6">
           <button type="button" onClick={() => setView(view === 'login' ? 'register' : 'login')} className="text-sm font-medium text-slate-400 hover:text-white transition">
             {view === 'login' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
           </button>
        </div>
      </form>
    </div>
  );
};

export default LoginView;
