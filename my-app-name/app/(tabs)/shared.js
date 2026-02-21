// ─── shared.js ────────────────────────────────────────────────────────────────
// Shared styles, constants, API helpers, and pet data used by all screens

export const PET_STAGES = [
  { name: "Egg",          emoji: "🥚",      hpRequired: 0,    color: "#a78bfa" },
  { name: "Hatchling",    emoji: "🐣",      hpRequired: 100,  color: "#facc15" },
  { name: "Baby Dragon",  emoji: "🐲",      hpRequired: 300,  color: "#86efac" },
  { name: "Dragon",       emoji: "🐉",      hpRequired: 600,  color: "#ff8906" },
  { name: "Elder Dragon", emoji: "✨🐉✨",   hpRequired: 1000, color: "#f25f4c" },
];

export const getPetStage = (xp) => {
  let stage = PET_STAGES[0];
  for (const s of PET_STAGES) {
    if (xp >= s.hpRequired) stage = s;
  }
  return stage;
};

// ─── API CALLS ────────────────────────────────────────────────────────────────

export const callGemini = async (apiKey, prompt, jsonMode = false) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: jsonMode
        ? { responseMimeType: "application/json", temperature: 0.7 }
        : { temperature: 0.7 },
    }),
  });
  if (!res.ok) throw new Error(`Gemini API error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  // Strip markdown code fences if present (Gemini sometimes wraps JSON)
  return raw.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();
};

export const callElevenLabs = async (apiKey, text, voiceId = "JBFqnCBsd6RMkjVDRZzb") => {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "xi-api-key": apiKey },
    body: JSON.stringify({
      text: text.slice(0, 5000),
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.5, similarity_boost: 0.8 },
    }),
  });
  if (!res.ok) throw new Error(`ElevenLabs API error ${res.status}: ${await res.text()}`);
  return URL.createObjectURL(await res.blob());
};

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────────

export const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Nunito', sans-serif;
    background: #0f0e17;
    color: #fffffe;
    min-height: 100vh;
    overflow-x: hidden;
  }

  :root {
    --bg:      #0f0e17;
    --surface: #1a1829;
    --surface2:#232136;
    --accent:  #ff8906;
    --accent2: #f25f4c;
    --accent3: #e53170;
    --accent4: #3da9fc;
    --accent5: #7c3aed;
    --green:   #22c55e;
    --yellow:  #facc15;
    --text:    #fffffe;
    --muted:   #a7a9be;
    --border:  rgba(255,255,255,0.08);
    --radius:  16px;
  }

  .app-root {
    max-width: 430px; margin: 0 auto;
    min-height: 100vh; position: relative;
    background: var(--bg); overflow: hidden;
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

  @keyframes fadeUp    { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pulse     { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }
  @keyframes wiggle    { 0%,100%{transform:rotate(-3deg)} 50%{transform:rotate(3deg)} }
  @keyframes float     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes spin      { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes soundBar  { 0%,100%{height:4px} 50%{height:20px} }
  @keyframes correctBounce { 0%,100%{transform:scale(1)} 30%{transform:scale(1.15)} 60%{transform:scale(0.95)} }
  @keyframes wrongShake    { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }

  .btn {
    display:inline-flex; align-items:center; justify-content:center; gap:8px;
    padding:12px 24px; border:none; border-radius:12px;
    font-family:'Nunito',sans-serif; font-weight:800; font-size:15px;
    cursor:pointer; transition:all 0.15s ease; user-select:none;
    -webkit-tap-highlight-color:transparent;
  }
  .btn:active  { transform:scale(0.96); }
  .btn-primary { background:var(--accent); color:#0f0e17; }
  .btn-primary:hover { background:#ffaa44; }
  .btn-secondary { background:var(--surface2); color:var(--text); border:1px solid var(--border); }
  .btn-full  { width:100%; }
  .btn-sm    { padding:8px 16px; font-size:13px; border-radius:10px; }
  .btn:disabled { opacity:0.45; cursor:not-allowed; transform:none; }

  .card {
    background:var(--surface); border:1px solid var(--border);
    border-radius:var(--radius); padding:20px;
  }

  .input, .textarea {
    width:100%; background:var(--surface2); border:1px solid var(--border);
    border-radius:12px; color:var(--text); font-family:'Nunito',sans-serif;
    font-size:14px; padding:12px 16px; outline:none; transition:border-color 0.2s;
  }
  .input:focus, .textarea:focus { border-color:var(--accent4); }
  .textarea { resize:vertical; min-height:120px; line-height:1.5; }

  .badge {
    display:inline-flex; align-items:center; gap:4px;
    padding:4px 10px; border-radius:99px; font-size:12px; font-weight:700;
  }
  .badge-orange { background:rgba(255,137,6,0.18);  color:var(--accent); }
  .badge-blue   { background:rgba(61,169,252,0.18);  color:var(--accent4); }
  .badge-green  { background:rgba(34,197,94,0.18);   color:var(--green); }
  .badge-purple { background:rgba(124,58,237,0.18);  color:#a78bfa; }
  .badge-red    { background:rgba(242,95,76,0.18);   color:var(--accent2); }

  .bottom-nav {
    position:fixed; bottom:0; left:50%; transform:translateX(-50%);
    width:100%; max-width:430px;
    background:rgba(26,24,41,0.96); backdrop-filter:blur(20px);
    border-top:1px solid var(--border);
    display:flex; padding:8px 0 20px; z-index:100;
  }
  .nav-item {
    flex:1; display:flex; flex-direction:column; align-items:center; gap:4px;
    cursor:pointer; padding:6px 0; transition:all 0.2s;
    -webkit-tap-highlight-color:transparent;
  }
  .nav-item .nav-icon  { font-size:22px; transition:transform 0.2s; }
  .nav-item .nav-label { font-size:10px; font-weight:700; color:var(--muted); transition:color 0.2s; }
  .nav-item.active .nav-label { color:var(--accent); }
  .nav-item.active .nav-icon  { transform:scale(1.2); }

  .screen-header {
    padding:56px 20px 16px;
    display:flex; align-items:center; justify-content:space-between;
  }
  .screen-title { font-size:26px; font-weight:900; letter-spacing:-0.5px; }

  .loading-spinner {
    width:20px; height:20px;
    border:2px solid rgba(255,255,255,0.2);
    border-top-color:currentColor;
    border-radius:50%;
    animation:spin 0.7s linear infinite;
    flex-shrink:0;
  }

  .hp-bar-track { height:10px; background:var(--surface2); border-radius:99px; overflow:hidden; }
  .hp-bar-fill  {
    height:100%; border-radius:99px;
    background:linear-gradient(90deg,var(--green),#86efac);
    transition:width 0.5s cubic-bezier(0.34,1.56,0.64,1);
  }

  .xp-toast {
    position:fixed; top:60px; right:16px;
    background:var(--green); color:#0f0e17;
    padding:8px 16px; border-radius:99px;
    font-weight:800; font-size:14px;
    animation:fadeUp 0.3s ease, fadeUp 0.3s ease 1.5s reverse forwards;
    z-index:999; pointer-events:none;
  }

  .tabs { display:flex; gap:4px; padding:4px; background:var(--surface2); border-radius:12px; }
  .tab  {
    flex:1; padding:8px 4px; border:none; background:transparent;
    color:var(--muted); font-family:'Nunito',sans-serif; font-weight:700;
    font-size:13px; border-radius:10px; cursor:pointer; transition:all 0.2s;
  }
  .tab.active { background:var(--accent); color:#0f0e17; }

  .sound-wave { display:flex; align-items:center; gap:3px; height:24px; }
  .sound-bar  {
    width:3px; background:var(--accent); border-radius:2px;
    animation:soundBar 0.8s ease-in-out infinite;
  }
  .sound-bar:nth-child(2) { animation-delay:0.1s; }
  .sound-bar:nth-child(3) { animation-delay:0.2s; }
  .sound-bar:nth-child(4) { animation-delay:0.3s; }
  .sound-bar:nth-child(5) { animation-delay:0.15s; }

  .drop-zone {
    border:2px dashed var(--border); border-radius:16px;
    padding:32px 20px; text-align:center; cursor:pointer; transition:all 0.2s;
  }
  .drop-zone:hover, .drop-zone.drag-over {
    border-color:var(--accent4); background:rgba(61,169,252,0.06);
  }

  .screen { padding:0 0 90px; animation:fadeUp 0.3s ease; }
`;
