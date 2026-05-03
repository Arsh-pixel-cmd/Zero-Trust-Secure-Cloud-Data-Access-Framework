const apiKey = import.meta.env.VITE_GEMINI_API_KEY || ""; 

export const callGemini = async (prompt, systemPrompt = "", model = "gemini-2.5-flash-preview-09-2025") => {
  let retryCount = 0;
  const maxRetries = 5;
  
  const runQuery = async () => {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] }
        })
      });
      
      if (!response.ok) throw new Error('API Error');
      const result = await response.json();
      return result.candidates?.[0]?.content?.parts?.[0]?.text;
    } catch (err) {
      if (retryCount < maxRetries) {
        retryCount++;
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise(res => setTimeout(res, delay));
        return runQuery();
      }
      throw err;
    }
  };

  try {
    const text = await runQuery();
    return text;
  } catch (err) {
    console.error("Gemini Error:", err);
    return null;
  }
};

export const callGeminiTTS = async (textToSpeak) => {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Say clearly and professionally: ${textToSpeak}` }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Puck" } } }
        }
      })
    });

    const result = await response.json();
    return result.candidates[0].content.parts[0].inlineData.data;
  } catch (err) {
    console.error("TTS Error:", err);
    throw err;
  }
};
