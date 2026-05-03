
import { Fingerprint } from 'lucide-react';

const MfaSetupView = ({ mfaSecret, setView }) => {
  return (
    <div className="max-w-md mx-auto bg-[#111111] border border-slate-800 p-8 sm:p-10 rounded-2xl shadow-xl text-center">
      <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Fingerprint className="w-8 h-8 text-blue-500" />
      </div>
      <h2 className="text-2xl font-semibold mb-2 text-white tracking-tight">Set up MFA</h2>
      <p className="text-slate-400 text-sm mb-8 font-medium">Scan this QR code with your authenticator app.</p>
      
      <div className="p-4 bg-white rounded-xl inline-block mb-8 shadow-sm">
         <div className="w-40 h-40 bg-slate-100 flex items-center justify-center text-slate-900 font-medium text-sm rounded-lg border border-slate-200">
           [ QR Code ]
         </div>
      </div>
      
      <div className="bg-[#0A0A0A] p-4 rounded-xl border border-slate-800 text-slate-300 font-mono text-sm mb-8 tracking-wider break-all text-center">
        {mfaSecret}
      </div>
      
      <button onClick={() => setView('login')} className="w-full bg-white text-black py-3 rounded-lg font-semibold text-sm transition hover:bg-slate-200 active:scale-[0.98]">
        Verify & Finish
      </button>
    </div>
  );
};

export default MfaSetupView;
