import React, { useState, useRef, useCallback } from "react";

const SAMPLE_CODE = `public class Factorial {
    public static int compute(int n) {
        if (n <= 1) {
            return 1;
        }
        return n * compute(n - 1);
    }

    public static void main(String[] args) {
        int result = compute(5);
        System.out.println(result);
    }
}`;

const OUTPUT_LANGS = [
  { id: "hinglish", label: "Hinglish" },
  { id: "hindi", label: "हिंदी" },
  { id: "english", label: "English" },
];

const LEVELS = {
  hinglish: [
    { id: "beginner", label: "Beginner", desc: "har keyword bhi samjhao" },
    { id: "intermediate", label: "Intermediate", desc: "line-by-line, kam basics" },
    { id: "advanced", label: "Advanced", desc: "sirf logic, architecture, risks" },
  ],
  hindi: [
    { id: "beginner", label: "शुरुआती", desc: "हर keyword भी समझाओ" },
    { id: "intermediate", label: "मध्यम", desc: "लाइन-दर-लाइन, कम basics" },
    { id: "advanced", label: "उन्नत", desc: "सिर्फ logic, architecture, risks" },
  ],
  english: [
    { id: "beginner", label: "Beginner", desc: "explain every keyword too" },
    { id: "intermediate", label: "Intermediate", desc: "line-by-line, fewer basics" },
    { id: "advanced", label: "Advanced", desc: "just logic, architecture, risks" },
  ],
};

const UI = {
  hinglish: {
    eyebrow: "✎ apna personal code-teacher",
    titleA: "Code ", titleB: "Guru",
    sub: "Koi bhi code, script ya hardware/firmware snippet paste karo. Guru line-by-line, keyword-by-keyword, risks, dependencies aur simulated execution trace ke saath English, Hinglish ya Hindi mein samjhayega.",
    langLabel: "Explanation Language",
    levelLabel: "Skill Level",
    codeLabel: "Your Code / Script",
    placeholder: "Yahan apna code, script, ya hardware snippet paste karo... (koi bhi language/format chalega)",
    sampleBtn: "Sample code try karo",
    explainBtn: "Explain karo →",
    explainBtnLoading: "Guru soch rahe hain...",
    tip: "Tip: 20-30 lines tak rakhoge toh explanation zyada fast aayegi",
    emptyPrompt: "Pehle kuch code/script paste karo!",
    timeoutErr: "Guru ko response aane mein bahut time lag raha hai. Code chhota karke (10-20 lines) dobara try karo.",
    emptyErr: "Guru is code ko abhi explain nahi kar paye. Chhota portion try karo, ya thodi der baad phir try karo.",
    genericErr: "Kuch gadbad ho gayi (network/connection issue ho sakta hai). Ek baar phir try karo.",
    neutralLoadingNote: "Neutral tarike se dobara try kar rahe hain...",
    loadingNote: "Guru padh rahe hain...",
    fullLoadingNote: "Poora detailed breakdown taiyar ho raha hai...",
    cacheNote: "⚡ Pehle se explain kiya hua — instant result",
    quickLabel: "Quick Take",
    overallLabel: "Overall — is code ka matlab",
    howWorksLabel: "Yeh kaam kaise karta hai:",
    stamp: "✓ checked by Guru",
    depsTitle: "📦 Dependencies",
    risksTitle: "⚠ Risks / Edge Cases",
    errorsTitle: "🛑 Possible Errors",
    complexityTitle: "📊 Complexity",
    exampleTitle: "▶ Example Run",
    traceTitle: "🔍 Simulated Execution Trace",
    traceNote: "AI-simulated walkthrough hai — real debugger/interpreter nahi, ek estimated trace hai",
    inputLabel: "Input", outputLabel: "Output",
    lineSectionTitle: "Line-by-line, margin par notes ke saath",
    lineSectionSub: "Kisi bhi line ya note pe click karo — dono side saath mein highlight honge",
    codePanel: "Code", notesPanel: "Guru's Notes",
    glossaryTitle: "Keyword Glossary",
    glossarySub: "Har mushkil word ka matlab, ek jagah",
    tipsTitle: "✎ Guru ki tip",
    emptyState: "Code paste karke \"Explain karo\" dabao — Guru ready hai 📖",
    rawLabel: "✎ Guru ka explanation (plain notes)",
    scoresTitle: "Code Health Dashboard",
    securityScore: "Security", qualityScore: "Quality", performanceScore: "Performance",
    callGraphTitle: "🔗 Function Call Graph",
    dataFlowTitle: "🧬 Data Flow (Variable Lifecycle)",
    fixesTitle: "🛠 Suggested Fixes",
    fixLabel: "Fix:",
    predictTitle: "🔮 Predict Output — apna input do",
    predictPlaceholder: "Custom input do (jaise: function ke arguments, ya stdin value)...",
    predictBtn: "Predict karo",
    predictBtnLoading: "Guru predict kar rahe hain...",
    predictResultLabel: "Predicted Output",
  },
  hindi: {
    eyebrow: "✎ आपका निजी कोड-शिक्षक",
    titleA: "कोड ", titleB: "गुरु",
    sub: "कोई भी कोड, स्क्रिप्ट या हार्डवेयर/फर्मवेयर स्निपेट पेस्ट करें। गुरु लाइन-दर-लाइन, हर शब्द, जोखिम, निर्भरताओं और सिम्युलेटेड एक्ज़ीक्यूशन ट्रेस के साथ अंग्रेज़ी, हिंग्लिश या हिंदी में समझाएंगे।",
    langLabel: "समझाने की भाषा",
    levelLabel: "स्तर",
    codeLabel: "आपका कोड / स्क्रिप्ट",
    placeholder: "यहाँ अपना कोड, स्क्रिप्ट, या हार्डवेयर स्निपेट पेस्ट करें...",
    sampleBtn: "नमूना कोड आज़माएं",
    explainBtn: "समझाओ →",
    explainBtnLoading: "गुरु सोच रहे हैं...",
    tip: "सुझाव: 20-30 लाइनों तक रखेंगे तो व्याख्या जल्दी आएगी",
    emptyPrompt: "पहले कुछ कोड/स्क्रिप्ट पेस्ट करें!",
    timeoutErr: "गुरु को जवाब देने में बहुत समय लग रहा है। कोड छोटा करके फिर से प्रयास करें।",
    emptyErr: "गुरु अभी इस कोड को समझा नहीं पाए। छोटा हिस्सा आज़माएं।",
    genericErr: "कुछ गड़बड़ हो गई। एक बार फिर प्रयास करें।",
    neutralLoadingNote: "थोड़े अलग तरीके से फिर कोशिश कर रहे हैं...",
    loadingNote: "गुरु पढ़ रहे हैं...",
    fullLoadingNote: "पूरा विस्तृत विश्लेषण तैयार हो रहा है...",
    cacheNote: "⚡ पहले से समझाया गया — तुरंत परिणाम",
    quickLabel: "त्वरित सार",
    overallLabel: "कुल मिलाकर — इस कोड का मतलब",
    howWorksLabel: "यह कैसे काम करता है:",
    stamp: "✓ गुरु द्वारा जांचा गया",
    depsTitle: "📦 निर्भरताएं",
    risksTitle: "⚠ जोखिम / एज केस",
    errorsTitle: "🛑 संभावित त्रुटियां",
    complexityTitle: "📊 जटिलता",
    exampleTitle: "▶ उदाहरण",
    traceTitle: "🔍 सिम्युलेटेड एक्ज़ीक्यूशन ट्रेस",
    traceNote: "यह AI-सिम्युलेटेड वॉकथ्रू है — असली डिबगर नहीं, एक अनुमानित ट्रेस है",
    inputLabel: "इनपुट", outputLabel: "आउटपुट",
    lineSectionTitle: "लाइन-दर-लाइन, हाशिये के नोट्स के साथ",
    lineSectionSub: "किसी भी लाइन या नोट पर क्लिक करें",
    codePanel: "कोड", notesPanel: "गुरु के नोट्स",
    glossaryTitle: "शब्द शब्दकोश",
    glossarySub: "हर मुश्किल शब्द का मतलब",
    tipsTitle: "✎ गुरु की सलाह",
    emptyState: "कोड पेस्ट करके \"समझाओ\" दबाएं — गुरु तैयार हैं 📖",
    rawLabel: "✎ गुरु की व्याख्या (सामान्य नोट्स)",
    scoresTitle: "कोड हेल्थ डैशबोर्ड",
    securityScore: "सुरक्षा", qualityScore: "गुणवत्ता", performanceScore: "प्रदर्शन",
    callGraphTitle: "🔗 फ़ंक्शन कॉल ग्राफ",
    dataFlowTitle: "🧬 डेटा फ्लो (वेरिएबल जीवनचक्र)",
    fixesTitle: "🛠 सुझाए गए सुधार",
    fixLabel: "सुधार:",
    predictTitle: "🔮 आउटपुट का अनुमान — अपना इनपुट दें",
    predictPlaceholder: "कस्टम इनपुट डालें...",
    predictBtn: "अनुमान लगाओ",
    predictBtnLoading: "गुरु अनुमान लगा रहे हैं...",
    predictResultLabel: "अनुमानित आउटपुट",
  },
  english: {
    eyebrow: "✎ your personal code teacher",
    titleA: "Code ", titleB: "Guru",
    sub: "Paste any code, script, or hardware/firmware snippet. Guru explains it line-by-line, keyword-by-keyword, with risks, dependencies, and a simulated execution trace, in English, Hinglish, or Hindi.",
    langLabel: "Explanation Language",
    levelLabel: "Skill Level",
    codeLabel: "Your Code / Script",
    placeholder: "Paste your code, script, or hardware snippet here...",
    sampleBtn: "Try sample code",
    explainBtn: "Explain →",
    explainBtnLoading: "Guru is thinking...",
    tip: "Tip: keeping it to 20-30 lines gives you a faster explanation",
    emptyPrompt: "Paste some code/script first!",
    timeoutErr: "Guru is taking too long. Try shortening the code and try again.",
    emptyErr: "Guru couldn't explain this code right now. Try a smaller portion.",
    genericErr: "Something went wrong. Please try again.",
    neutralLoadingNote: "Trying a different approach...",
    loadingNote: "Guru is reading...",
    fullLoadingNote: "Preparing the full detailed breakdown...",
    cacheNote: "⚡ Already explained before — instant result",
    quickLabel: "Quick Take",
    overallLabel: "Overall — what this code means",
    howWorksLabel: "How it works:",
    stamp: "✓ checked by Guru",
    depsTitle: "📦 Dependencies",
    risksTitle: "⚠ Risks / Edge Cases",
    errorsTitle: "🛑 Possible Errors",
    complexityTitle: "📊 Complexity",
    exampleTitle: "▶ Example Run",
    traceTitle: "🔍 Simulated Execution Trace",
    traceNote: "This is an AI-simulated walkthrough — not a real debugger, an estimated trace",
    inputLabel: "Input", outputLabel: "Output",
    lineSectionTitle: "Line-by-line, with margin notes",
    lineSectionSub: "Click any line or note — both sides highlight together",
    codePanel: "Code", notesPanel: "Guru's Notes",
    glossaryTitle: "Keyword Glossary",
    glossarySub: "Every tricky word's meaning, in one place",
    tipsTitle: "✎ Guru's tip",
    emptyState: "Paste code and hit \"Explain\" — Guru is ready 📖",
    rawLabel: "✎ Guru's explanation (plain notes)",
    scoresTitle: "Code Health Dashboard",
    securityScore: "Security", qualityScore: "Quality", performanceScore: "Performance",
    callGraphTitle: "🔗 Function Call Graph",
    dataFlowTitle: "🧬 Data Flow (Variable Lifecycle)",
    fixesTitle: "🛠 Suggested Fixes",
    fixLabel: "Fix:",
    predictTitle: "🔮 Predict Output — give your own input",
    predictPlaceholder: "Enter custom input (e.g. function arguments or stdin value)...",
    predictBtn: "Predict",
    predictBtnLoading: "Guru is predicting...",
    predictResultLabel: "Predicted Output",
  },
};

