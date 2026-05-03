import { useState } from 'react';
import { Sparkles, Send } from 'lucide-react';
import { callGemini } from '../services/geminiService';

const AssistantPanel = ({ onClose, riskScore }) => {
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', text: 'Hello! I am your security assistant. How can I help you today?' }
  ]);
  const [userInput, setUserInput] = useState("");

  const handleAssistantChat = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const newMessage = { role: 'user', text: userInput };
    setChatMessages([...chatMessages, newMessage]);
    setUserInput("");

    const prompt = `User asks: ${userInput}\nContext: User is logged in with risk score ${riskScore}. System: ZT-Cloud Core.`;
    const response = await callGemini(prompt, "You are a Zero Trust Security Assistant. Be helpful, concise, and prioritize security best practices.");
    
    if (response) {
      setChatMessages(prev => [...prev, { role: 'ai', text: response }]);
    }
  };

  return (
    <div className="fixed right-6 bottom-24 w-80 bg-[#111111] border border-slate-800 rounded-2xl shadow-2xl z-[60] flex flex-col h-[450px] animate-in slide-in-from-right-8">
      <div className="px-4 py-3 border-b border-slate-800 flex justify-between items-center bg-[#0A0A0A] rounded-t-2xl">
        <h4 className="font-semibold text-sm text-white flex items-center gap-2"><Sparkles size={14} className="text-blue-500" /> Assistant</h4>
        <button onClick={onClose} className="text-slate-500 hover:text-white transition">×</button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
        {chatMessages.map((m, i) => (
          <div key={i} className={`p-3 rounded-xl max-w-[90%] ${m.role === 'ai' ? 'bg-[#0A0A0A] text-slate-300 border border-slate-800 self-start' : 'bg-white text-black self-end ml-auto'}`}>
            {m.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleAssistantChat} className="p-3 border-t border-slate-800 flex gap-2 bg-[#0A0A0A] rounded-b-2xl">
        <input 
          type="text" 
          className="flex-1 bg-transparent border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-500 text-white placeholder:text-slate-500" 
          placeholder="Ask a question..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />
        <button type="submit" className="bg-white text-black p-2 rounded-lg hover:bg-slate-200 transition"><Send size={16} /></button>
      </form>
    </div>
  );
};

export default AssistantPanel;
