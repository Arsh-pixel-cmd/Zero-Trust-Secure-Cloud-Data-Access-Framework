import { useState } from 'react';
import { BarChart3, Terminal, Globe, Activity, Smartphone, Clock, Zap, Sparkles, Volume2 } from 'lucide-react';
import { callGemini, callGeminiTTS } from '../services/geminiService';
import { playAudio } from '../utils/audioPlayer';

const RiskToggle = ({ id, label, icon: Icon, weight, riskFactors, setRiskFactors }) => (
  <div className="flex items-center justify-between p-3 rounded-xl bg-[#0A0A0A] border border-slate-800 hover:border-slate-700 transition">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg transition-all ${riskFactors[id] ? 'bg-orange-500/10 text-orange-500' : 'bg-slate-900 text-slate-500'}`}>
        <Icon size={16} />
      </div>
      <div className="text-left">
        <div className="text-sm font-medium text-slate-200">{label}</div>
        <div className="text-xs text-slate-500">Weight: {weight}</div>
      </div>
    </div>
    <button 
      onClick={() => setRiskFactors(prev => ({...prev, [id]: !prev[id]}))}
      className={`w-10 h-6 rounded-full relative transition-all duration-300 ${riskFactors[id] ? 'bg-orange-500' : 'bg-slate-700'}`}
    >
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${riskFactors[id] ? 'left-5' : 'left-1'}`} />
    </button>
  </div>
);

