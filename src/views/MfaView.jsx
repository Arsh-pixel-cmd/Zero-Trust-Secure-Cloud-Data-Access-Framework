import { useState } from 'react';
import { Key } from 'lucide-react';

const MfaView = ({ onVerify }) => {
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState('');

  const handleVerifyMfa = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { 
      onVerify();
      setLoading(false);
    }, 800);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl text-center">
      <Key className="mx-auto text-amber-500 mb-4" size={40} />
      <h2 className="text-xl font-bold mb-4">Stage 2: MFA</h2>
      <input 
        type="text" 
        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-4 text-center text-3xl font-mono tracking-[0.5em]" 
        placeholder="000000" 
        maxLength="6" 
        value={otp}
        onChange={(e) => setOtp(e.target.value)} 
      />
      <button 
        onClick={handleVerifyMfa} 
        disabled={loading || otp.length < 6}
        className="w-full bg-amber-600 hover:bg-amber-500 mt-6 py-3 rounded-lg font-bold disabled:opacity-50"
      >
        {loading ? 'Verifying...' : 'Establish Session'}
      </button>
    </div>
  );
};

export default MfaView;
