import { useState, useRef, useEffect } from "react";
import { supabase } from "./supabase";
import Auth from "./Auth";

const API = "https://getin-school-production.up.railway.app";

export default function App() {
  const [mode, setMode] = useState("chat");
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: "Hi! I'm your personal college counselor. I'm here to help you build the strongest application possible. Let's start — what's your name and what grade are you in?",
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [form, setForm] = useState({ gpa: "", major: "", dreamCollege: "", achievements: "" });
  
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [collegeSearch, setCollegeSearch] = useState("");
const [collegeResult, setCollegeResult] = useState(null);
const [searchingCollege, setSearchingCollege] = useState(false);
const [scholarships, setScholarships] = useState(null);
const [loadingScholarships, setLoadingScholarships] = useState(false);
const [redditReviews, setRedditReviews] = useState({});
const [loadingReddit, setLoadingReddit] = useState({});
const [professorCollege, setProfessorCollege] = useState("");
const [professorDept, setProfessorDept] = useState("");
const [professors, setProfessors] = useState(null);
const [loadingProfessors, setLoadingProfessors] = useState(false);
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setCheckingAuth(false);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
  }, []);

  async function saveAnalysis(parsed, currentUser) {
    console.log("saveAnalysis called, user:", currentUser?.id);
    if (!currentUser) { console.log("No user - skipping save"); return; }
    const { error: saveError } = await supabase.from("analyses").insert({
      user_id: currentUser.id,
      profile_score: parsed.profileScore,
      profile_summary: parsed.profileSummary,
      colleges: parsed.colleges,
      gaps: parsed.gaps,
      roadmap: parsed.roadmap,
      essay: parsed.essay,
      activities: parsed.activities,
    });
    if (saveError) console.error("Save error:", JSON.stringify(saveError));
    else console.log("Analysis saved to Supabase!");
  }
  async function fetchHistory() {
    setLoadingHistory(true);
    const { data, error } = await supabase
      .from("analyses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (!error) setHistory(data);
    setLoadingHistory(false);
  }
  async function searchCollege() {
  if (!collegeSearch.trim()) return;
  setSearchingCollege(true);
  setCollegeResult(null);
  try {
    const res = await fetch(`${API}/search-college`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: collegeSearch }),
    });
    const data = await res.json();
    setCollegeResult(data);
  } catch (e) {
    alert("Search failed. Please try again.");
  }
  setSearchingCollege(false);
}
async function findScholarships() {
  if (!results) return;
  setLoadingScholarships(true);
  try {
    const profile = `Profile Score: ${results.profileScore}, Summary: ${results.profileSummary}`;
    const res = await fetch(`${API}/scholarships`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile }),
    });
    const data = await res.json();
    setScholarships(data.scholarships);
  } catch (e) {
    alert("Failed to find scholarships. Please try again.");
  }
  setLoadingScholarships(false);
}
async function fetchRedditReviews(collegeName, program) {
  const key = collegeName;
  setLoadingReddit(prev => ({ ...prev, [key]: true }));
  try {
    const res = await fetch(`${API}/reddit-reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ college: collegeName, program: program || "general" }),
    });
    const data = await res.json();
    setRedditReviews(prev => ({ ...prev, [key]: data }));
  } catch (e) {
    alert("Failed to fetch reviews.");
  }
  setLoadingReddit(prev => ({ ...prev, [key]: false }));
}
async function findProfessors() {
  if (!professorCollege.trim() || !professorDept.trim()) return;
  setLoadingProfessors(true);
  setProfessors(null);
  try {
    const res = await fetch(`${API}/professors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ college: professorCollege, department: professorDept }),
    });
    const data = await res.json();
    setProfessors(data.professors);
  } catch (e) {
    alert("Failed to find professors.");
  }
  setLoadingProfessors(false);
}




  async function formSubmit() {
    if (!form.gpa || !form.major || !form.dreamCollege) {
      setError("Please fill in GPA, major, and dream college.");
      return;
    }
    setError("");
    setAnalyzing(true);
    const profile = `GPA: ${form.gpa}, Major: ${form.major}, Dream College: ${form.dreamCollege}, Achievements: ${form.achievements || "Not provided"}${resumeText ? `, Resume: ${resumeText}` : ""}`;
    try {
      const res = await fetch(`${API}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      });
      const data = await res.json();
      const raw = data.result.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1));
      setResults(parsed);
      await saveAnalysis(parsed, user);
    } catch (e) {
      setError("Analysis failed. Please try again.");
    }
    setAnalyzing(false);
  }

  async function uploadResume(selectedFile) {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    try {
      const res = await fetch(`${API}/upload-resume`, { method: "POST", body: formData });
      const data = await res.json();
      setResumeText(data.text);
      setReady(true);
    } catch (e) {
      alert("Resume upload failed.");
    }
    setUploading(false);
  }

  async function sendMessage() {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      const history = newMessages.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content.replace("[READY]", ""),
      }));
      const messageWithResume = resumeText ? `Here is my resume:\n${resumeText}\n\nMy question: ${input}` : input;
      const res = await fetch(`${API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageWithResume, history: history.slice(0, -1) }),
      });
      const data = await res.json();
      const reply = data.reply;
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      if (reply.includes("[READY]")) setReady(true);
    } catch (e) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Something went wrong. Please try again." }]);
    }
    setLoading(false);
  }

  async function runAnalysis() {
    setAnalyzing(true);
    const conversation = (resumeText ? `Resume Content:\n${resumeText}\n\n` : "") +
      messages.map((m) => `${m.role === "assistant" ? "Counselor" : "Student"}: ${m.content.replace("[READY]", "")}`).join("\n");
    try {
      const res = await fetch(`${API}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: conversation }),
      });
      const data = await res.json();
      const raw = data.result.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1));
      setResults(parsed);
      await saveAnalysis(parsed, user);
    } catch (e) {
      alert("Analysis failed. Please try again.");
    }
    setAnalyzing(false);
  }

  function reset() {
    setResults(null);
    setMessages([{ role: "assistant", content: "Hi! I'm your personal college counselor. Let's start over — what's your name and what grade are you in?" }]);
    setReady(false);
    setFile(null);
    setResumeText("");
    setForm({ gpa: "", major: "", dreamCollege: "", achievements: "" });
    setError("");
  }

  if (checkingAuth) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-yellow-400 text-xl">Loading...</div>
    </div>
  );

  if (!user) return <Auth onLogin={setUser} />;

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">

        <header className="border-b border-gray-800 px-4 py-3 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-white">GetIn<span className="text-yellow-400">.School</span></span>
<span className="text-xs text-gray-500 uppercase tracking-widest hidden md:block">AI College Counselor</span>        </div>
        <div className="flex gap-1 items-center flex-wrap">
  <span className="text-xs text-gray-500 mr-2">{user.email}</span>
  {[
    { mode: "chat", label: "💬 Chat" },
    { mode: "form", label: "📋 Form" },
    { mode: "history", label: "🕐 History", onClick: () => { setMode("history"); fetchHistory(); } },
    { mode: "explore", label: "🔍 Explore" },
    { mode: "professors", label: "👨‍🏫 Profs" },
  ].map((btn) => (
    <button
      key={btn.mode}
      onClick={btn.onClick || (() => setMode(btn.mode))}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
        mode === btn.mode ? "bg-yellow-400 text-gray-900" : "bg-gray-800 text-gray-400"
      }`}
    >
      {btn.label}
    </button>
  ))}
  <button
    onClick={async () => { await supabase.auth.signOut(); setUser(null); reset(); }}
    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-800 text-red-400 transition-all"
  >
    Sign Out
  </button>