const RiskPanel = ({ riskFactors, setRiskFactors, riskScore, logs, RISK_THRESHOLD_BLOCK, RISK_THRESHOLD_REAUTH, setGeminiLoading }) => {
  const [aiInsights, setAiInsights] = useState(null);
  const [aiReport, setAiReport] = useState(null);

  const analyzeRisk = async () => {
    setGeminiLoading(true);
    const context = { score: riskScore, factors: riskFactors, time: new Date().toLocaleTimeString() };
    const result = await callGemini(`Analyze: ${JSON.stringify(context)}. Explain risk score ${riskScore} and give 3 steps.`, "You are a Zero Trust Analyst.");
    if (result) setAiInsights(result);
    setGeminiLoading(false);
  };

  const summarizeAudit = async () => {
    setGeminiLoading(true);
    const logMessages = logs.map(l => l.msg);
    const result = await callGemini(`Summarize logs: ${logMessages.join(", ")}`, "Summarize in 2 sentences.");
    if (result) setAiReport(result);
    setGeminiLoading(false);
  };

  const handleListen = async () => {
    if (!aiReport) return;
    setGeminiLoading(true);
    try {
      const audioData = await callGeminiTTS(aiReport);
      playAudio(audioData);
    } catch (err) {
      console.error(err);
    } finally {
      setGeminiLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* DRSE Panel */}
      <div className="bg-[#111111] border border-slate-800 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-white">
            <BarChart3 className="text-orange-500" size={20} />
            Risk Factors
          </h3>
          <div className="flex items-center gap-3">
            <button onClick={analyzeRisk} className="text-xs text-blue-400 font-medium hover:text-blue-300 flex items-center gap-1">
              <Sparkles size={12} /> Analyze
            </button>
            <div className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              riskScore >= RISK_THRESHOLD_BLOCK ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 
              riskScore >= RISK_THRESHOLD_REAUTH ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 
              'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
            }`}>
              {riskScore >= RISK_THRESHOLD_BLOCK ? 'Blocked' : 
               riskScore >= RISK_THRESHOLD_REAUTH ? 'Re-Auth' : 'Allowed'}
            </div>
          </div>
        </div>
        
        {aiInsights && (
          <div className="mb-6 p-4 bg-blue-900/20 border border-blue-500/20 rounded-xl text-sm text-slate-300 leading-relaxed">
            {aiInsights}
          </div>
        )}
        
        <div className="space-y-3">
          <RiskToggle id="badIp" label="Blacklisted IP Address" weight="+0.30" icon={Globe} riskFactors={riskFactors} setRiskFactors={setRiskFactors} />
          <RiskToggle id="newLocation" label="Impossible Travel Anomaly" weight="+0.25" icon={Activity} riskFactors={riskFactors} setRiskFactors={setRiskFactors} />
          <RiskToggle id="unknownDevice" label="Unregistered Hardware ID" weight="+0.20" icon={Smartphone} riskFactors={riskFactors} setRiskFactors={setRiskFactors} />
          <RiskToggle id="oddHour" label="Off-Hours Access Request" weight="+0.15" icon={Clock} riskFactors={riskFactors} setRiskFactors={setRiskFactors} />
          <RiskToggle id="highFrequency" label="Freq. Spike Detection" weight="+0.10" icon={Zap} riskFactors={riskFactors} setRiskFactors={setRiskFactors} />
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800">
          <div className="flex justify-between items-end mb-3">
            <span className="text-sm font-medium text-slate-400">Total Risk Score</span>
            <span className={`text-4xl font-semibold tracking-tight transition-colors ${
              riskScore >= RISK_THRESHOLD_BLOCK ? 'text-red-500' : 
              riskScore >= RISK_THRESHOLD_REAUTH ? 'text-orange-500' : 'text-emerald-500'
            }`}>
              {riskScore.toFixed(2)}
            </span>
          </div>
          <div className="w-full bg-[#0A0A0A] h-2 rounded-full overflow-hidden border border-slate-800">
            <div 
              className={`h-full transition-all duration-700 ease-out rounded-full ${
                riskScore >= RISK_THRESHOLD_BLOCK ? 'bg-red-500' : 
                riskScore >= RISK_THRESHOLD_REAUTH ? 'bg-orange-500' : 
                'bg-emerald-500'
              }`}
              style={{ width: `${riskScore * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Policy Audit Logs */}
      <div className="bg-[#111111] border border-slate-800 rounded-2xl p-6 h-[400px] flex flex-col shadow-sm">
        
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-white">
            <Terminal className="text-slate-400" size={20} /> Audit Trail
          </h3>
          <div className="flex gap-2">
            <button onClick={summarizeAudit} className="text-xs bg-[#0A0A0A] border border-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-800 hover:border-slate-600 flex items-center gap-1.5 font-medium transition-all text-slate-300">
              <Sparkles size={12} className="text-blue-400" /> Summarize
            </button>
            {aiReport && (
              <button onClick={handleListen} className="text-xs bg-white text-black px-3 py-1.5 rounded-lg hover:bg-slate-200 flex items-center gap-1.5 font-medium transition-all">
                <Volume2 size={12} /> Listen
              </button>
            )}
          </div>
        </div>

        {aiReport && (
          <div className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl relative overflow-hidden">
            <div className="flex items-start gap-3 relative z-10">
              <Sparkles className="text-emerald-500 shrink-0 mt-0.5" size={16} />
              <div className="text-sm text-slate-300 leading-relaxed font-medium">
                <span className="text-emerald-500 block mb-1 text-xs font-semibold">AI Summary</span>
                {aiReport}
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-hide">
          {logs.map(log => (
            <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-[#0A0A0A] border border-slate-800 hover:bg-slate-900 transition-colors">
              <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                log.type === 'success' ? 'bg-emerald-500' : 
                log.type === 'error' ? 'bg-red-500' : 
                log.type === 'warning' ? 'bg-orange-500' : 
                'bg-blue-500'
              }`} />
              <div className="flex flex-col w-full">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-slate-500">{log.time}</span>
                  <span className="text-[10px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">SYS_LOG</span>
                </div>
                <p className={`text-xs leading-relaxed ${
                  log.type === 'success' ? 'text-emerald-400' : 
                  log.type === 'error' ? 'text-red-400 font-medium' : 
                  log.type === 'warning' ? 'text-orange-400' : 'text-slate-300'
                }`}>
                  {log.msg}
                </p>
              </div>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center opacity-50 py-8">
              <Activity className="text-slate-500 mb-3" size={24} />
              <div className="text-xs text-slate-400 font-medium">No activity recorded</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiskPanel;