const KEYWORD_RE = /\b(public|private|protected|static|void|int|string|String|bool|boolean|float|double|char|class|function|def|return|if|else|elif|for|while|do|switch|case|break|continue|import|include|from|package|const|let|var|new|this|self|try|catch|except|finally|throw|throws|null|None|nil|true|false|True|False|echo|print|println|main|struct|enum|typedef|namespace|template|async|await|lambda|yield|global|local|register|volatile|extern|unsigned|signed)\b/;
const STRING_RE = /("([^"\\]|\\.)*"|'([^'\\]|\\.)*'|`([^`\\]|\\.)*`)/;
const COMMENT_RE = /(\/\/.*$|#.*$|--.*$)/;
const NUMBER_RE = /\b(0x[0-9a-fA-F]+|\d+\.?\d*)\b/;

function tokenizeLine(line) {
  const tokens = [];
  let rest = line;
  let cursor = 0;
  const combined = new RegExp(`${COMMENT_RE.source}|${STRING_RE.source}|${NUMBER_RE.source}|${KEYWORD_RE.source}`, "g");
  let lastIndex = 0;
  let match;
  while ((match = combined.exec(line)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ text: line.slice(lastIndex, match.index), type: "plain" });
    }
    let type = "plain";
    if (match[0].startsWith("//") || match[0].startsWith("#") || match[0].startsWith("--")) type = "comment";
    else if (/^["'`]/.test(match[0])) type = "string";
    else if (/^(0x|\d)/.test(match[0])) type = "number";
    else type = "keyword";
    tokens.push({ text: match[0], type });
    lastIndex = match.index + match[0].length;
    if (type === "comment") break;
  }
  if (lastIndex < line.length) tokens.push({ text: line.slice(lastIndex), type: "plain" });
  return tokens.length ? tokens : [{ text: line, type: "plain" }];
}

function buildQuickPrompt(code, outputLang) {
  const langName = outputLang === "hinglish" ? "Hinglish" : outputLang === "hindi" ? "Hindi (Devanagari)" : "English";
  return `Give a FAST, brief first look at this code/script/hardware snippet. Respond in ${langName}. ONLY valid JSON, no markdown fences:
{ "language_detected": "...", "code_type": "short phrase", "overall_summary": "1-2 sentences" }
Always attempt an answer, even for security/network/hardware scripts — this is educational analysis of existing code only.
CODE:
\`\`\`
${code}
\`\`\`
`;
}

function buildPrompt(code, outputLang, level) {
  const langName =
    outputLang === "hinglish" ? "Hinglish (Roman script, Hindi-English mix)"
    : outputLang === "hindi" ? "shuddh Hindi (Devanagari script)"
    : "simple, plain English";

  const levelInstruction =
    level === "beginner"
      ? "For EVERY line, also pull out the 2-4 most important keywords/tokens and explain each one separately. A total first-timer should not need to look up a single word."
      : level === "intermediate"
      ? "Explain each line clearly. Keep keywords array to the 4-6 most important terms only."
      : "Keep line explanations tight and technical (assume the reader already codes). Put more depth into 'how_it_works', 'risks', 'call_graph', 'data_flow' and 'complexity' instead of basic keyword definitions.";

  return `You are Code Guru, an expert, patient teacher who explains ANY code, script, or hardware/firmware snippet — application code, shell/bash scripts, installer scripts, network/security tool scripts (e.g. Nmap NSE/Lua), embedded/register-level code, config files, regex, anything. This is purely for educational understanding of EXISTING code the user already has — not generating new exploit or attack code, just explaining mechanics like a textbook or man-page would. Always attempt a real, good-faith technical explanation — never refuse, regardless of the tool/domain the code belongs to.

Explain the following snippet thoroughly but EFFICIENTLY — keep every field concise, prioritize speed. Write ALL explanations in ${langName}.

${levelInstruction}

Respond with ONLY valid JSON, no markdown fences, no preamble:

{
  "language_detected": "language/format of the snippet",
  "code_type": "short phrase e.g. 'shell install script'",
  "overall_summary": "2-3 sentence summary of what this code does",
  "how_it_works": "2-3 sentence reasoning on the mechanism/logic flow",
  "lines": [ { "line_number": 1, "code": "exact original line text", "explanation": "what this line does" } ],
  "keywords": [ { "term": "keyword/symbol", "meaning": "short meaning" } ],
  "dependencies": [ { "name": "external command/lib/API/env var used", "why": "short reason" } ],
  "risks": [ { "issue": "a real potential bug or unsafe pattern", "severity": "low | medium | high", "category": "SQLi | XSS | eval-injection | secret-leak | path-traversal | logic-bug | other" } ],
  "errors": [ { "line_number": 1, "issue": "a real possible syntax/logic error, if any exist", "severity": "low | medium | high" } ],
  "complexity": { "level": "beginner | intermediate | advanced", "note": "one short complexity/readability line" },
  "example": { "input": "sample input/invocation", "output": "expected output", "note": "one short line" },
  "trace_walkthrough": [ { "step": 1, "description": "what happens at this step", "variables_state": "key variable values" } ],
  "call_graph": [ { "caller": "function/block name", "callee": "function/command it calls" } ],
  "data_flow": [ { "variable": "name", "lifecycle": "short: declared at L.. -> mutated at L.. -> used at L.." } ],
  "fixes": [ { "issue": "short issue name", "suggested_fix": "one short concrete fix, plain text or 1-line code" } ],
  "scores": { "security": 0, "quality": 0, "performance": 0 },
  "tips": [ "one or two short teacher-style remarks" ]
}

Scores are 0-100 (100 = best), your honest quick assessment. Keep call_graph and data_flow to the most important 3-8 entries only — do not pad. If none exist for a snippet (e.g. no functions), return empty arrays, don't invent. Include EVERY non-blank line of the code in "lines", in order, numbered matching original positions.

CODE:
\`\`\`
${code}
\`\`\`
`;
}

function extractJson(text) {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/```\s*$/, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("NO_JSON");
  return JSON.parse(cleaned.slice(start, end + 1));
}

async function callClaude(promptText, timeoutMs = 40000, maxTokens = 3200) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch("/api/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: maxTokens,
        messages: [{ role: "user", content: promptText }],
      }),
    });
    const data = await response.json();
    const textBlock = (data.content || []).find((b) => b.type === "text" && b.text && b.text.trim().length > 0);
    if (!textBlock) throw new Error("EMPTY");
    return textBlock.text;
  } catch (err) {
    if (err.name === "AbortError") throw new Error("TIMEOUT");
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export default function CodeGuru() {
  const [code, setCode] = useState("");
  const [outputLang, setOutputLang] = useState("hinglish");
  const [level, setLevel] = useState("beginner");
  const [quickResult, setQuickResult] = useState(null);
  const [result, setResult] = useState(null);
  const [rawFallback, setRawFallback] = useState("");
  const [loading, setLoading] = useState(false);
  const [fullLoading, setFullLoading] = useState(false);
  const [loadingNote, setLoadingNote] = useState("");
  const [error, setError] = useState("");
  const [fromCache, setFromCache] = useState(false);
  const [activeLine, setActiveLine] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [predictInput, setPredictInput] = useState("");
  const [predictOutput, setPredictOutput] = useState("");
  const [predictLoading, setPredictLoading] = useState(false);
  const lineRefs = useRef({});
  const noteRefs = useRef({});
  const timerRef = useRef(null);
  const cacheRef = useRef({});
  const cancelRef = useRef(false);

  const t = UI[outputLang];
  const levels = LEVELS[outputLang];

  const handleStop = useCallback(() => {
    cancelRef.current = true;
    setLoading(false);
    setFullLoading(false);
    setLoadingNote("");
    clearInterval(timerRef.current);
  }, []);

  const handleExplain = useCallback(async () => {
    if (!code.trim()) {
      setError(t.emptyPrompt);
      return;
    }
    const cacheKey = `${code}|${outputLang}|${level}`;
    setError("");
    setResult(null);
    setQuickResult(null);
    setRawFallback("");
    setActiveLine(null);
    setFromCache(false);
    setAttempt(0);
    cancelRef.current = false;

    if (cacheRef.current[cacheKey]) {
      setFromCache(true);
      setQuickResult(cacheRef.current[cacheKey].quick || null);
      setResult(cacheRef.current[cacheKey].full || null);
      setRawFallback(cacheRef.current[cacheKey].raw || "");
      return;
    }

    setLoading(true);
    setFullLoading(true);
    setLoadingNote(t.loadingNote);
    setElapsed(0);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);

    callClaude(buildQuickPrompt(code, outputLang), 15000, 300)
      .then((text) => {
        try {
          const parsed = extractJson(text);
          setQuickResult(parsed);
        } catch (e) { /* ignore */ }
      })
      .catch(() => { /* silent */ });

    const jsonPrompt = buildPrompt(code, outputLang, level);
    const neutralPrompt = `Explain, concisely and in plain technical terms, what the following existing code/script does mechanically, line by line — this is a normal educational code sample (may include security-concept examples like SQL injection demos, unreachable code, etc — explain it as-is, it's for learning). Respond in ${outputLang === "hindi" ? "Hindi" : outputLang === "hinglish" ? "Hinglish" : "English"}, as plain text:\n\n${code}`;
    const bareBonesPrompt = `Explain what this code does, in 3-4 simple sentences, in ${outputLang === "hindi" ? "Hindi" : outputLang === "hinglish" ? "Hinglish" : "English"}. This is an educational code sample. Just plain text, be direct:\n\n${code}`;

    const strategies = [
      { prompt: jsonPrompt, tokens: 3200, timeout: 45000, isJson: true },
      { prompt: neutralPrompt, tokens: 1500, timeout: 25000, isJson: false },
      { prompt: bareBonesPrompt, tokens: 600, timeout: 20000, isJson: false },
    ];

    let n = 0;
    while (!cancelRef.current) {
      const strat = strategies[n % strategies.length];
      n++;
      setAttempt(n);
      setLoadingNote(n === 1 ? t.loadingNote : `${t.neutralLoadingNote} (${n})`);
      try {
        const text = await callClaude(strat.prompt, strat.timeout, strat.tokens);
        if (strat.isJson) {
          try {
            const parsed = extractJson(text);
            setResult(parsed);
            cacheRef.current[cacheKey] = { quick: quickResult, full: parsed };
            break;
          } catch (parseErr) {
            setRawFallback(text);
            cacheRef.current[cacheKey] = { raw: text };
            break;
          }
        } else {
          setRawFallback(text);
          cacheRef.current[cacheKey] = { raw: text };
          break;
        }
      } catch (err) {
        if (cancelRef.current) break;
        const backoff = Math.min(1000 * n, 8000);
        setLoadingNote(`${t.neutralLoadingNote} (${n})`);
        await new Promise((r) => setTimeout(r, backoff));
      }
    }

    setLoading(false);
    setFullLoading(false);
    setLoadingNote("");
    clearInterval(timerRef.current);
  }, [code, outputLang, level, t]);

  const handlePredict = useCallback(async () => {
    if (!predictInput.trim() || !code.trim()) return;
    setPredictLoading(true);
    setPredictOutput("");
    const langName = outputLang === "hindi" ? "Hindi" : outputLang === "hinglish" ? "Hinglish" : "English";
    const prompt = `Given this code:\n\`\`\`\n${code}\n\`\`\`\nIf run with this input: "${predictInput}", predict the realistic output/behavior step by step. Respond in ${langName}, plain text, concise (max 5-6 lines). If the input would cause an error, say what error and why.`;
    let n = 0;
    while (n < 20) {
      n++;
      try {
        const text = await callClaude(prompt, 20000, 500);
        setPredictOutput(text.trim());
        break;
      } catch (e) {
        await new Promise((r) => setTimeout(r, Math.min(1000 * n, 6000)));
      }
    }
    setPredictLoading(false);
  }, [predictInput, code, outputLang]);

  const jumpTo = (lineNumber) => {
    setActiveLine(lineNumber);
    lineRefs.current[lineNumber]?.scrollIntoView({ behavior: "smooth", block: "center" });
    noteRefs.current[lineNumber]?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const severityColor = (sev) => {
    if (sev === "high") return "#C23B3B";
    if (sev === "medium") return "#E8A33D";
    return "#7BA88A";
  };

  const scoreColor = (v) => {
    if (v == null) return "#6B7492";
    if (v >= 75) return "#7BA88A";
    if (v >= 45) return "#E8A33D";
    return "#C23B3B";
  };

  const tokenColor = { keyword: "#E8A33D", string: "#A8E6B0", number: "#F4C878", comment: "#6B7492", plain: "#E4E9F5" };

  return (
    <div className={`cg-root ${outputLang === "hindi" ? "lang-hindi" : ""}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Kalam:wght@400;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Noto+Serif+Devanagari:wght@500;600;700&display=swap');

        * { box-sizing: border-box; }
        .cg-root {
          --ink-navy: #0B1020;
          --panel-navy: #131A32;
          --panel-navy-light: #1B2440;
          --marigold: #E8A33D;
          --marigold-soft: #F4C878;
          --redpen: #C23B3B;
          --paper: #FBF6EA;
          --paper-line: #E4D9BE;
          --ink-on-paper: #2B2A28;
          --slate: #A9B2C9;
          --slate-dim: #6B7492;
          --font-display: 'Fraunces', serif;
          --font-body: 'Inter', sans-serif;
          --font-hand: 'Kalam', cursive;
          min-height: 100vh;
          background: var(--ink-navy);
          background-image:
            radial-gradient(circle at 15% 8%, rgba(232,163,61,0.08), transparent 40%),
            radial-gradient(circle at 85% 92%, rgba(194,59,59,0.06), transparent 40%);
          color: var(--slate);
          font-family: var(--font-body);
          padding: 0 0 64px 0;
        }
        .cg-root.lang-hindi {
          --font-display: 'Noto Serif Devanagari', 'Fraunces', serif;
          --font-body: 'Noto Sans Devanagari', 'Inter', sans-serif;
        }

        .cg-header { padding: 48px 24px 28px; text-align: center; border-bottom: 1px dashed rgba(169,178,201,0.25); margin-bottom: 36px; }
        .cg-eyebrow { font-family: var(--font-hand); color: var(--marigold-soft); font-size: 15px; margin-bottom: 6px; }
        .cg-title { font-family: var(--font-display); font-weight: 700; font-size: clamp(2.2rem, 5vw, 3.2rem); color: #F5F1E6; margin: 0 0 10px 0; letter-spacing: -0.01em; }
        .cg-title span { color: var(--marigold); }
        .cg-sub { max-width: 640px; margin: 0 auto; font-size: 15.5px; line-height: 1.6; color: var(--slate); font-family: var(--font-body); }

        .cg-container { max-width: 1180px; margin: 0 auto; padding: 0 24px; }

        .cg-controls { background: var(--panel-navy); border: 1px solid rgba(169,178,201,0.15); border-radius: 16px; padding: 22px; margin-bottom: 28px; }
        .cg-control-row { display: flex; flex-wrap: wrap; gap: 24px; margin-bottom: 18px; }
        .cg-control-group { flex: 1; min-width: 220px; }
        .cg-label { font-size: 12.5px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--slate-dim); font-weight: 600; margin-bottom: 9px; display: block; font-family: var(--font-body); }
        .cg-pills { display: flex; gap: 8px; flex-wrap: wrap; }
        .cg-pill { background: var(--panel-navy-light); border: 1px solid rgba(169,178,201,0.2); color: var(--slate); padding: 8px 14px; border-radius: 999px; font-size: 13.5px; cursor: pointer; transition: all 0.15s ease; font-family: var(--font-body); }
        .cg-pill:hover { border-color: var(--marigold); color: #F5F1E6; }
        .cg-pill.active { background: var(--marigold); border-color: var(--marigold); color: #1A1204; font-weight: 600; }
        .cg-pill-desc { font-size: 11px; color: var(--slate-dim); margin-top: 6px; font-family: var(--font-body); }

        .cg-textarea { width: 100%; background: var(--ink-navy); border: 1px solid rgba(169,178,201,0.2); border-radius: 12px; color: #E4E9F5; font-family: 'JetBrains Mono', monospace; font-size: 13.5px; line-height: 1.6; padding: 16px; min-height: 160px; resize: vertical; }
        .cg-textarea:focus { outline: none; border-color: var(--marigold); }
        .cg-textarea::placeholder { color: var(--slate-dim); font-family: var(--font-body); }

        .cg-actions { display: flex; justify-content: space-between; align-items: center; margin-top: 14px; gap: 12px; flex-wrap: wrap; }
        .cg-sample-btn { background: transparent; border: 1px dashed rgba(169,178,201,0.35); color: var(--slate); padding: 10px 16px; border-radius: 10px; font-size: 13px; cursor: pointer; font-family: var(--font-body); }
        .cg-sample-btn:hover { border-color: var(--marigold-soft); color: #F5F1E6; }
        .cg-tip-inline { font-size: 12px; color: var(--slate-dim); font-family: var(--font-body); }

        .cg-explain-btn { background: linear-gradient(135deg, var(--marigold), #D68A26); border: none; color: #1A1204; padding: 12px 26px; border-radius: 10px; font-size: 14.5px; font-weight: 700; cursor: pointer; box-shadow: 0 8px 24px rgba(232,163,61,0.25); transition: transform 0.1s ease; font-family: var(--font-body); }
        .cg-explain-btn:hover:not(:disabled) { transform: translateY(-1px); }
        .cg-explain-btn:disabled { opacity: 0.6; cursor: wait; }
        .cg-stop-btn { background: transparent; border: 1px solid rgba(194,59,59,0.5); color: #F0A8A8; padding: 12px 20px; border-radius: 10px; font-size: 13.5px; cursor: pointer; font-family: var(--font-body); }
        .cg-stop-btn:hover { background: rgba(194,59,59,0.12); }

        .cg-error { background: rgba(194,59,59,0.12); border: 1px solid rgba(194,59,59,0.4); color: #F0A8A8; padding: 12px 16px; border-radius: 10px; font-size: 13.5px; margin-bottom: 22px; font-family: var(--font-body); }
        .cg-cache-note { text-align: center; font-size: 12px; color: var(--marigold-soft); margin-bottom: 16px; font-family: var(--font-hand); }

        .cg-raw-card { background: var(--panel-navy); border: 1px solid rgba(169,178,201,0.2); border-radius: 14px; padding: 22px; margin-bottom: 28px; white-space: pre-wrap; font-size: 14px; line-height: 1.7; color: #E4E9F5; font-family: var(--font-body); }
        .cg-raw-label { font-family: var(--font-hand); color: var(--marigold-soft); font-size: 14px; margin-bottom: 10px; }

        .cg-quick-card { background: var(--panel-navy-light); border: 1px dashed var(--marigold); border-radius: 12px; padding: 16px 20px; margin-bottom: 16px; }
        .cg-quick-label { font-family: var(--font-hand); color: var(--marigold-soft); font-size: 13px; margin-bottom: 6px; }
        .cg-quick-text { font-size: 14px; color: #E4E9F5; line-height: 1.5; font-family: var(--font-body); }

        .cg-summary-card { background: var(--paper); border-radius: 14px; padding: 22px 26px; margin-bottom: 20px; position: relative; box-shadow: 0 12px 30px rgba(0,0,0,0.25); }
        .cg-stamp { position: absolute; top: -14px; right: 22px; background: var(--redpen); color: #FBF6EA; font-family: var(--font-hand); font-weight: 700; font-size: 13px; padding: 7px 14px; border-radius: 999px; transform: rotate(4deg); box-shadow: 0 6px 14px rgba(0,0,0,0.3); border: 2px solid #FBF6EA; }
        .cg-summary-label { font-family: var(--font-hand); color: var(--redpen); font-size: 14px; margin-bottom: 6px; }
        .cg-summary-text { font-family: var(--font-display); color: var(--ink-on-paper); font-size: 17px; line-height: 1.55; margin-bottom: 12px; }
        .cg-howworks { font-size: 14px; color: #4A473E; line-height: 1.6; border-top: 1px dashed var(--paper-line); padding-top: 12px; font-family: var(--font-body); }
        .cg-tag-row { display: flex; gap: 10px; margin-top: 14px; flex-wrap: wrap; }
        .cg-lang-tag { font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.06em; color: #8A7F5F; font-weight: 600; background: rgba(138,127,95,0.1); padding: 4px 10px; border-radius: 6px; font-family: var(--font-body); }

        .cg-meta-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-bottom: 28px; }
        .cg-meta-card { background: var(--panel-navy); border: 1px solid rgba(169,178,201,0.15); border-radius: 14px; padding: 18px 20px; }
        .cg-meta-title { font-family: var(--font-hand); color: var(--marigold-soft); font-size: 15px; margin-bottom: 10px; }
        .cg-dep-item { font-size: 13px; margin-bottom: 8px; line-height: 1.5; font-family: var(--font-body); }
        .cg-dep-name { font-family: 'JetBrains Mono', monospace; color: #E4E9F5; font-weight: 600; }
        .cg-dep-why { color: var(--slate-dim); }
        .cg-risk-item { font-size: 13px; margin-bottom: 10px; padding-left: 14px; border-left: 3px solid; line-height: 1.5; font-family: var(--font-body); }
        .cg-risk-sev { font-size: 10.5px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; margin-right: 6px; }
        .cg-complexity-level { display: inline-block; background: var(--marigold); color: #1A1204; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 999px; margin-bottom: 8px; text-transform: capitalize; font-family: var(--font-body); }
        .cg-complexity-note { font-size: 13px; color: var(--slate); line-height: 1.5; font-family: var(--font-body); }
        .cg-example-block { font-family: 'JetBrains Mono', monospace; font-size: 12.5px; background: var(--ink-navy); border-radius: 8px; padding: 10px 12px; margin-bottom: 6px; color: #A8E6B0; word-break: break-word; }
        .cg-example-label { font-size: 10.5px; text-transform: uppercase; color: var(--slate-dim); font-weight: 700; margin-bottom: 4px; font-family: var(--font-body); }
        .cg-example-note { font-size: 12.5px; color: var(--slate-dim); margin-top: 8px; font-family: var(--font-body); }

        .cg-trace-card { background: var(--panel-navy); border: 1px solid rgba(232,163,61,0.2); border-radius: 14px; padding: 18px 20px; margin-bottom: 28px; grid-column: 1 / -1; }
        .cg-trace-note { font-size: 11.5px; color: var(--slate-dim); font-style: italic; margin-bottom: 12px; font-family: var(--font-body); }
        .cg-trace-step { display: flex; gap: 12px; margin-bottom: 10px; align-items: flex-start; }
        .cg-trace-num { background: var(--marigold); color: #1A1204; font-size: 11px; font-weight: 700; min-width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .cg-trace-desc { font-size: 13px; color: #E4E9F5; line-height: 1.5; font-family: var(--font-body); }
        .cg-trace-vars { font-family: 'JetBrains Mono', monospace; font-size: 11.5px; color: var(--marigold-soft); margin-top: 3px; }

        .cg-score-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 28px; }
        .cg-score-card { background: var(--panel-navy); border: 1px solid rgba(169,178,201,0.15); border-radius: 14px; padding: 18px; text-align: center; }
        .cg-score-ring { width: 72px; height: 72px; border-radius: 50%; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 20px; font-weight: 700; color: #F5F1E6; }
        .cg-score-label { font-size: 12px; color: var(--slate-dim); text-transform: uppercase; letter-spacing: 0.06em; font-family: var(--font-body); font-weight: 600; }

        .cg-graph-card { background: var(--panel-navy); border: 1px solid rgba(169,178,201,0.15); border-radius: 14px; padding: 20px; margin-bottom: 28px; overflow-x: auto; }
        .cg-graph-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; flex-wrap: wrap; }
        .cg-graph-node { background: var(--panel-navy-light); border: 1px solid var(--marigold); color: #F5F1E6; padding: 6px 14px; border-radius: 8px; font-family: 'JetBrains Mono', monospace; font-size: 12.5px; white-space: nowrap; }
        .cg-graph-arrow { color: var(--marigold); font-size: 16px; }
        .cg-graph-callee { background: var(--ink-navy); border: 1px solid rgba(169,178,201,0.3); color: var(--slate); padding: 6px 14px; border-radius: 8px; font-family: 'JetBrains Mono', monospace; font-size: 12.5px; white-space: nowrap; }

        .cg-flow-table { width: 100%; border-collapse: collapse; }
        .cg-flow-table td { padding: 8px 10px; font-size: 12.5px; border-bottom: 1px solid rgba(169,178,201,0.1); font-family: var(--font-body); }
        .cg-flow-var { font-family: 'JetBrains Mono', monospace; color: var(--marigold-soft); font-weight: 600; }
        .cg-flow-lifecycle { color: var(--slate); }

        .cg-fix-card { background: var(--panel-navy-light); border-left: 3px solid var(--marigold); border-radius: 8px; padding: 12px 14px; margin-bottom: 10px; }
        .cg-fix-issue { font-size: 13px; color: #F0A8A8; margin-bottom: 4px; font-family: var(--font-body); font-weight: 600; }
        .cg-fix-suggestion { font-size: 13px; color: #A8E6B0; font-family: 'JetBrains Mono', monospace; }

        .cg-predict-card { background: var(--panel-navy); border: 1px solid rgba(232,163,61,0.25); border-radius: 14px; padding: 20px; margin-bottom: 28px; }
        .cg-predict-row { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px; }
        .cg-predict-input { flex: 1; min-width: 200px; background: var(--ink-navy); border: 1px solid rgba(169,178,201,0.2); border-radius: 8px; color: #E4E9F5; font-family: 'JetBrains Mono', monospace; font-size: 13px; padding: 10px 12px; }
        .cg-predict-input:focus { outline: none; border-color: var(--marigold); }
        .cg-predict-btn { background: var(--marigold); border: none; color: #1A1204; padding: 10px 18px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: var(--font-body); }
        .cg-predict-btn:disabled { opacity: 0.6; cursor: wait; }
        .cg-predict-result { margin-top: 14px; background: var(--ink-navy); border-radius: 8px; padding: 12px 14px; font-size: 13px; color: #A8E6B0; white-space: pre-wrap; font-family: 'JetBrains Mono', monospace; }

        .cg-risk-category { display: inline-block; font-size: 9.5px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.04em; background: rgba(194,59,59,0.15); color: #F0A8A8; padding: 2px 7px; border-radius: 4px; margin-right: 6px; }


        .cg-split { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border-radius: 16px; overflow: hidden; border: 1px solid rgba(169,178,201,0.15); margin-bottom: 28px; }
        @media (max-width: 860px) { .cg-split { grid-template-columns: 1fr; } }

        .cg-code-panel { background: var(--panel-navy); padding: 22px 0; max-height: 640px; overflow-y: auto; }
        .cg-panel-heading { font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--slate-dim); font-weight: 700; padding: 0 20px 14px; font-family: var(--font-body); }
        .cg-code-line { display: flex; gap: 14px; padding: 5px 20px; cursor: pointer; border-left: 3px solid transparent; transition: background 0.12s ease; }
        .cg-code-line:hover { background: rgba(232,163,61,0.06); }
        .cg-code-line.active { background: rgba(232,163,61,0.12); border-left-color: var(--marigold); }
        .cg-code-line.has-error { border-left-color: var(--redpen); }
        .cg-line-num { font-family: 'JetBrains Mono', monospace; font-size: 12.5px; color: var(--slate-dim); min-width: 22px; text-align: right; user-select: none; padding-top: 2px; }
        .cg-line-code { font-family: 'JetBrains Mono', monospace; font-size: 13.5px; white-space: pre-wrap; word-break: break-word; line-height: 1.65; }

        .cg-notes-panel { background: var(--paper); padding: 22px 0; max-height: 640px; overflow-y: auto; border-left: 1px dashed var(--paper-line); }
        .cg-notes-panel .cg-panel-heading { color: #8A7F5F; }
        .cg-note { padding: 8px 20px; cursor: pointer; border-left: 3px solid transparent; transition: background 0.12s ease; }
        .cg-note:hover { background: rgba(194,59,59,0.05); }
        .cg-note.active { background: rgba(194,59,59,0.08); border-left-color: var(--redpen); }
        .cg-note-text { font-family: var(--font-hand); color: var(--redpen); font-size: 15px; line-height: 1.5; }
        .cg-note-num { font-family: var(--font-body); font-size: 10.5px; color: #A8967A; font-weight: 700; margin-right: 6px; }

        .cg-section-title { font-family: var(--font-display); font-size: 20px; color: #F5F1E6; margin: 0 0 4px 0; }
        .cg-section-sub { font-size: 13px; color: var(--slate-dim); margin-bottom: 16px; font-family: var(--font-body); }

        .cg-glossary { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; margin-bottom: 28px; }
        .cg-glossary-card { background: var(--panel-navy); border: 1px solid rgba(169,178,201,0.15); border-radius: 12px; padding: 14px 16px; }
        .cg-glossary-term { font-family: 'JetBrains Mono', monospace; color: var(--marigold-soft); font-size: 13.5px; font-weight: 600; margin-bottom: 5px; }
        .cg-glossary-meaning { font-size: 13px; color: var(--slate); line-height: 1.5; font-family: var(--font-body); }

        .cg-tips { background: var(--panel-navy); border: 1px solid rgba(232,163,61,0.25); border-radius: 12px; padding: 18px 20px; }
        .cg-tips-title { font-family: var(--font-hand); color: var(--marigold-soft); font-size: 15px; margin-bottom: 8px; }
        .cg-tip-item { font-size: 13.5px; color: var(--slate); line-height: 1.6; padding-left: 16px; position: relative; margin-bottom: 6px; font-family: var(--font-body); }
        .cg-tip-item::before { content: "→"; position: absolute; left: 0; color: var(--marigold); }

        .cg-empty { text-align: center; padding: 60px 24px; color: var(--slate-dim); font-size: 14px; font-family: var(--font-body); }

        .cg-spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(26,18,4,0.3); border-top-color: #1A1204; border-radius: 50%; animation: cg-spin 0.7s linear infinite; margin-right: 8px; vertical-align: -2px; }
        @keyframes cg-spin { to { transform: rotate(360deg); } }
        .cg-loading-note { text-align: center; font-size: 13px; color: var(--slate-dim); margin-bottom: 20px; font-family: var(--font-hand); }
      `}</style>

      <div className="cg-header">
        <div className="cg-eyebrow">{t.eyebrow}</div>
        <h1 className="cg-title">{t.titleA}<span>{t.titleB}</span></h1>
        <p className="cg-sub">{t.sub}</p>
      </div>

      <div className="cg-container">
        <div className="cg-controls">
          <div className="cg-control-row">
            <div className="cg-control-group">
              <label className="cg-label">{t.langLabel}</label>
              <div className="cg-pills">
                {OUTPUT_LANGS.map((l) => (
                  <button key={l.id} className={`cg-pill ${outputLang === l.id ? "active" : ""}`} onClick={() => setOutputLang(l.id)}>
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="cg-control-group">
              <label className="cg-label">{t.levelLabel}</label>
              <div className="cg-pills">
                {levels.map((d) => (
                  <button key={d.id} className={`cg-pill ${level === d.id ? "active" : ""}`} onClick={() => setLevel(d.id)} title={d.desc}>
                    {d.label}
                  </button>
                ))}
              </div>
              <div className="cg-pill-desc">{levels.find((d) => d.id === level)?.desc}</div>
            </div>
          </div>

          <label className="cg-label">{t.codeLabel}</label>
          <textarea
            className="cg-textarea"
            placeholder={t.placeholder}
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />

          <div className="cg-actions">
            <button className="cg-sample-btn" onClick={() => setCode(SAMPLE_CODE)}>{t.sampleBtn}</button>
            {code.length > 800 && <span className="cg-tip-inline">{t.tip}</span>}
            <button className="cg-explain-btn" onClick={handleExplain} disabled={loading && fullLoading}>
              {loading && <span className="cg-spinner" />}
              {loading ? t.explainBtnLoading : t.explainBtn}
            </button>
            {loading && (
              <button className="cg-stop-btn" onClick={handleStop}>
                {outputLang === "hindi" ? "रोक दो" : outputLang === "english" ? "Stop" : "Rok do"}
              </button>
            )}
          </div>
        </div>

        {fromCache && <div className="cg-cache-note">{t.cacheNote}</div>}

        {fullLoading && !result && (
          <div className="cg-loading-note">{loadingNote} ({elapsed}s) {attempt > 1 ? `· attempt ${attempt}` : ""}</div>
        )}
        {error && <div className="cg-error">{error}</div>}

        {quickResult && !result && (
          <div className="cg-quick-card">
            <div className="cg-quick-label">⚡ {t.quickLabel}</div>
            <div className="cg-quick-text">{quickResult.overall_summary}</div>
            <div className="cg-tag-row" style={{ marginTop: 8 }}>
              {quickResult.language_detected && <span className="cg-lang-tag">{quickResult.language_detected}</span>}
              {quickResult.code_type && <span className="cg-lang-tag">{quickResult.code_type}</span>}
            </div>
          </div>
        )}
        {fullLoading && quickResult && !result && (
          <div className="cg-loading-note">{t.fullLoadingNote} ({elapsed}s)</div>
        )}

        {rawFallback && (
          <div className="cg-raw-card">
            <div className="cg-raw-label">{t.rawLabel}</div>
            {rawFallback}
          </div>
        )}

        {result && (
          <>
            <div className="cg-summary-card">
              <div className="cg-stamp">{t.stamp}</div>
              <div className="cg-summary-label">{t.overallLabel}</div>
              <div className="cg-summary-text">{result.overall_summary}</div>
              {result.how_it_works && (
                <div className="cg-howworks"><strong>{t.howWorksLabel}</strong> {result.how_it_works}</div>
              )}
              <div className="cg-tag-row">
                {result.language_detected && <span className="cg-lang-tag">{result.language_detected}</span>}
                {result.code_type && <span className="cg-lang-tag">{result.code_type}</span>}
              </div>
            </div>

            {result.scores && (
              <div className="cg-score-grid">
                {[
                  { key: "security", label: t.securityScore, val: result.scores.security },
                  { key: "quality", label: t.qualityScore, val: result.scores.quality },
                  { key: "performance", label: t.performanceScore, val: result.scores.performance },
                ].map((s) => (
                  <div className="cg-score-card" key={s.key}>
                    <div className="cg-score-ring" style={{ background: `conic-gradient(${scoreColor(s.val)} ${s.val * 3.6}deg, rgba(169,178,201,0.15) 0deg)` }}>
                      <div style={{ background: "var(--panel-navy)", width: 56, height: 56, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {s.val ?? "-"}
                      </div>
                    </div>
                    <div className="cg-score-label">{s.label}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="cg-meta-grid">
              {result.dependencies && result.dependencies.length > 0 && (
                <div className="cg-meta-card">
                  <div className="cg-meta-title">{t.depsTitle}</div>
                  {result.dependencies.map((d, i) => (
                    <div className="cg-dep-item" key={i}>
                      <span className="cg-dep-name">{d.name}</span> — <span className="cg-dep-why">{d.why}</span>
                    </div>
                  ))}
                </div>
              )}

              {result.risks && result.risks.length > 0 && (
                <div className="cg-meta-card">
                  <div className="cg-meta-title">{t.risksTitle}</div>
                  {result.risks.map((r, i) => (
                    <div className="cg-risk-item" key={i} style={{ borderColor: severityColor(r.severity) }}>
                      <span className="cg-risk-sev" style={{ color: severityColor(r.severity) }}>{r.severity}</span>
                      {r.category && r.category !== "other" && <span className="cg-risk-category">{r.category}</span>}
                      {r.issue}
                    </div>
                  ))}
                </div>
              )}

              {result.errors && result.errors.length > 0 && (
                <div className="cg-meta-card">
                  <div className="cg-meta-title">{t.errorsTitle}</div>
                  {result.errors.map((e, i) => (
                    <div className="cg-risk-item" key={i} style={{ borderColor: severityColor(e.severity) }}>
                      <span className="cg-risk-sev" style={{ color: severityColor(e.severity) }}>L{e.line_number} · {e.severity}</span>
                      {e.issue}
                    </div>
                  ))}
                </div>
              )}

              {result.complexity && (
                <div className="cg-meta-card">
                  <div className="cg-meta-title">{t.complexityTitle}</div>
                  <div className="cg-complexity-level">{result.complexity.level}</div>
                  <div className="cg-complexity-note">{result.complexity.note}</div>
                </div>
              )}

              {result.example && (
                <div className="cg-meta-card">
                  <div className="cg-meta-title">{t.exampleTitle}</div>
                  <div className="cg-example-label">{t.inputLabel}</div>
                  <div className="cg-example-block">{result.example.input}</div>
                  <div className="cg-example-label">{t.outputLabel}</div>
                  <div className="cg-example-block">{result.example.output}</div>
                  {result.example.note && <div className="cg-example-note">{result.example.note}</div>}
                </div>
              )}

              {result.trace_walkthrough && result.trace_walkthrough.length > 0 && (
                <div className="cg-trace-card">
                  <div className="cg-meta-title">{t.traceTitle}</div>
                  <div className="cg-trace-note">{t.traceNote}</div>
                  {result.trace_walkthrough.map((step, i) => (
                    <div className="cg-trace-step" key={i}>
                      <div className="cg-trace-num">{step.step || i + 1}</div>
                      <div>
                        <div className="cg-trace-desc">{step.description}</div>
                        {step.variables_state && <div className="cg-trace-vars">{step.variables_state}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {result.call_graph && result.call_graph.length > 0 && (
              <div className="cg-graph-card">
                <div className="cg-meta-title">{t.callGraphTitle}</div>
                {result.call_graph.map((edge, i) => (
                  <div className="cg-graph-row" key={i}>
                    <span className="cg-graph-node">{edge.caller}</span>
                    <span className="cg-graph-arrow">→</span>
                    <span className="cg-graph-callee">{edge.callee}</span>
                  </div>
                ))}
              </div>
            )}

            {result.data_flow && result.data_flow.length > 0 && (
              <div className="cg-graph-card">
                <div className="cg-meta-title">{t.dataFlowTitle}</div>
                <table className="cg-flow-table">
                  <tbody>
                    {result.data_flow.map((d, i) => (
                      <tr key={i}>
                        <td className="cg-flow-var">{d.variable}</td>
                        <td className="cg-flow-lifecycle">{d.lifecycle}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {result.fixes && result.fixes.length > 0 && (
              <div className="cg-graph-card">
                <div className="cg-meta-title">{t.fixesTitle}</div>
                {result.fixes.map((f, i) => (
                  <div className="cg-fix-card" key={i}>
                    <div className="cg-fix-issue">{f.issue}</div>
                    <div className="cg-fix-suggestion">{t.fixLabel} {f.suggested_fix}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="cg-predict-card">
              <div className="cg-meta-title">{t.predictTitle}</div>
              <div className="cg-predict-row">
                <input
                  className="cg-predict-input"
                  placeholder={t.predictPlaceholder}
                  value={predictInput}
                  onChange={(e) => setPredictInput(e.target.value)}
                />
                <button className="cg-predict-btn" onClick={handlePredict} disabled={predictLoading}>
                  {predictLoading ? t.predictBtnLoading : t.predictBtn}
                </button>
              </div>
              {predictOutput && (
                <div className="cg-predict-result">
                  <strong>{t.predictResultLabel}:</strong>{"\n"}{predictOutput}
                </div>
              )}
            </div>

            <div className="cg-section-title">{t.lineSectionTitle}</div>
            <div className="cg-section-sub">{t.lineSectionSub}</div>

            <div className="cg-split">
              <div className="cg-code-panel">
                <div className="cg-panel-heading">{t.codePanel}</div>
                {(result.lines || []).map((line) => {
                  const hasErr = (result.errors || []).some((e) => e.line_number === line.line_number);
                  return (
                    <div key={line.line_number} ref={(el) => (lineRefs.current[line.line_number] = el)}
                      className={`cg-code-line ${activeLine === line.line_number ? "active" : ""} ${hasErr ? "has-error" : ""}`}
                      onClick={() => jumpTo(line.line_number)}>
                      <span className="cg-line-num">{line.line_number}</span>
                      <span className="cg-line-code">
                        {tokenizeLine(line.code).map((tok, ti) => (
                          <span key={ti} style={{ color: tokenColor[tok.type] }}>{tok.text}</span>
                        ))}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="cg-notes-panel">
                <div className="cg-panel-heading">{t.notesPanel}</div>
                {(result.lines || []).map((line) => (
                  <div key={line.line_number} ref={(el) => (noteRefs.current[line.line_number] = el)}
                    className={`cg-note ${activeLine === line.line_number ? "active" : ""}`}
                    onClick={() => jumpTo(line.line_number)}>
                    <span className="cg-note-text">
                      <span className="cg-note-num">L{line.line_number}</span>
                      {line.explanation}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {result.keywords && result.keywords.length > 0 && (
              <>
                <div className="cg-section-title">{t.glossaryTitle}</div>
                <div className="cg-section-sub">{t.glossarySub}</div>
                <div className="cg-glossary">
                  {result.keywords.map((k, i) => (
                    <div className="cg-glossary-card" key={i}>
                      <div className="cg-glossary-term">{k.term}</div>
                      <div className="cg-glossary-meaning">{k.meaning}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {result.tips && result.tips.length > 0 && (
              <div className="cg-tips">
                <div className="cg-tips-title">{t.tipsTitle}</div>
                {result.tips.map((tip, i) => <div className="cg-tip-item" key={i}>{tip}</div>)}
              </div>
            )}
          </>
        )}

        {!result && !rawFallback && !quickResult && !loading && !error && (
          <div className="cg-empty">{t.emptyState}</div>
        )}
      </div>
    </div>
  );
}
