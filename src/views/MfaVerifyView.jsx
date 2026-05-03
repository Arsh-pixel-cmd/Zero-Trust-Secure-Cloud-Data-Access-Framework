
import { Key } from 'lucide-react';

const MfaVerifyView = ({ handleVerifyOTP, loading }) => {
  return (
    <div className="max-w-md mx-auto bg-[#111111] border border-slate-800 p-8 sm:p-10 rounded-2xl text-center shadow-xl">
      <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Key className="w-8 h-8 text-blue-500" />
      </div>
      <h2 className="text-2xl font-semibold mb-2 tracking-tight text-white">Two-Factor Auth</h2>
      <p className="text-slate-400 text-sm mb-8 font-medium">Enter the 6-digit code from your authenticator.</p>
      
      <form onSubmit={handleVerifyOTP} className="space-y-8">
        <input 
          required 
          name="otp" 
          maxLength="6" 
          className="w-full text-center text-white text-4xl tracking-[1em] bg-[#0A0A0A] border border-slate-800 rounded-xl px-4 py-6 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-mono placeholder:opacity-20 transition" 
          placeholder="000000" 
        />
        <button disabled={loading} className="w-full bg-white text-black py-3 rounded-lg font-semibold text-sm shadow-sm active:scale-[0.98] transition hover:bg-slate-200 disabled:opacity-50">
          {loading ? 'Verifying...' : 'Confirm'}
        </button>
      </form>
    </div>
  );
};

export default MfaVerifyView;
