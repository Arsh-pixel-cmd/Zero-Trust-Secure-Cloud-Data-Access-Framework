
import { Activity } from 'lucide-react';

const RiskBadge = ({ score }) => (
  <div className={`flex items-center gap-2 font-mono text-sm ${score > 0.6 ? 'text-red-500' : score > 0.3 ? 'text-yellow-500' : 'text-emerald-500'}`}>
    <Activity size={16} />
    <span>{score > 0.6 ? 'High Risk' : score > 0.3 ? 'Suspicious' : 'Low Risk'} ({score.toFixed(2)})</span>
  </div>
);

export default RiskBadge;
