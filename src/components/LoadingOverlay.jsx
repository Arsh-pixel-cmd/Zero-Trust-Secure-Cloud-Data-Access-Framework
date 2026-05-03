
import { Sparkles } from 'lucide-react';

const LoadingOverlay = () => (
  <div className="fixed bottom-8 right-8 bg-[#111111] border border-slate-800 text-white px-5 py-3 rounded-full shadow-lg flex items-center gap-3 z-[200]">
    <Sparkles className="animate-spin text-blue-500" size={18} />
    <span className="text-xs font-medium tracking-wide">Processing...</span>
  </div>
);

export default LoadingOverlay;
