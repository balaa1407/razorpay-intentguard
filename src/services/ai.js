export const extractLiveIntent = async (promptText, apiKey) => {
  if (!apiKey) throw new Error("API Key is required");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;
  
  const systemInstruction = `You are a strict JSON extraction engine for an AI Agentic Payment Risk Manager.
Given a user's natural language shopping instruction, extract the intent into a JSON object with EXACTLY these keys:
- "category" (string: the core product)
- "max_price" (number: the maximum budget allowed, if none infer a reasonable high number or null)
- "ram_min" (number: if specified, minimum RAM in GB, else null)
- "seller_requirement" (string: e.g. "trusted", "any", "official")
- "authorization" (string: usually "purchase")
Respond ONLY with raw, valid JSON. No markdown backticks.`;

  const payload = {
    contents: [
      { role: "user", parts: [{ text: promptText }] }
    ],
    systemInstruction: { parts: [{ text: systemInstruction }] },
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json"
    }
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  const data = await response.json();
  try {
    const jsonStr = data.candidates[0].content.parts[0].text;
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to parse Gemini response:", e);
    throw new Error("Failed to parse intent");
  }
};

export const generateRiskExplanation = async (intent, transaction, riskSignals, riskLevel, apiKey) => {
  if (!apiKey) return "API Key missing. Cannot generate explanation.";

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;
  
  const systemInstruction = `You are the Risk Explainability Engine for IntentGuard.
Your job is to read the Original Intent, the Agent's Attempted Transaction, and the Risk Signals, and write a clear, concise 2-sentence explanation of WHY this transaction was flagged as ${riskLevel} risk.
Do NOT output JSON. Write human-readable text. Focus on the discrepancies (Intent Drift).`;

  const promptText = `
ORIGINAL INTENT: ${JSON.stringify(intent)}
ATTEMPTED TRANSACTION: ${JSON.stringify(transaction)}
DETECTED RISK SIGNALS: ${JSON.stringify(riskSignals)}

Provide the explanation for the human reviewer.`;

  const payload = {
    contents: [
      { role: "user", parts: [{ text: promptText }] }
    ],
    systemInstruction: { parts: [{ text: systemInstruction }] },
    generationConfig: {
      temperature: 0.3
    }
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error("API Error");

    const data = await response.json();
    return data.candidates[0].content.parts[0].text.trim();
  } catch (e) {
    console.error("Failed to generate explanation:", e);
    return "Error connecting to AI Explainability Engine.";
  }
};
