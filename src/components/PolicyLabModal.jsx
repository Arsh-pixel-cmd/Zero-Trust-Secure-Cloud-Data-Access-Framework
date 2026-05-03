import { useState } from 'react';
import { Settings, Sparkles } from 'lucide-react';
import { callGemini } from '../services/geminiService';

const PolicyLabModal = ({ onClose, setGeminiLoading }) => {
  const [policyPrompt, setPolicyPrompt] = useState("");
  const [generatedPolicy, setGeneratedPolicy] = useState(null);

  const generatePolicy = async () => {
    setGeminiLoading(true);
    const prompt = `Create a Zero Trust access policy in JSON format based on this requirement: "${policyPrompt}". Include fields like subject, resource, action, conditions (riskScore < 0.5, etc.).`;
    const result = await callGemini(prompt, "You are a security architect. Only return a valid JSON object.");
    if (result) {
      try {
        const cleanedJson = result.replace(/```json|```/g, '');
        setGeneratedPolicy(JSON.parse(cleanedJson));
      } catch {
        setGeneratedPolicy({ error: "Failed to parse JSON", raw: result });
      }
    }
    setGeminiLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-[#111111] border border-slate-800 w-full max-w-2xl rounded-2xl p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-white tracking-tight">
            <Settings size={20} className="text-blue-500" /> Policy Laboratory
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition">×</button>
        </div>
        <p className="text-sm text-slate-400 mb-6 font-medium">Describe your access rule in plain English, and our model will generate a structured policy.</p>
        <div className="space-y-4 mb-6">
          <textarea 
            className="w-full bg-[#0A0A0A] border border-slate-800 rounded-xl p-4 text-sm focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 h-28 text-slate-300 placeholder:text-slate-600 transition"
            placeholder="Example: Allow 'Marketing' users to access 'Social Media Assets' only during 9 AM to 5 PM if risk is below 0.3..."
            value={policyPrompt}
            onChange={(e) => setPolicyPrompt(e.target.value)}
          />
          <button 
            onClick={generatePolicy}
            className="bg-white text-black hover:bg-slate-200 px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 text-sm transition-all active:scale-[0.98]"
          >
            <Sparkles size={16} /> Generate JSON
          </button>
        </div>
        {generatedPolicy && (
          <div className="bg-[#0A0A0A] border border-slate-800 rounded-xl p-6 overflow-x-auto">
            <h4 className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">Output</h4>
            <pre className="text-sm font-mono text-slate-300">
              {JSON.stringify(generatedPolicy, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default PolicyLabModal;
