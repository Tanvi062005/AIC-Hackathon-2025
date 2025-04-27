// api/roast.js

const FALLBACKS = [
    { roast: "Your canvas looks so empty I heard crickets.", tip: "Add more elements or whitespace won’t save you." },
    { roast: "Fonts wandering all over the place—did you lose your guide?", tip: "Stick to two fonts and use hierarchy." },
    { roast: "That color combo is giving Monday morning coffee stain.", tip: "Pick a fresh accent color and unify the palette." }
  ];
  
  function randomFallback() {
    return FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)];
  }
  
  export default async function handler(req, res) {
    // --- CORS (must be first) ---
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    // ------------------------------
  
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
  
    const { elements } = req.body;
    if (!Array.isArray(elements)) {
      return res.status(400).json({ error: "'elements' must be an array" });
    }
  
    const desc = elements.map(e => e.type).join(', ');
    const HF_TOKEN = process.env.HF_API_TOKEN;
    if (!HF_TOKEN) {
      return res.status(500).json({ error: 'HF_API_TOKEN is not defined' });
    }
  
    try {
      // 1) Roast
      const roastPrompt = `
  You are a savage design critic.
  The canvas contains: ${desc}.
  Provide ONE sharp, humorous roast of this design—no extra commentary.
      `.trim();
      const roastRes = await fetch(
        'https://api-inference.huggingface.co/models/declare-lab/flan-alpaca-large',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HF_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            inputs: roastPrompt,
            parameters: { max_new_tokens: 50, temperature: 0.8 }
          })
        }
      );
      const roastData = await roastRes.json();
      const roastText = (roastData[0]?.generated_text || '').trim();
  
      // 2) Tip
      const tipPrompt = `
  You are a constructive design advisor.
  The canvas contains: ${desc}.
  Provide ONE clear, actionable design tip to improve it—no extra commentary.
      `.trim();
      const tipRes = await fetch(
        'https://api-inference.huggingface.co/models/declare-lab/flan-alpaca-large',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HF_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            inputs: tipPrompt,
            parameters: { max_new_tokens: 50, temperature: 0.8 }
          })
        }
      );
      const tipData = await tipRes.json();
      const tipText = (tipData[0]?.generated_text || '').trim();
  
      if (!roastText || !tipText) {
        throw new Error('Empty AI response');
      }
  
      return res.status(200).json({ roast: roastText, tip: tipText });
  
    } catch (err) {
      console.error('AI or parsing error:', err);
      const fb = randomFallback();
      return res.status(200).json({ roast: fb.roast, tip: fb.tip });
    }
  }
  