</div>

       
      </header>
      {/* PROFESSORS MODE */}
{mode === "professors" && !results && (
  <div className="max-w-3xl mx-auto px-4 pb-12">
    <h2 className="text-2xl font-bold mb-2">👨‍🏫 Professor Search</h2>
    <p className="text-gray-400 mb-6">Find professors at your target colleges to reach out for research opportunities.</p>

    <div className="flex flex-col gap-3 mb-8">
      <input
        value={professorCollege}
        onChange={(e) => setProfessorCollege(e.target.value)}
        placeholder="College name... e.g. MIT, Stanford"
        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-yellow-400 transition-all"
      />
      <input
        value={professorDept}
        onChange={(e) => setProfessorDept(e.target.value)}
        placeholder="Department... e.g. Computer Science, Machine Learning"
        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-yellow-400 transition-all"
      />
      <button
        onClick={findProfessors}
        disabled={loadingProfessors}
        className="w-full py-3 bg-yellow-400 text-gray-900 font-bold rounded-xl hover:bg-yellow-300 transition-all"
      >
        {loadingProfessors ? "Searching..." : "🔍 Find Professors"}
      </button>
    </div>

    {loadingProfessors && (
      <div className="text-center text-yellow-400 py-8">Finding professors...</div>
    )}

    {professors && professors.length === 0 && (
      <div className="bg-gray-900 rounded-2xl p-8 text-center text-gray-400">
        No professors found. Try a different college or department.
      </div>
    )}

    {professors && professors.length > 0 && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {professors.map((p, i) => (
          <div key={i} className="bg-gray-900 p-5 rounded-xl border border-gray-800">
            <div className="font-bold text-lg mb-1">{p.name}</div>
            <div className="text-xs text-gray-500 mb-2">
              {p.affiliations?.slice(0,2).join(" · ")}
            </div>
            <div className="flex gap-3 mb-3">
              <div className="text-center">
                <div className="text-yellow-400 font-bold">{p.h_index}</div>
                <div className="text-xs text-gray-500">h-index</div>
              </div>
              <div className="text-center">
                <div className="text-yellow-400 font-bold">{p.citation_count?.toLocaleString()}</div>
                <div className="text-xs text-gray-500">citations</div>
              </div>
              <div className="text-center">
                <div className="text-yellow-400 font-bold">{p.paper_count}</div>
                <div className="text-xs text-gray-500">papers</div>
              </div>
            </div>
            {p.recent_papers?.length > 0 && (
              <div className="mb-3">
                <div className="text-xs text-yellow-400 uppercase tracking-wider mb-1">Recent Papers</div>
                {p.recent_papers.slice(0,2).map((paper, j) => (
                  <p key={j} className="text-xs text-gray-400 mb-1">• {paper}</p>
                ))}
              </div>
            )}
            
              
<a href={p.profile_url}
  target="_blank"
  rel="noreferrer"
  className="text-xs text-yellow-400 hover:underline"
>
  View Profile →
</a>
          </div>
        ))}
      </div>
    )}
  </div>
)}
      {/* EXPLORE MODE */}
{mode === "explore" && !results && (
  <div className="max-w-3xl mx-auto px-4 pb-12">
    <h2 className="text-2xl font-bold mb-2">🔍 College Explorer</h2>
    <p className="text-gray-400 mb-6">Search any college to see real stats, programs, and campus info.</p>

    {/* Search bar */}
    <div className="flex gap-3 mb-8">
      <input
        value={collegeSearch}
        onChange={(e) => setCollegeSearch(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && searchCollege()}
        placeholder="Search a college... e.g. MIT, Stanford, UCLA"
        className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-yellow-400 transition-all"
      />
      <button
        onClick={searchCollege}
        disabled={searchingCollege}
        className="px-6 py-3 bg-yellow-400 text-gray-900 font-bold rounded-xl hover:bg-yellow-300 transition-all"
      >
        {searchingCollege ? "..." : "Search"}
      </button>
    </div>

    {/* Result card */}
    {searchingCollege && (
      <div className="text-center text-yellow-400 py-8">Searching...</div>
    )}

    {collegeResult && (
      <div className="bg-gray-900 rounded-2xl p-6">
        <h3 className="text-2xl font-bold mb-1">{collegeResult.name}</h3>
        <p className="text-gray-400 text-sm mb-6">{collegeResult.campus_vibe}</p>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <div className="text-yellow-400 font-bold text-xl">{collegeResult.admission_rate}</div>
            <div className="text-xs text-gray-400 mt-1">Acceptance Rate</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <div className="text-yellow-400 font-bold text-xl">{collegeResult.tuition}</div>
            <div className="text-xs text-gray-400 mt-1">Tuition</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <div className="text-yellow-400 font-bold text-xl">{collegeResult.size}</div>
            <div className="text-xs text-gray-400 mt-1">Students</div>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="text-xs text-yellow-400 uppercase tracking-wider mb-2">Known For</div>
            <p className="text-sm text-gray-300">{collegeResult.known_for}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="text-xs text-yellow-400 uppercase tracking-wider mb-2">Ranking</div>
            <p className="text-sm text-gray-300">{collegeResult.ranking}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="text-xs text-yellow-400 uppercase tracking-wider mb-2">Best Programs</div>
            <div className="flex flex-wrap gap-2">
              {collegeResult.best_programs?.map((p, i) => (
                <span key={i} className="text-xs bg-gray-700 px-2 py-1 rounded-full text-gray-300">{p}</span>
              ))}
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="text-xs text-yellow-400 uppercase tracking-wider mb-2">Notable Alumni</div>
            <p className="text-sm text-gray-300">{collegeResult.notable_alumni}</p>
          </div>
        </div>
      </div>
    )}
  </div>
)}
      {/* HISTORY MODE */}
{mode === "history" && !results && (
  <div className="max-w-3xl mx-auto px-4 pb-12">
    <h2 className="text-2xl font-bold mb-6">🕐 Your Past Analyses</h2>
    {loadingHistory && <p className="text-yellow-400 text-center">Loading...</p>}
    {!loadingHistory && history.length === 0 && (
      <div className="bg-gray-900 rounded-2xl p-8 text-center text-gray-400">
        No analyses yet. Run your first analysis!
      </div>
    )}
    <div className="flex flex-col gap-4">
      {history.map((h, i) => (
        <div
          key={i}
          onClick={() => {
  setResults({
    profileScore: h.profile_score,
    profileSummary: h.profile_summary,
    colleges: h.colleges,
    gaps: h.gaps,
    roadmap: h.roadmap,
    essay: h.essay,
    activities: h.activities,
  });
}}
          className="bg-gray-900 p-5 rounded-xl border border-gray-800 hover:border-yellow-400 cursor-pointer transition-all"
        >
          <div className="flex justify-between items-center mb-2">
            <div className="text-yellow-400 font-bold text-2xl">{h.profile_score}</div>
            <div className="text-xs text-gray-500">{new Date(h.created_at).toLocaleDateString()}</div>
          </div>
          <p className="text-sm text-gray-300 mb-2">{h.profile_summary}</p>
          <div className="flex gap-2 flex-wrap">
            {h.colleges?.slice(0, 3).map((c, j) => (
              <span key={j} className={`text-xs px-2 py-1 rounded-full ${c.type === "reach" ? "bg-red-950 text-red-300" : c.type === "match" ? "bg-yellow-950 text-yellow-300" : "bg-green-950 text-green-300"}`}>
                {c.name}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
)}

      {!results && (
        <div className="text-center py-12 px-4">
          <h1 className="text-5xl font-bold mb-4">Your AI College <span className="text-yellow-400">Counselor</span></h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">Chat with our AI advisor or upload your resume. Get a personalized college list, gap analysis, roadmap, and essay draft in 60 seconds.</p>
        </div>
      )}

      {mode === "form" && !results && (
        <div className="max-w-2xl mx-auto px-4 pb-8">
          <div className="bg-gray-900 rounded-2xl p-8 flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">GPA</label>
              <input type="text" placeholder="e.g. 3.8" value={form.gpa} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-yellow-400 transition-all" onChange={(e) => setForm({ ...form, gpa: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Major</label>
              <input type="text" placeholder="e.g. Computer Science" value={form.major} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-yellow-400 transition-all" onChange={(e) => setForm({ ...form, major: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Dream College</label>
              <input type="text" placeholder="e.g. MIT, Stanford" value={form.dreamCollege} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-yellow-400 transition-all" onChange={(e) => setForm({ ...form, dreamCollege: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Achievements & Activities</label>
              <textarea placeholder="e.g. President of coding club, 2 internships, built 3 projects..." rows={4} value={form.achievements} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-yellow-400 transition-all resize-none" onChange={(e) => setForm({ ...form, achievements: e.target.value })} />
            </div>
            <div>
              <label className="flex items-center justify-center gap-3 p-4 border-2 border-dashed border-gray-700 rounded-xl cursor-pointer hover:border-yellow-400 transition-all">
                <span className="text-2xl">📄</span>
                <div>
                  <div className="font-medium text-sm">{file ? file.name : "Upload resume (optional)"}</div>
                  <div className="text-xs text-gray-500">PDF only</div>
                </div>
                <input type="file" accept=".pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setFile(f); uploadResume(f); } }} />
              </label>
              {uploading && <p className="text-yellow-400 text-xs mt-2 text-center">Reading your resume...</p>}
              {file && !uploading && <p className="text-green-400 text-xs mt-2 text-center">✅ {file.name} uploaded!</p>}
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button onClick={formSubmit} disabled={analyzing} className="w-full py-4 bg-yellow-400 text-gray-900 font-bold rounded-xl hover:bg-yellow-300 transition-all text-lg">
              {analyzing ? "Analyzing your profile..." : "🎓 Generate My Analysis"}
            </button>
          </div>
        </div>
      )}

      {mode === "chat" && !results && (
        <div className="max-w-2xl mx-auto px-4 pb-8">
          {!file && (
            <div className="mb-4">
              <label className="flex items-center justify-center gap-3 p-4 border-2 border-dashed border-gray-700 rounded-xl cursor-pointer hover:border-yellow-400 transition-all">
                <span className="text-2xl">📄</span>
                <div>
                  <div className="font-medium text-sm">Upload your resume (optional)</div>
                  <div className="text-xs text-gray-500">PDF only — auto fills your profile</div>
                </div>
                <input type="file" accept=".pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setFile(f); uploadResume(f); } }} />
              </label>
            </div>
          )}
          {uploading && <div className="mb-4 text-center text-yellow-400 text-sm">Reading your resume...</div>}
          {file && !uploading && (
            <div className="mb-4">
              <div className="flex items-center gap-2 p-3 bg-green-950 border border-green-700 rounded-xl text-sm">
                <span>✅</span>
                <span className="text-green-400">{file.name} uploaded successfully!</span>
              </div>
            </div>
          )}
          <div className="bg-gray-900 rounded-2xl p-6 h-96 overflow-y-auto flex flex-col gap-4 mb-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl text-sm leading-relaxed ${m.role === "user" ? "bg-yellow-400 text-gray-900 rounded-br-sm" : "bg-gray-800 text-gray-100 rounded-bl-sm"}`}>
                  {m.content.replace("[READY]", "")}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></span>
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          {ready && (
            <button onClick={runAnalysis} disabled={analyzing} className="w-full mb-4 py-3 bg-yellow-400 text-gray-900 font-bold rounded-xl hover:bg-yellow-300 transition-all">
              {analyzing ? "Analyzing your profile..." : "🎓 Generate My Full Analysis"}
            </button>
          )}
          <div className="flex gap-3">
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder="Type your message..." className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-yellow-400 transition-all" />
            <button onClick={sendMessage} disabled={loading} className="px-6 py-3 bg-yellow-400 text-gray-900 font-bold rounded-xl hover:bg-yellow-300 transition-all">Send</button>
          </div>
        </div>
      )}

      {results && (
        <div className="max-w-4xl mx-auto px-4 pb-12">
          <div className="text-center mb-10">
            <div className="text-7xl font-bold text-yellow-400 mb-2">{results.profileScore}</div>
            <div className="text-gray-400 mb-3">Profile Score</div>
            <p className="text-gray-300 max-w-2xl mx-auto">{results.profileSummary}</p>
          </div>

<h2 className="text-xl font-bold mb-4">🎓 Your College List</h2>
{["reach", "match", "safety"].map((type) => (
  <div key={type} className="mb-8">
    <h3 className={`text-sm font-bold uppercase tracking-wider mb-3 ${type === "reach" ? "text-red-400" : type === "match" ? "text-yellow-400" : "text-green-400"}`}>
      {type === "reach" ? "🔴 Reach" : type === "match" ? "🟡 Match" : "🟢 Safety"}
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {results.colleges?.filter(c => c.type === type).map((c, i) => (
        <div key={i} className={`p-5 rounded-xl border ${type === "reach" ? "border-red-500 bg-red-950" : type === "match" ? "border-yellow-500 bg-yellow-950" : "border-green-500 bg-green-950"}`}>
          <div className="font-bold text-lg mb-1">{c.name}</div>
          <div className="text-sm text-gray-300 mb-1">📊 Acceptance: {c.admission_rate}</div>
          <div className="text-sm text-gray-300 mb-2">💰 Tuition: {c.tuition}</div>
          <div className="text-sm text-gray-400 mb-3">{c.match}</div>
          <button
            onClick={() => fetchRedditReviews(c.name, results.gaps?.[0]?.factor)}
            disabled={loadingReddit[c.name]}
            className="w-full py-2 text-xs bg-orange-950 border border-orange-700 text-orange-400 rounded-lg hover:bg-orange-900 transition-all"
          >
            {loadingReddit[c.name] ? "Loading..." : "🔴 Reddit Reviews"}
          </button>
          {redditReviews[c.name] && (
            <div className="mt-3 pt-3 border-t border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-yellow-400 font-bold">{"⭐".repeat(redditReviews[c.name].rating)}</span>
                <span className="text-xs text-gray-400">{redditReviews[c.name].overall_sentiment}</span>
              </div>
              <p className="text-xs text-gray-300 mb-2">{redditReviews[c.name].summary}</p>
              <div className="text-xs text-green-400 mb-1">✅ {redditReviews[c.name].pros?.slice(0,2).join(" · ")}</div>
              <div className="text-xs text-red-400">❌ {redditReviews[c.name].cons?.slice(0,2).join(" · ")}</div>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
))}

          <h2 className="text-xl font-bold mb-4">📊 Gap Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            {results.gaps?.map((g, i) => (
              <div key={i} className="bg-gray-900 p-5 rounded-xl">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">{g.factor}</span>
                  <span className="text-yellow-400 font-bold">{g.score}/100</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                  <div className="bg-yellow-400 h-2 rounded-full transition-all" style={{ width: `${g.score}%` }}></div>
                </div>
                <p className="text-sm text-gray-400">{g.advice}</p>
              </div>
            ))}
          </div>

          <h2 className="text-xl font-bold mb-4">🗺️ Your Roadmap</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            {results.roadmap?.map((r, i) => (
              <div key={i} className="bg-gray-900 p-5 rounded-xl">
                <div className="text-3xl mb-2">{r.emoji}</div>
                <div className="text-xs text-yellow-400 uppercase tracking-wider mb-1">{r.phase}</div>
                <div className="font-bold mb-2">{r.title}</div>
                <p className="text-sm text-gray-400">{r.tasks}</p>
              </div>
            ))}
          </div>

          <h2 className="text-xl font-bold mb-4">✍️ Your Personal Statement</h2>
          <div className="bg-gray-900 p-6 rounded-xl mb-10">
            <p className="text-gray-300 leading-relaxed whitespace-pre-line">{results.essay}</p>
          </div>

          <h2 className="text-xl font-bold mb-4">🏆 Recommended Activities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            {results.activities?.map((a, i) => (
              <div key={i} className="bg-gray-900 p-5 rounded-xl">
                <div className="text-3xl mb-2">{a.emoji}</div>
                <div className="font-bold mb-1">{a.title}</div>
                <p className="text-sm text-gray-400 mb-2">{a.why}</p>
                <p className="text-sm text-yellow-400">{a.impact}</p>
              </div>
            ))}
          </div>
          {/* Scholarships */}
<h2 className="text-xl font-bold mb-4">🎓 Scholarships For You</h2>
{!scholarships && (
  <button
    onClick={findScholarships}
    disabled={loadingScholarships}
    className="w-full py-3 bg-gray-800 border border-yellow-400 text-yellow-400 font-bold rounded-xl hover:bg-yellow-400 hover:text-gray-900 transition-all mb-8"
  >
    {loadingScholarships ? "Finding scholarships..." : "🔍 Find My Scholarships"}
  </button>
)}
{scholarships && (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
    {scholarships.map((s, i) => (
      <div key={i} className="bg-gray-900 p-5 rounded-xl border border-gray-800">
        <div className="flex justify-between items-start mb-2">
          <div className="font-bold">{s.name}</div>
          <div className="text-yellow-400 font-bold text-sm">{s.amount}</div>
        </div>
        <div className="text-xs text-gray-500 mb-2">📅 Deadline: {s.deadline}</div>
        <p className="text-sm text-gray-400 mb-2">{s.description}</p>
       <p className="text-sm text-green-400 mb-3">✅ {s.match_reason}</p>
        
         <a  href={s.apply_url}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-yellow-400 hover:underline"
        >
          Apply Now →
        </a>
      </div>
    ))}
  </div>
)}

          <button onClick={reset} className="w-full py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-all">Start Over</button>
        </div>
      )}
    </div>
  );
}
